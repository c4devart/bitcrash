var db = require('./../../utils/database');
var dateFormat = require('dateformat');
var add = function(data) {
    var statement = db.statement("insert into", "chats", "(CHAT_TYPE, CREATE_TIME, UPDATE_TIME, MSG, IPADDRESS, USERID)", "",
    "VALUES (" + "'" + data.CHAT_TYPE + "'" + "," + "'" + data.CREATE_TIME + "'" + "," + "'" + data.UPDATE_TIME + "'" + "," + "'" + data.MSG + "'" + "," + "'" + data.IPADDRESS + "'" + "," + data.USERID + ")")
    db.cmd(statement)
}
var list = function (chat_type , client_today) {
    return db.list(db.statement("select chats.ID as id, chats.USERID as user_id, chats.CREATE_TIME, chats.MSG as message, users.USERNAME as user, users.AVATAR as avatar from", "chats",
        'LEFT JOIN users ON users.ID = chats.USERID',
        db.lineClause([
            {
                key: "chats.DEL_YN",
                val: "N"
            },
            {
                key: "chats.CHAT_TYPE",
                val: chat_type
            },
            {
                key: "chats.CREATE_TIME",
                val: client_today,
                opt: ">="
            }
        ], "and"), ""), true).then((chatItems) => {
            return chatItems
    })
}
var chatModel = {
    add: add,
    list: list
}

module.exports = chatModel;