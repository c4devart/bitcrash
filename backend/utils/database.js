
var mysql = require('mysql');
var config = require('./../src/config');

//database handle
var con;

con = mysql.createPool(config.mysql);

//-
//- Establish a new connection
//-
con.getConnection(function(err){
    if(err) {
        console.log("\n\t *** Cannot establish a connection with the database. ***");
        handleDisconnect();
    }else {
        console.log("\n\t *** New connection established with the database. ***")
    }
});
//-
//- Reconnection function
//-
function handleDisconnect(){
    console.log("\n New connection tentative...");

    //- Create a new one
    con = mysql.createPool(config.mysql);

    //- Try to reconnect
    con.getConnection(function(err){
        if(err) {
            //- Try to connect every 2 seconds.
            setTimeout(handleDisconnect, 2000);
        }else {
            console.log("\n\t *** New connection established with the database. ***")
        }
    });
}

//-
//- Error listener
//-

con.on('error', function(err) {
    //-
    //- The server close the connection.
    //-
    if(err.code === "PROTOCOL_CONNECTION_LOST"){    
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return handleDisconnect();
    }
    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return handleDisconnect();
    }
    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return handleDisconnect();
    }
    else if(err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    }
    else{
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        return handleDisconnect();
    }
});
////////////////////////////

var itemClause = function (key, val, opt = '', type = 0) {
    if (typeof (val) == 'string' && type == 0) {
        return key + " " + (opt === '' ? "=" : opt) + " " + "'" + val + "'"
    }
    if(type == 1) {
        return key + " " + (opt === '' ? "=" : opt) + " " + val
    }
    return key + " " + (opt === '' ? "=" : opt) + " " + val
}
var lineClause = function (items, delimiter) {
    var ret = ''
    for (var i = 0; i < items.length; i++) {
        ret += itemClause(items[i].key, items[i].val, items[i].opt === undefined || items[i].opt == null ? '' : items[i].opt)
        if (i != items.length - 1) {
            ret += ' ' + delimiter + ' '
        }
    }
    return ret
}
var statement = function (cmd, tbl_name, set_c, where_c, extra = '') {
    console.log(cmd + " " + tbl_name + " " + (set_c == undefined || set_c == '' ? '' : set_c) + (where_c == undefined || where_c == '' ? '' : ' where ' + where_c) + (extra == undefined || extra == '' ? '' : ' ' + extra))
    return cmd + " " + tbl_name + " " + (set_c == undefined || set_c == '' ? '' : set_c) + (where_c == undefined || where_c == '' ? '' : ' where ' + where_c) + (extra == undefined || extra == '' ? '' : ' ' + extra)
}
var cmd = function (statement, shouldWait = false) {
    con.query(statement, function (err, rows, fields) {
        if (err) {
            throw err
        }
    });
}
var list = function (statement, shouldWait = false) {
    return new Promise((resolve, reject) => {
        con.query(statement, function (err, rows, fields) {
            if (err) {
                reject(err)
                throw err
            }
            resolve(rows)
        });
    })
}
var convFloat = function (val) {
    return val == undefined || val == null || isNaN(parseFloat(val)) ? 0 : parseFloat(val)
}
var convInt = function (val) {
    return val == undefined || val == null || isNaN(parseInt(val)) ? 0 : parseInt(val)
}

module.exports = {
    con,
    itemClause,
    lineClause,
    statement,
    cmd,
    list,
    convFloat,
    convInt
}