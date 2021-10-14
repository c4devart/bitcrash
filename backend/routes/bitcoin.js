var express = require('express');
var router = express.Router();
var config = require('./../src/config')
var btcDepositAddressModel = require('./model/btc_deposit_address')
var userModel = require('./model/user')
var txnModel = require('./model/txn')
var variableModel = require('./model/variable');
var request = require('request');
var bitcoin = require("bitcoinjs-lib");
var bigi    = require("bigi");
var buffer  = require('buffer');
router.post('/get_deposit_address', function (req, res , next) {
    var who = req.body.who;
    if( parseInt(who) == 0) {
        var resp = {
            code: 401,
            status: 'failed',
            message: 'You should log in first.',
            res: null
        };
        return res.json(resp);
    }
    btcDepositAddressModel.getDepositAddressData({who: who}, function (err, modelResult) {
        if(err) {
            var resp = {
                code: 401,
                status: 'failed',
                message: null,
                res: null
            };
            return res.json(resp);
        } else {
            if(modelResult.length > 0){
                var resp = {
                    code: 20000,
                    status: 'success',
                    message: null,
                    res: modelResult.content.INPUT_ADDRESS
                };
                return res.json(resp);
            } else {
                var params = {
                    "destination" : config.BTC_SITE_WALLET_ADDRESS,
                    "callback_url" : config.BLOCKCYPHER_CALLBACK_HOST_URL + "api/btc/deposit/" + who
                };
                var options = {
                    method: 'POST',
                    url: 'https://api.blockcypher.com/v1/btc/main/payments?token=' + config.BLOCKCYPHER_TOKEN,
                    body: params,
                    json: true
                };
                request(options , function(err, response, apiResult) {
                    btcDepositAddressModel.insertNewDepositAddress({who:who, input_address:apiResult.input_address, destination:apiResult.destination, input_address_id:apiResult.id} , function(err , subModelResult) {
                        if (err) {
                            var resp = {
                                code: 401,
                                status: 'failed',
                                message: null,
                                res: null
                            };
                            return res.json(resp);
                        } else {
                            var resp = {
                                code: 20000,
                                status: 'success',
                                message: null,
                                address: apiResult.input_address
                            };
                            return res.json(resp);
                        }
                    })
                });
            }
        }
    })
})

router.post('/deposit/:who', async function(req, res, next) {
    var who = req.params.who;
    var satoshi_amount = req.body.value;
    var amount = satoshi_amount / Math.pow(10, 8);
    //The transaction hash representing the initial payment to the input_address.
    var tx_hash = req.body.input_transaction_hash;
    //The transaction hash of the generated transaction that forwards the payment from the input_address to the destination.
    var destination_txhash = req.body.transaction_hash;

    var options = {
        method: 'GET',
        url: 'https://api.blockcypher.com/v1/btc/main/txs/' + destination_txhash
    };

    request(options, function (error, response, body) {
        if (error) {
            var resp = {
                code: 401,
                status: 'failed',
                message: null,
                res: null
            };
            return res.json(resp);
        } else {

            userModel.updateBalance({who: who, amount: amount}, function(err, modelResult) {
                if (!err) {
                    var txnData = {
                        who : who,
                        type : 1,
                        amount : amount,
                        fees : 0,
                        detail : tx_hash,
                        txhash : destination_txhash
                    }
                    txnModel.insertTxn(txnData , function(err , subModelResult) {
                        if (err) {
                            var resp = {
                                code: 401,
                                status: 'failed',
                                message: null,
                                res: null
                            };
                            return res.json(resp);
                        } else {
                            var deposit_new_id = subModelResult.content.insertId;
                            txnModel.checkFirstDeposit(who)
                            .then((check_result) => {
                                if(!check_result) {
                                    var resp = { code: 20000, status: 'success', message: null, res: null };
                                    return res.json(resp);
                                }
                                //get my parent referral code
                                userModel.getParentReferralCode(who)
                                .then((my_parent_referral) => {
                                    if(my_parent_referral['REFERRAL_CODE_P'] == '' || my_parent_referral['REFERRAL_CODE_P'] == null)  {
                                        var resp = {
                                            code: 20000,
                                            status: 'success',
                                            message: null,
                                            res: null
                                        };
                                        return res.json(resp);
                                    }
                                    //get my parent userid using parent referral code
                                    userModel.getUseridByParentReferralCode(my_parent_referral['REFERRAL_CODE_P'])
                                    .then((parent_user_id) => {
                                        //get referral percentage from database
                                        variableModel.getReferralPercentage()
                                        .then((referral_value) => {
                                            var referral_amount = parseInt(amount * Math.pow(10 , 6)) * referral_value / 100
                                            referral_amount = parseInt(referral_amount)
                                            if(referral_amount == 0) {
                                                var resp = { code: 20000, status: 'success', message: null, res: null };
                                                return res.json(resp);
                                            }
                                            //update parent-user balance
                                            userModel.updateUserBalance({who: parent_user_id, amount: referral_amount})
                                            .then((ret) => {
                                                //update admin balance
                                                userModel.updateAdminBalance({who: 1, amount: referral_amount})
                                                .then((ret1) => {
                                                    var txnData1 = {
                                                        who : parent_user_id,
                                                        type : 3,
                                                        amount : parseFloat(amount * referral_value / 100).toFixed(8),
                                                        fees : referral_value,
                                                        detail : deposit_new_id,
                                                        txhash : my_parent_referral['REFERRAL_CODE']
                                                    }
                                                    txnModel.insertTxn(txnData1 , function(err , subModelResult) {
                                                        if (err) {
                                                            var resp = { code: 401, status: 'failed', message: null, res: null };
                                                            return res.json(resp);
                                                        } else {
                                                            var resp = {
                                                                code: 20000,
                                                                status: 'success',
                                                                message: null,
                                                                res: null
                                                            };
                                                            return res.json(resp);
                                                        }
                                                    });
                                                })
                                                .catch((err) => {
                                                    var resp = { code: 401, status: 'failed', message: null, res: null };
                                                    return res.json(resp);
                                                })
                                            })
                                            .catch((err) => {
                                                var resp = { code: 401, status: 'failed', message: null, res: null };
                                                return res.json(resp);
                                            })
                                        })
                                        .catch((err) => {
                                            var resp = { code: 401, status: 'failed', message: null, res: null };
                                            return res.json(resp);
                                        })
                                    })
                                    .catch((err) => {
                                        var resp = { code: 401, status: 'failed', message: null, res: null };
                                        return res.json(resp);
                                    })
                                })
                                .catch((err) => {
                                    var resp = { code: 401, status: 'failed', message: null, res: null };
                                    return res.json(resp);
                                })
                            })
                            .catch((err) => {
                                var resp = {
                                    code: 401,
                                    status: 'failed',
                                    message: null,
                                    res: null
                                };
                                return res.json(resp);
                            })
                        }
                    });
                }
                else {
                    var resp = {
                        code: 401,
                        status: 'failed',
                        message: null,
                        res: null
                    };
                    return res.json(resp);
                }
            });

        }
    });
})
router.post('/withdraw_confirm', function(req, res, next) {
    var who = req.body.who;
    var withdraw_id = req.body.withdraw_id;
    txnModel.confirmWithdraw(who , withdraw_id)
    .then((result) => {
        res.json({
            code: 20000, status: 'success',
            msg : null,
            data: null
        });
    })
    .catch((err) => {
        res.json({
            code: 401, status: 'failed',
            msg : 'Api request failed.',
            data: null
        });
    })
})
router.post('/withdraw_request', function(req, res, next) {
    var who = req.body.who;
    var to_address = req.body.to_address;
    var amount = parseFloat(req.body.amount);
    var amount_coins = parseInt(amount * Math.pow(10, 6));
    userModel.getUserBalance({who: who} , function(err , modelResult) {
        var userBalance = 0;
        if(modelResult.content.hasOwnProperty('WALLET')) {
            userBalance = modelResult.content.WALLET;
        }
        if(userBalance < amount_coins) {
            res.json({
                code: 401, status: 'failed',
                msg : 'Your balance is insufficient. You can\'t withdraw now.',
                data: null
            });
            return;
        }
        variableModel.getWithdrawalFee()
        .then((withdraw_fee) => {
            var calc_fee = parseFloat(amount * withdraw_fee / 100).toFixed(8);
            txnModel.requestWithdraw(who , amount , amount_coins , to_address , calc_fee)
            .then((result) => {
                res.json({
                    code: 20000, status: 'success',
                    msg : null,
                    data: {
                        available_amount: userBalance - amount_coins
                    }
                });
            })
            .catch((err) => {
                res.json({
                    code: 401, status: 'failed',
                    msg : 'Api request failed.',
                    data: null
                });
            })
        })
        .catch((err) => {
            res.json({
                code: 401, status: 'failed',
                msg : 'Api request failed.',
                data: null
            });
        })
    })
})
router.post('/withdraw' , function(req, res, next) {
    var who = req.body.who;
    var to_address = req.body.to_address;
    var amount = parseFloat(req.body.amount);
    var amount_coins = parseInt(Math.pow(10 , 6) * amount);
    var rem_amount = -1 * amount;
    var return_data = true;

    if(amount >= config.BTC_min_withdraw_amount) {
        if(return_data == true) {
            var check_user_balance = new Promise(function(check_user_balance_resolve, check_user_balance_reject) {
                userModel.getUserBalance({who: who} , function (err, modelResult) {
                    var available_balance = 0;
                    if(modelResult.content.hasOwnProperty('WALLET')) {
                        available_balance = modelResult.content.WALLET;
                    }
                    if(available_balance < amount_coins){
                        check_user_balance_resolve(false);
                    }else{
                        check_user_balance_resolve(true);
                    }
                })
            });

            check_user_balance.then(function(result) {
                return_data = result;
                if(return_data == true) {
                    var check_to_address_exists = new Promise(function(check_to_address_exists_resolve, check_to_address_exists_reject) {
                        var options = {
                            method: 'GET',
                            url: 'https://api.blockcypher.com/v1/btc/main/addrs/' + to_address,
                            json: true
                        };
                        request(options, function (err, response, apiResult) {
                            if(err){
                                check_to_address_exists_resolve(false);
                            }else{
                                check_to_address_exists_resolve(true);
                            }
                        });
                    });
                    check_to_address_exists.then(function(result) {
                        return_data = result;
                        if(return_data == true) {
                            var check_with_deposit_address = new Promise(function(check_with_deposit_address_resolve, check_with_deposit_address_reject) {
                                btcDepositAddressModel.getDepositAddressData({who: who}, function (err, modelResult) {
                                    if(err){
                                        check_with_deposit_address_resolve(false);
                                    }else{
                                        if(modelResult.length == 0){
                                            check_with_deposit_address_resolve(true);
                                        }else{
                                            if(modelResult.content.input_address == to_address){
                                                check_with_deposit_address_resolve(false);
                                            }else{
                                                check_with_deposit_address_resolve(true);
                                            }
                                        }
                                    }
                                })
                            });

                            check_with_deposit_address.then(function(result) {
                                return_data = result;
                                if(return_data == true) {
                                    if(config.BTC_SITE_WALLET_ADDRESS == to_address) {
                                        res.json({
                                            code: 401,
                                            status: 'failed',
                                            msg : "blocked address"
                                        });
                                    }
                                    else {
                                        var update_wallet = new Promise(function(update_wallet_resolve, update_wallet_reject) {
                                            usersModel.updateBalance({who: who, amount: rem_amount}, function (err, modelResult) {
                                                if(err){
                                                    update_wallet_resolve(false);
                                                }else{
                                                    update_wallet_resolve(true);
                                                }
                                            })
                                        });
                                        update_wallet.then(function(result) {
                                            return_data = result;
                                            if(return_data == true) {

                                                var send_txn = new Promise(function(send_txn_resolve) {
                                                    var send_amount = amount - config.BTC_withdraw_fee;
                                                    var satoshi_amount = send_amount * Math.pow(10, 8);
                                                    var satoshi_fee = config.BTC_withdraw_fee * Math.pow(10, 8);
                                                    var newtx = {
                                                        inputs: [{addresses: [config.BTC_SITE_WALLET_ADDRESS]}],
                                                        outputs: [{addresses: [to_address], value: satoshi_amount}],
                                                        fees: satoshi_fee
                                                    };
                                                    var keys = new bitcoin.ECPair(bigi.fromHex(config.BTC_SITE_PRIVATE_KEY));
                                                    var options = {
                                                        method: 'POST',
                                                        url: 'https://api.blockcypher.com/v1/bcy/test/txs/new',
                                                        body: newtx,
                                                        json: true
                                                    };

                                                    request(options, function (err, response, tx) {
                                                        if(err) {
                                                            send_txn_resolve(false);
                                                        } else {
                                                            tx.pubkeys = [];
                                                            tx.signatures = tx.tosign.map(function (tosign, n) {
                                                                tx.pubkeys.push(keys.getPublicKeyBuffer().toString("hex"));
                                                                return keys.sign(new buffer.Buffer(tosign, "hex")).toDER().toString("hex");
                                                            });
                                                            var options = {
                                                                method: 'POST',
                                                                url: 'https://api.blockcypher.com/v1/bcy/test/txs/send',
                                                                body: tx,
                                                                json: true
                                                            };
                                                            request(options, function (err, response, finaltx) {
                                                                if (err){
                                                                    send_txn_resolve(false);
                                                                }else{
                                                                    if (finaltx.errors){
                                                                        send_txn_resolve(false);
                                                                    }else{
                                                                        send_txn_resolve(finaltx.tx.hash);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                });

                                                send_txn.then(function(result) {
                                                    if(result) {
                                                        var txHash = result;
                                                        var txnData = {
                                                            who : who,
                                                            type : 2,
                                                            amount : amount,
                                                            fees : config.BTC_withdraw_fee,
                                                            detail : to_address,
                                                            txhash : txHash
                                                        }
                                                        txnModel.insertTxn(txnData , function(err , subModelResult) {
                                                            if (err) {
                                                                var resp = {
                                                                    code: 401,
                                                                    status: 'failed',
                                                                    message: null,
                                                                    res: null
                                                                };
                                                                return res.json(resp);
                                                            } else {
                                                                var resp = {
                                                                    code: 20000,
                                                                    status: 'success',
                                                                    message: null,
                                                                    res: txHash
                                                                };
                                                                return res.json(resp);
                                                            }
                                                        });
                                                    } else {
                                                        res.json({
                                                            code: 401,
                                                            status: 'failed',
                                                            msg : "service limited"
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({
                                                    code: 401,
                                                    status: 'failed',
                                                    msg : "service limited"
                                                });
                                            }
                                        });
                                    }
                                } else if(return_data == false) {
                                    res.json({
                                        code: 401,
                                        status: 'failed',
                                        msg : "disabled address"
                                    });
                                } else {
                                    res.json({
                                        code: 401,
                                        status: 'failed',
                                        msg : "service limited"
                                    });
                                }
                            });
                        } else {
                            res.json({
                                code: 401,
                                status: 'failed',
                                msg : "invalid address"
                            });
                        }
                    });
                }
            });
        }
    } else {
        res.json({
            code: 401,
            status: 'failed',
            msg : "amount should be larger than " + config.BTC_min_withdraw_amount
        });
    }
})

router.post('/withdraw_log', async function (req, res) {
    const { start_date, end_date, page, limit } = req.body
    var i_page = isNaN(parseInt(page)) ? 1 : parseInt(page)
    var i_limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit)
    var ret = await txnModel.getWithdrawLog(start_date, end_date, i_page, i_limit)
    return res.json({
        code: 20000,
        data: ret
    });
})

router.post('/deposit_log', async function (req, res) {
    const { start_date, end_date, page, limit } = req.body
    var i_page = isNaN(parseInt(page)) ? 1 : parseInt(page)
    var i_limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit)
    var ret = await txnModel.getDepositLog(start_date, end_date, i_page, i_limit)
    return res.json({
        code: 20000,
        data: ret
    });
})

router.post('/referral_log', async function (req, res) {
    const { user_id, page, start_date, end_date, limit, txhash } = req.body
    var i_page = isNaN(parseInt(page)) ? 1 : parseInt(page)
    var i_limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit)
    var ret = await txnModel.getReferralLog(user_id, txhash, start_date, end_date, i_page, i_limit)
    return res.json({
        code: 20000,
        data: ret
    });
})

router.post('/is_withdraw', async function(req, res) {
    try {
        var ret = await txnModel.isWithdrawRequest();    
        return res.json({
            code: 20000,
            data: ret,
            msg : null,
            status: 'success'
        });      
    } catch(error) {
        res.json({
            code: 401,
            status: 'failed',
            msg : "Api Request Failed."
        });   
    }
})

module.exports = router;