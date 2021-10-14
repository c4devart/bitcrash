var express = require('express');
var app = express();
var server = require('http').createServer(app);

//var privateKey  = fs.readFileSync('/etc/letsencrypt/live/cryptoonline.ml-0001/privkey.pem', 'utf8');
//var certificate = fs.readFileSync('/etc/letsencrypt/live/cryptoonline.ml-0001/fullchain.pem', 'utf8');
//var credentials = {key: privateKey, cert: certificate};
//var server = require('https').createServer(credentials , app);


var io = require('socket.io')(server);
var mysql = require('mysql');
var dateFormat = require('dateformat');
var config = require('./src/config');
var bodyParser = require('body-parser');

var db = require('./utils/database');

server.listen(config.chat_port, function(){
  console.log('listening on *:' + config.chat_port);
});

app.use(bodyParser.json());

io.on('connection', function(socket) {
    console.log('a new user connnected');
    var construct_func = function ( req , res , next ) {
      console.log("LOGGED");
      next();
    }
    app.use(construct_func);
    app.post('/post_msg', function(req, res){
        var json = JSON.stringify({
            msg: req.body.msg,
            username: req.body.username,
            curtime: req.body.curtime,
            type: req.body.type,
            avatar: req.body.avatar,
            user_id: req.body.user_id
        });
        //broadcast messages to every body
        io.emit('chat_message', json);
        res.json({"error_code" : 0});
    });
    socket.on('disconnect', function(data) {
    });
});

