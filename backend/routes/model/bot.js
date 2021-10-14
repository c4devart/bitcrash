var db = require('./../../utils/database');
var rn = require('random-number');
var dateFormat = require('dateformat');

var getList = function (search_key, page, limit) {
    var total = 0
    var whereItems = []
    if (search_key !== undefined) {
        whereItems.push(
            {
                key: 'username',
                val: '%' + search_key + '%',
                opt: 'like'
            }
        )
    }
    whereItems.push(
        {
            key: 'deleted',
            val: 0
        }
    )
    var whereClause = db.lineClause(whereItems, "and")

    return db.list(db.statement("select count(*) as total from", "crash_game_bot", "", whereClause), true).then((rows) => {
        total = rows[0].total
        return db.list(db.statement("select * from", "crash_game_bot", "", whereClause, 'ORDER BY ID DESC LIMIT ' + (page - 1) * limit + ',' + (limit)), true)
    }).then((rows) => {
        return {
            total: total,
            items: rows
        }
    })
}

var update = function (params) {
    const {id, enable, deleted} = params
    if (id === undefined || id == 0) {
        return false
    } else {
        var whereClause = db.itemClause('ID', parseInt(id))
        var setItems = []
        if (enable !== undefined) {
            setItems.push({
                key: 'ENABLE',
                val: enable
            })
        }
        if (deleted !== undefined) {
            setItems.push({
                key: 'deleted',
                val: parseInt(deleted)
            })
        }
        db.cmd(db.statement("update", "crash_game_bot", "set " + db.lineClause(setItems, ","), whereClause))
        return true
    }
}

var add = function (params) {
    const {bot_id, enable, base_value, bust_from, bust_to, avatar, ID} = params
    if(ID == undefined) {
        var setItems = []
        var insertValues = "("
        var insertFields = "("
        if (bot_id !== undefined) {
            setItems.push({
                key: 'F_ID',
                val: bot_id
            })
            insertValues += "'" + bot_id + "'" + ","
            insertFields += "F_ID,"
        }
        if (enable !== undefined) {
            setItems.push({
                key: 'ENABLE',
                val: enable
            })
            insertValues += "'" + enable + "'" + ","
            insertFields += "ENABLE,"
        }
        if (base_value !== undefined) {
            setItems.push({
                key: 'BASE_VALUE',
                val: base_value
            })
            insertValues += base_value + ","
            insertFields += "BASE_VALUE,"
        }
        if (bust_from !== undefined) {
            setItems.push({
                key: 'BUST_FROM',
                val: bust_from
            })
            insertValues += bust_from + ","
            insertFields += "BUST_FROM,"
        }
        if (bust_to !== undefined) {
            setItems.push({
                key: 'BUST_TO',
                val: bust_to
            })
            insertValues += bust_to + ","
            insertFields += "BUST_TO,"
        }
        if (avatar !== undefined) {
            setItems.push({
                key: 'avatar',
                val: avatar
            })
            insertValues += "'" + avatar + "',"
            insertFields += "avatar,"
        }
        if (setItems.length <= 0) {
            return false
        } else {
            insertFields = insertFields.substr(0, insertFields.length - 1)
            insertValues = insertValues.substr(0, insertValues.length - 1)
        }
        insertFields += ")"
        insertValues += ")"
        db.cmd(db.statement("insert into", "crash_game_bot", insertFields, '', 'VALUES ' + insertValues))
        return true       
    }
    else {
        var setItems = []
        if (bot_id !== undefined) {
            setItems.push({
                key: 'F_ID',
                val: bot_id
            })
        }
        if (enable !== undefined) {
            setItems.push({
                key: 'ENABLE',
                val: enable
            })
        }
        if (base_value !== undefined) {
            setItems.push({
                key: 'BASE_VALUE',
                val: base_value
            })
        }
        if (bust_from !== undefined) {
            setItems.push({
                key: 'BUST_FROM',
                val: bust_from
            })
        }
        if (bust_to !== undefined) {
            setItems.push({
                key: 'BUST_TO',
                val: bust_to
            })
        }
        if (avatar !== undefined) {
            setItems.push({
                key: 'avatar',
                val: avatar
            })
        }
        var whereClause = db.itemClause('ID', parseInt(ID))
        db.cmd(db.statement("update", "crash_game_bot", "set " + db.lineClause(setItems, ","), whereClause))   
    }
}
var model = {
    getList: getList,
    update: update,
    add: add
}

module.exports = model;