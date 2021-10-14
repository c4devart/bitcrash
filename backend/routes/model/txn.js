var db = require('./../../utils/database');

exports.insertTxn = function (insertData, callback) {
    var timestamp = Math.floor(Date.now() / 1000);
    var amount_coins = parseInt(Math.pow(10 , 6) * insertData.amount);
    var insertQuery =
    "INSERT INTO deposit_withdraw_log ( " +
    " `USER_ID`, " +
    "`TYPE`, " +
    "`AMOUNT_BTC`, " +
    "`AMOUNT_COINS`, " +
    "`FEE`, " +
    "`DETAIL`, " +
    "`TXHASH`, " +
    "`STATUS`, " +
    "`CREATE_TIME`, " +
    "`UPDATE_TIME`) " +
    "VALUES ('" +
    insertData.who + "', '" +
    insertData.type + "', '" +
    insertData.amount + "', '" +
    amount_coins + "', '" +
    insertData.fees + "', '" +
    insertData.detail + "', '" +
    insertData.txhash + "', 0 , " +
    timestamp + ", " +
    timestamp + ")";

    db.con.query(insertQuery, function (err, rows, fields) {
        if (err) {
            return callback(err, null);
        }
        var return_data = {
            res: true,
            content: rows
        }
        return callback(null, return_data);
    });
}

exports.checkFirstDeposit = function(user_id) {
    var query = "SELECT * " +
    "FROM deposit_withdraw_log " +
    "WHERE USER_ID = " + user_id +
    " AND `TYPE` = 1 ";

    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err)
                reject(err);
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                if(result.length < 2)
                    resolve(true)
                else
                    resolve(true)
            }
        });
    });
}
exports.confirmWithdraw = function(who , withdraw_id) {
    return new Promise((resolve , reject) => {
        /* Begin transaction */
        db.con.getConnection(function(err , conn) {
            if(err)
                reject(err);
            else {
                conn.beginTransaction(function(err) {
                    if(err)
                        reject(err);
                    else {
                        conn.query("select * from deposit_withdraw_log where ID = " + withdraw_id , function(err , result , fields) {
                            if(err) {
                                reject(err);
                            }
                            else {
                                result = JSON.stringify(result);
                                result = JSON.parse(result);
                                var withdrawal_amount = parseInt(result[0].AMOUNT_COINS + result[0].FEE * Math.pow(10 , 6))
                                conn.query("UPDATE users SET WALLET_BLOCK = WALLET_BLOCK - " + withdrawal_amount + " WHERE ID = " + who, function(err , result) {
                                    if(err) {
                                        conn.rollback(function() {
                                            reject(err);
                                        });
                                    }
                                    else {
                                        conn.query("UPDATE deposit_withdraw_log SET STATUS = 1 WHERE ID = " + withdraw_id , function(err , result) {
                                            if(err) {
                                                conn.rollback(function() {
                                                    reject(err);
                                                });
                                            }
                                            else {
                                                conn.commit(function(err) {
                                                    if (err) {
                                                        conn.rollback(function() {
                                                            reject(err);
                                                        });
                                                    }
                                                    else {
                                                        conn.end();
                                                        resolve(true);
                                                    }
                                                });
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }
                })
            }
        });
    })
}
exports.requestWithdraw = function(who, amount, amount_coins, to_address, fee) {
    return new Promise((resolve , reject) => {
        /* Begin transaction */
        db.con.getConnection(function(err , conn) {
            if(err)
                reject(err);
            else {
                conn.beginTransaction(function(err) {
                    if(err)
                        reject(err);
                    else {
                        conn.query("UPDATE users SET WALLET = WALLET - " + amount_coins + ", WALLET_BLOCK = WALLET_BLOCK + " + amount_coins + " WHERE ID = " + who, function(err , result) {
                            if(err) {
                                conn.rollback(function() {
                                    reject(err);
                                });
                            }
                            else {
                                var timestamp = Math.floor(Date.now() / 1000);
                                var real_amount_btc = amount - fee;
                                var real_amount_coins = parseInt(real_amount_btc * Math.pow(10, 6));
                                var insertQuery =
                                    "INSERT INTO deposit_withdraw_log ( " +
                                    " `USER_ID`, " +
                                    "`TYPE`, " +
                                    "`AMOUNT_BTC`, " +
                                    "`AMOUNT_COINS`, " +
                                    "`FEE`, " +
                                    "`DETAIL`, " +
                                    "`TXHASH`, " +
                                    "`STATUS`, " +
                                    "`CREATE_TIME`, " +
                                    "`UPDATE_TIME`) " +
                                    "VALUES ('" +
                                    who + "', " +
                                    "'2', " +
                                    "'" + real_amount_btc + "', " +
                                    "'" + real_amount_coins + "', " +
                                    "'" + fee + "', " +
                                    "'" + to_address + "', " +
                                    "'" + to_address + "', " +
                                    "0 , " +
                                    timestamp + ", " +
                                    timestamp + ")";
                                    conn.query(insertQuery , function(err , result) {
                                    if(err) {
                                        conn.rollback(function() {
                                            reject(err);
                                        })
                                    }
                                    else {
                                        conn.commit(function(err) {
                                            if (err) {
                                                conn.rollback(function() {
                                                    reject(err);
                                                });
                                            }
                                            else {
                                                conn.end();
                                                resolve(true);
                                            }
                                        });
                                    }
                                })
                            }
                        });
                    }
                });
            }
        })
    });
}

var getDepositLogTotalCount = function(start_date , end_date) {
    var selectTotalQuery = 'select count(*) as total';
    var fromQuery = 'from deposit_withdraw_log';
    var whereQuery = 'WHERE 1=1 ';
    if (start_date !== undefined && start_date != null && start_date != '') {
        //start_date = start_date + " 00:00:00"
        //start_date = Math.floor(new Date(start_date).getTime() / 1000)
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME >= ' + start_date + ')';
    }
    if (end_date !== undefined && end_date != null && end_date != '') {
        //end_date = end_date + " 23:59:59"
        //end_date = Math.floor(new Date(end_date).getTime() / 1000)
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME <= ' + end_date + ')';
    }
    whereQuery += ' AND (deposit_withdraw_log.TYPE=1)';
    var query = selectTotalQuery + ' ' + fromQuery + ' ' + whereQuery;
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err) {
                reject(err);
            }
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['total']);
            }
        });
    });    
}

exports.getDepositLog = function(start_date, end_date, page, limit) {
    var selectQuery = 'select deposit_withdraw_log.* , users.`USERNAME` , users.`EMAIL`';
    var fromQuery = 'from deposit_withdraw_log';
    var leftjoinQuery = 'LEFT JOIN users ON deposit_withdraw_log.`USER_ID` = users.ID';
    var whereQuery = 'WHERE 1=1 ';
    var start_date1 = start_date;
    var end_date1 = end_date;
    if (start_date !== undefined && start_date != null && start_date != '') {
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME >= ' + start_date + ')';
    }
    if (end_date !== undefined && end_date != null && end_date != '') {
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME <= ' + end_date + ')';
    }
    whereQuery += ' AND (deposit_withdraw_log.TYPE=1 OR deposit_withdraw_log.TYPE=3)';
    var otherQuery = ' order by deposit_withdraw_log.ID ';
    otherQuery += ' LIMIT ' + (page - 1) * limit + ',' + limit;
    return new Promise((resolve , reject) => {
        getDepositLogTotalCount(start_date1 , end_date1)
        .then((total_count) => {
            var sql = selectQuery + ' ' + fromQuery + ' ' + leftjoinQuery + ' ' + whereQuery + ' ' + otherQuery;
            db.con.query(sql , function(err , result1 , fields) {
                    if(err) {
                        reject(err);
                    }
                    else {
                        result1 = JSON.stringify(result1);
                        result1 = JSON.parse(result1);
                        resolve({
                            total: total_count,
                            items: result1
                        });
                    }
            })
        })
        .catch((err) => {
            reject(err);
        })
    });
}

exports.getReferralLogTotalCount = function(user_id, date_from, date_to) {
    var selectTotalQuery = 'select count(*) as total';
    var fromQuery = 'from deposit_withdraw_log';
    var joinQuery = 'left join users ON deposit_withdraw_log.`USER_ID` = users.ID'
    var whereQuery = 'WHERE 1=1 ';
    if (user_id !== undefined && user_id != null && user_id != '') {
        whereQuery += ' AND users.ID = ' + user_id;
    }
    if (date_from !== undefined && date_from != null && date_from != '') {
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME >= ' + date_from + ')';
    }
    if (date_to !== undefined && date_to != null && date_to != '') {
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME <= ' + date_to + ')';
    }
    whereQuery += ' AND (deposit_withdraw_log.TYPE=3)';
    var query = selectTotalQuery + ' ' + fromQuery + ' ' + joinQuery + ' ' + whereQuery;

    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err) {
                reject(err);
            }
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['total']);
            }
        });
    });        
}
exports.getReferralLog = function(user_id ,txhash, date_from, date_to, page , limit) {
    var selectQuery = 'SELECT deposit_withdraw_log.* , \
        users.`USERNAME` , users.`EMAIL` ,\
        A.`USERNAME` AS REF_USERNAME , A.`EMAIL` AS REF_EMAIL , users.AVATAR as avatar, users.REFERRAL_CODE, B.AMOUNT_COINS as AMOUNT_DEPOSIT, A.`ID` AS REF_ID';
    var selectSumQuery= 'SELECT NULL as ID, NULL as USER_ID , NULL as TYPE, NULL as AMOUNT_BTC, SUM(deposit_withdraw_log.AMOUNT_COINS) as AMOUNT_COINS, NULL as FEE, NULL as DETAIL,NULL as TXHASH, NULL as STATUS, "TOTAL" as CREATE_TIME, NULL as UPDATE_TIME, \
        NULL AS USERNAME , NULL AS EMAIL ,\
        NULL AS REF_USERNAME , NULL AS REF_EMAIL , NULL AS avatar , NULL AS REFERRAL_CODE, SUM(B.AMOUNT_COINS) as AMOUNT_DEPOSIT, NULL AS REF_ID';

    var fromQuery = 'FROM deposit_withdraw_log';

    var leftjoinQuery = 'LEFT JOIN users ON users.ID = deposit_withdraw_log.`USER_ID` \
                         LEFT JOIN deposit_withdraw_log B ON B.ID = deposit_withdraw_log.`DETAIL` \
                         LEFT JOIN users A ON A.REFERRAL_CODE = deposit_withdraw_log.`TXHASH` ';

    var whereQuery = 'WHERE 1=1 ';
    if (user_id !== undefined && user_id != null && user_id != '') {
        whereQuery += ' AND users.ID =' + user_id ;
    }
    if (txhash !== undefined && txhash != null && txhash != '') {
        whereQuery += ' AND deposit_withdraw_log.TXHASH ="' + txhash+'"' ;
    }
    if (date_from !== undefined && date_from != null && date_from != '') {
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME >= ' + date_from + ')';
    }
    if (date_to !== undefined && date_to != null && date_to != '') {
        whereQuery += ' AND (deposit_withdraw_log.CREATE_TIME <= ' + date_to + ')';
    }
    whereQuery += ' AND (deposit_withdraw_log.TYPE=3)';
    var otherQuery = ' order by ID ';
    otherQuery += ' LIMIT ' + (page - 1) * limit + ',' + limit;
    return new Promise((resolve , reject) => {
        this.getReferralLogTotalCount(user_id, date_from, date_to)
        .then((total_count) => {
            var sql = selectQuery + ' ' + fromQuery + ' ' + leftjoinQuery + ' ' + whereQuery;
            sql += ' UNION ' + selectSumQuery + ' ' + fromQuery + ' ' + leftjoinQuery + ' '+ whereQuery+ otherQuery;
            db.con.query(sql , function(err , result1 , fields) {
                if(err) {
                    reject(err);
                }
                else {
                    result1 = JSON.stringify(result1);
                    result1 = JSON.parse(result1);
                    resolve({
                        total: total_count,
                        items: result1
                    });
                }
            })
        })
        .catch((err) => {
            reject(err);
        })
    });
}

exports.getWithdrawLog = function(start_date, end_date, page, limit) {
    var whereItems = []
    if (start_date !== undefined && start_date != null && start_date != '') {
        whereItems.push({
            key: "deposit_withdraw_log.CREATE_TIME",
            val: start_date,
            opt: ">="
        })
    }
    if (end_date !== undefined && end_date != null && end_date != '') {
        whereItems.push({
            key: "deposit_withdraw_log.CREATE_TIME",
            val: end_date,
            opt: "<="
        })
    }
    whereItems.push({ key: "TYPE" , val: "2" , opt: "=" });
    var total = 0
    return db.list(db.statement("select count(*) as total from", "deposit_withdraw_log", '', whereItems.length > 0 ? db.lineClause(whereItems, 'and') : '', ''), true).then((rows) => {
        total = rows[0].total
        return db.list(db.statement("SELECT deposit_withdraw_log.* , users.`USERNAME` , users.`EMAIL` FROM ",
        " deposit_withdraw_log",
        " LEFT JOIN users ON deposit_withdraw_log.`USER_ID` = users.ID ",
        whereItems.length > 0 ? db.lineClause(whereItems, 'and') : '',
        'ORDER BY deposit_withdraw_log.STATUS,deposit_withdraw_log.ID LIMIT ' + (page - 1) * limit + ',' + limit),
        true)
    }).then((rows) => {
        return {
            total: total,
            items: rows
        }
    })
}

exports.isWithdrawRequest = function() {
    return new Promise((resolve , reject) => {
        db.con.query('SELECT * FROM deposit_withdraw_log WHERE `TYPE` = 2  AND `STATUS` = 0' , function(err , result , fields) {
            if(err) {
                reject(err);
            }
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);   
                if(result.length < 1) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            }
        });
    });
}

exports.getDepositSum = function(user_id) {
    var query = "SELECT SUM(AMOUNT_COINS) AS deposit_sum " + 
                "FROM deposit_withdraw_log " + 
                "WHERE USER_ID = " + user_id + " " + 
                "AND TYPE = 1";
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err) {
                reject(err);
            }
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);   
                if(result[0]['deposit_sum'] == null) 
                    resolve(0);
                else 
                    resolve(result[0]['deposit_sum']);
            }
        })
    })               
}

exports.getWithdrawSum = function(user_id) {
    var query = "SELECT SUM(AMOUNT_COINS) AS withdraw_sum " + 
                "FROM deposit_withdraw_log " + 
                "WHERE USER_ID = " + user_id + " " + 
                "AND TYPE = 2";
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err) {
                reject(err);
            }
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);   
                if(result[0]['withdraw_sum'] == null) 
                    resolve(0);
                else 
                    resolve(result[0]['withdraw_sum']);
            }
        })
    })               
}