var express = require('express');
var router = express.Router();
var crashModel = require('./model/crash');
var config = require('./../src/config');
var request = require('request');

 router.post('/bet', async function (req, res) {
    const { user_id, bet, game_no, is_bot } = req.body
    var ret = await crashModel.bet(user_id, bet, game_no, is_bot == undefined ? false : is_bot == 1)
    return res.json(ret)
})
router.post('/addbet', async function (req, res) {
    const { user_id, bet, game_no, is_bot } = req.body
    var ret = await crashModel.bet(user_id, bet, game_no, is_bot == undefined ? false : is_bot == 1)
    return res.json(ret)
})
router.post('/cashout', async function (req, res) {
    const { user_id, game_no, cash_rate, is_bot } = req.body
    var ret = await crashModel.cashout(user_id, game_no, cash_rate, is_bot == undefined ? false : is_bot == 1)
    return res.json(ret)
})
router.post('/game_start', async function (req, res) {
    const { game_no, bust, hash } = req.body
    var ret = await crashModel.game_start(game_no, bust, hash)
    return res.json(ret)
})
router.post('/game_bust', async function (req, res) {
    const { game_no } = req.body
    var ret = await crashModel.game_bust(game_no)
    return res.json(ret)
})
router.post('/init', async function (req, res) {
    var ret = await crashModel.game_init()
    return res.json(ret)
})
router.post('/game_finish_start', async function (req, res) {
    const { game_no, bust, hash } = req.body
    var ret = await crashModel.game_finish_start(game_no, bust, hash)
    return res.json(ret)
})
router.post('/game_log', async function (req, res) {
    const { limit } = req.body
    var ret = await crashModel.game_log(limit)
    return res.json({
        code: 20000,
        data: ret
    });
})
router.post('/history', async function (req, res) {
    const { id, start_date, end_date, page, limit } = req.body
    var i_page = isNaN(parseInt(page)) ? 1 : parseInt(page)
    var i_limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit)
    var ret = await crashModel.getHistory(id, start_date, end_date, i_page, i_limit)
    return res.json({
        code: 20000,
        data: ret
    });
})

router.post('/log', async function (req, res) {
    const { id } = req.body
    if (id == undefined || isNaN(parseInt(id))) {
        return res.json({
            code: 60000,
            message: 'ID param is not defined.',
            data: null
        });
    }
    var i_id = parseInt(id)
    var ret = await crashModel.getGameLog(i_id)
    return res.json({
        code: 20000,
        data: {
          items: ret
        }
    });
})

function getNumberFormat(_num) {
  _num = parseInt(_num)
  _num = _num.toString()
  var num = _num.split('')
  num = num.reverse()
  _num = num.join('')
  var result = ''
  var gap_size = 3 // Desired distance between spaces

  while (_num.length > 0) { // Loop through string
    if (result === '') {
      result = result + _num.substring(0, gap_size)
    } else { result = result + ',' + _num.substring(0, gap_size) } // Insert space character
    _num = _num.substring(gap_size) // Trim String
  }
  num = result.split('')
  num = num.reverse()
  result = num.join('')
  return result
}

router.post('/game_detail' , async function (req, res) {
    try {
        const { id } = req.body
        if (id == undefined || isNaN(parseInt(id))) {
            return res.json({
                code: 60000,
                message: 'ID param is not defined.',
                data: null
            });
        }
        var i_id = parseInt(id)
        var ret = await crashModel.getGameLog(i_id)
        var items = []
        for(var i = 0; i < ret.length; i ++) {
            if(ret[i]['CASHOUTRATE'] > 0) {
                items.push({
                    player: ret[i]['IS_BOT'] == 1?ret[i]['BOT_NAME']:ret[i]['USER_NAME'], 
                    bet: ret[i]['BET_AMOUNT'] + 'coins',
                    profit: ret[i]['CASHOUTRATE'] > 0?(ret[i]['PROFIT'] + 'coins'):('-' + ret[i]['BET_AMOUNT'] + 'coins'),
                    cashed_out: ret[i]['CASHOUTRATE'] > 0?ret[i]['CASHOUTRATE']:'Lose'
                });
            }
            else {
                items.push({
                    player: ret[i]['IS_BOT'] == 1?ret[i]['BOT_NAME']:ret[i]['USER_NAME'], 
                    bet: ret[i]['BET_AMOUNT'] + 'coins',
                    profit: ret[i]['CASHOUTRATE'] > 0?(ret[i]['PROFIT'] + 'coins'):('-' + ret[i]['BET_AMOUNT'] + 'coins'),
                    cashed_out: ret[i]['CASHOUTRATE'] > 0?ret[i]['CASHOUTRATE']:'Lose',
                    _cellVariants: { profit: 'danger' }
                });   
            }
        }
        var game_info = await crashModel.getCrashGameInfo(i_id)
        return res.json({
            code: 20000,
            message: null,
            status: 'success',
            data: {
              items: items,
              hash: game_info[0]['HASH'],
              time: game_info[0]['REGTIME'],
              crashed_at: game_info[0]['BUST']
            }
        });
    } catch(error) {
        return res.json({
          code: 401,
          status: 'fail',
          message: 'Api Request Failed.',
          data: null
        });
    }
})

router.post('/game_history', async function (req, res) {
    const { id, start_date, end_date, page, limit } = req.body
    var i_page = isNaN(parseInt(page)) ? 1 : parseInt(page)
    var i_limit = isNaN(parseInt(limit)) ? 1 : parseInt(limit)
    var ret = await crashModel.getHistory(0, '', '', i_page, i_limit)

    var items = []
    for(var i = 0; i < ret.items.length; i ++) {
        items.push({
		    gameid: ret.items[i]['ID'],
            result: parseFloat(ret.items[i]['BUST'] / 100).toFixed(2) + 'x',
            hash: ret.items[i]['HASH'],
            _cellVariants: { result: parseFloat(ret.items[i]['BUST'] / 100) > 1.97?'blue':'red' }
        });
    }
    return res.json({
        code: 20000,
	    status: 'success',
        data: {
            items: items
        }
    });
})

router.post('/bot_apply' , function(req, res) {
        request.post({
                    url:    config.crash_host_url,
                    form: {
                    }
        }, function(error, response, body){
                    var ret = JSON. parse(body);
                    if (ret.status) {
                        return res.json({
                          code: 20000,
                          status: 'success',
                          message: null,
                          data: null
                        });
                    }
                    else {
                        return res.json({
                          code: 401,
                          status: 'fail',
                          message: 'Api Request Failed.',
                          data: null
                        });
                    }
        });
})

router.post('/get_token' , async function (req , res) {
    return res.json({
        code: 20000,
        token: config.BLOCKCYPHER_TOKEN
    })
})

module.exports = router;
