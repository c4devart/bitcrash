var db = require('./../../utils/database');
var rn = require('random-number');
var dateFormat = require('dateformat');

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

var getList = function (search_key, type, page, limit) {
    var total = 0
    var whereClause = search_key === undefined || search_key == '' ? '' : db.lineClause([
        {
            key: 'answer',
            val: '%' + search_key + '%',
            opt: 'like'
        },
        {
            key: 'question',
            val: '%' + search_key + '%',
            opt: 'like'
        }
    ], 'or')
    var typeClause = ""
    whereClause = whereClause == '' ? "deleted=0" + typeClause : "(" + whereClause + ") AND deleted=0" + typeClause
    return db.list(db.statement("select count(*) as total from", "faq", "", whereClause), true).then((rows) => {
        total = rows[0].total
        return db.list(db.statement("select * from", "faq", "", whereClause, 'ORDER BY update_time DESC LIMIT ' + (page - 1) * limit + ',' + limit), true)
    }).then((rows) => {
        return {
            total: total,
            items: rows
        }
    })
}
var add = function (params) {
    const {question, answer, id, del_yn} = params
    var question1 = mysql_real_escape_string(question)
    var answer1 = mysql_real_escape_string(answer)

    if(id == 0) {
        var setItems = []
        var insertValues = "("
        var insertFields = "("    
        if (answer !== undefined) {
            setItems.push({
                key: 'answer',
                val: answer1
            })
            insertValues += "'" + answer1 + "'" + ","
            insertFields += "answer,"
        }
        if (question !== undefined) {
            setItems.push({
                key: 'question',
                val: question1
            })
            insertValues += "'" + question1 + "'" + ","
            insertFields += "question,"
        }
        insertFields += "create_time,"
        insertValues += Math.floor(Date.now() / 1000) + ","
        insertFields += "update_time,"
        insertValues += Math.floor(Date.now() / 1000) + ","
        insertFields = insertFields.substr(0, insertFields.length - 1)
        insertValues = insertValues.substr(0, insertValues.length - 1)
        insertFields += ")"
        insertValues += ")"
        db.cmd(db.statement("insert into", "faq", insertFields, '', 'VALUES ' + insertValues))
    }
    else {
        if(del_yn == undefined) {
            var setItems = []
            if (answer !== undefined) {
                setItems.push({
                    key: 'answer',
                    val: answer1
                })
            }
            if (question !== undefined) {
                setItems.push({
                    key: 'question',
                    val: question1
                })
            }
            setItems.push({
                key: 'update_time',
                val: Math.floor(Date.now() / 1000)
            })
            var whereClause = db.itemClause('id', parseInt(id))
            db.cmd(db.statement("update", "faq", "set " + db.lineClause(setItems, ","), whereClause))
        }
        else {
            var setItems = []
            setItems.push({
                key: 'deleted',
                val: 1
            })
            setItems.push({
                key: 'update_time',
                val: Math.floor(Date.now() / 1000)
            })
            var whereClause = db.itemClause('id', parseInt(id))
            db.cmd(db.statement("update", "faq", "set " + db.lineClause(setItems, ","), whereClause))   
        }
    }
    return true
}
var model = {
    getList: getList,
    add: add
}
module.exports = model;