var express = require('express');
var router = express.Router();
var chatModel = require('./model/chat');
var config = require('./../src/config');
var dateFormat = require('dateformat');

var axios = require('axios')

var instance = axios.create({
    baseURL: 'https://' + config.base_domain + ":" + config.chat_port + "/",
    timeout: 5000
  });

router.post('/post_msg', async function (req, res) {
    const { CHAT_TYPE, MSG, IPADDRESS, USERID, AVATAR, USERNAME } = req.body
    var curtime = Math.round(new Date().getTime() / 1000)

    var data = {
        msg: MSG,
        avatar: AVATAR,
        username: USERNAME,
        curtime: curtime,
        type: CHAT_TYPE,
        user_id: USERID
    }

    var ret = await instance.post("post_msg", data).then(response => {
        if(response.data != null && response.data.error_code == 0) {
            return true
        } else {
            return false
        }
    }).catch(error => {
        return false
    })

    if(ret) {
        var chat_data = {}
        chat_data["CHAT_TYPE"] = CHAT_TYPE
        chat_data["CREATE_TIME"] = Math.floor(Date.now() / 1000)
        chat_data["UPDATE_TIME"] = Math.floor(Date.now() / 1000)
        chat_data["MSG"] = MSG
        chat_data["IPADDRESS"] = IPADDRESS
        chat_data["USERID"] = USERID

        chatModel.add(chat_data)
        return res.json({
            code: 20000,
            data: {
                error_code: 0
            }
        })
    }
    else {
        return res.json({
            code: 20000,
            data: {
                error_code: 1
            }
        })
    }

});

router.post('/list', async function (req, res) {
    var chat_type = req.body.type
    var today = req.body.today
    var chats = await chatModel.list(chat_type , today)
    return res.json({
        code: 20000,
        data: chats
    })
});

module.exports = router;
