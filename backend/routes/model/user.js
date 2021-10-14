var md5 = require('md5');
var db = require('./../../utils/database');
var rn = require('random-number');
var dateFormat = require('dateformat');
var config = require('../../src/config');
var bet_available = function (userID, betAmount) {
    return db.list(db.statement("select * from", "users", '', db.itemClause('ID', userID)), true).then((userInfo) => {
        if (userInfo == null || userInfo.length <= 0) {
            return 'Invalid User ID'
        }
        if (db.convInt(userInfo[0].WALLET) < betAmount) {
            return 'Wallet is not enough.'
        }
        return 'success'
    })
}

var getUserInfo = function (query, callback) {
    var pwdStr = '';
    if (query.password != undefined) {
        pwdStr = md5(query.password);
    }
    var sql = "select * from users"
    var whereClause = ''
    var query_cnt = 0
    if (query.search_key != undefined) {
        whereClause += "(username='" + query.search_key + "'" + " or " + "email='" + query.search_key + "')"
        query_cnt++
    } else {
        if (query.username != undefined) {
            whereClause += (query_cnt != 0 ? "and " : " ") + "username='" + query.username + "'"
            query_cnt++
        }
        if (query.email != undefined) {
            whereClause += (query_cnt != 0 ? "and " : " ") + "email='" + query.email + "'"
            query_cnt++
        }
    }
    if (query.password != undefined) {
        whereClause += (query_cnt != 0 ? " and " : " ") + "PASSWORD='" + pwdStr + "'"
        query_cnt++
    }
    if (query.token != undefined) {
        whereClause += (query_cnt != 0 ? " and " : " ") + "API_TOKEN='" + query.token + "'"
        query_cnt++
    }
    if (query.user_id != undefined) {
        whereClause += (query_cnt != 0 ? " and " : " ") + "ID='" + query.user_id + "'"
        query_cnt++
    }
    if (whereClause == '') {
        callback([])
        return;
    }
    sql = sql + (whereClause == '' ? '' : ' where ' + whereClause)

    db.con.query(sql, function (err, rows, fields) {
        if (err) {
            if (callback != null) {
                callback([])
            }
            throw err
        }
        callback(rows)
    });
}
var generateRandomString = function (length = 25) {
    characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    charactersLength = characters.length;
    randomString = '';

    var options = {
        min: 0
        , max: charactersLength - 1
        , integer: true
    }

    for (var i = 0; i < length; i++) {
        randomString += characters[rn(options)];
    }
    return randomString;
}
var checkUsername = function(username, referral_code = '') {
    var sql = "SELECT * FROM users WHERE USERNAME = '" + username + "'"
    if (referral_code !== undefined && referral_code !== null && referral_code !== '') {
        sql += " AND REFERRAL_CODE_P = '" + referral_code + "'"
    }
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result);
            }
        });
    });
}
var checkEmail = function(email) {
    var sql = "SELECT * FROM users WHERE EMAIL = '" + email + "'"
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result);
            }
        });
    });
}
var checkReferralCode = function(referralcode) {
    var sql = "SELECT * FROM users WHERE REFERRAL_CODE = '" + referralcode + "'"
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result);
            }
        });
    });
}
var signup = function (data) {
    return new Promise((resolve, reject) => {
        if (data.username == undefined || data.username == null || data.username == '') {
            resolve({
                code: false
            })
            return
        }
        if (data.email == undefined || data.email == null || data.email == '') {
            resolve({
                code: false
            })
            return
        }
        if (data.password == undefined || data.password == null || data.password == '') {
            resolve({
                code: false
            })
            return
        }
        var token = generateRandomString()
        var pwdStr = "";
        data.referral_code = data.referral_code
        //Math.round(new Date().getTime() / 1000)
        pwdStr = md5(data.password);
        var values = "(" + Math.round(new Date().getTime() / 1000) + ", "
        values += Math.round(new Date().getTime() / 1000) + ", "
        values += "'" + data.username + "', "
        values += "'" + pwdStr + "', "
        values += "'" + data.email + "', "
        values += "'" + config.general_profile_url + "',"
        values += "'" + data.referral_code + "',"
        values += "'" + data.referral_code_p + "',"
        values += "'" + token + "'" + ")"

        var statement = db.statement("insert into", "users", "(CREATE_TIME, UPDATE_TIME, USERNAME, PASSWORD, EMAIL, AVATAR, REFERRAL_CODE, REFERRAL_CODE_P, API_TOKEN)", "", "VALUES " + values)
        db.con.query(statement, function (err, results, fields) {
            if (err) {
                reject(err)
                throw err
            }
            resolve({
                code: true,
                insert_id: results.insertId,
                token: token
            })
        });
    })
}
var getList = function (search_key, referralCode , page, limit) {
    var total = 0
    var whereItems = []
    if (search_key !== undefined && search_key != '') {
        whereItems.push(
            {
                key: 't0.username',
                val: '%' + search_key + '%',
                opt: 'like'
            }
        )

        whereItems.push(
            {
                key: 't0.email',
                val: '%' + search_key + '%',
                opt: 'like'
            }
        )
    }
    if (referralCode !== undefined && referralCode != '') {
        whereItems.push(
            {
                key: 't0.REFERRAL_CODE_P',
                val: referralCode,
                opt: '='
            }
        )
    }
    var whereClause = (whereItems.length > 0 ? "(" + db.lineClause(whereItems, "or") + ")" + " and " : '') + db.itemClause('t0.DEL_YN', 'N')
    return db.list(db.statement("select count(*) as total from", "users AS t0", "", whereClause), true).then((rows) => {
        total = rows[0].total
        return db.list(db.statement("SELECT t0.*, COUNT(t1.REFERRAL_CODE_P) AS cnt FROM ", "users AS t0", "LEFT JOIN users AS t1 ON t0.REFERRAL_CODE = t1.REFERRAL_CODE_P ", whereClause, 'GROUP BY t0.ID, t1.REFERRAL_CODE_P ORDER BY ID DESC LIMIT ' + (page - 1) * limit + ',' + (limit)), true)
    }).then((rows) => {
        return {
            total: total,
            items: rows
        }
    })
}
var update = function (params) {
    const {id, del_yn, state} = params
    if (id === undefined || id == 0) {
        return false
    } else {
        var whereClause = db.itemClause('ID', parseInt(id))
        var setItems = []
        if (del_yn !== undefined && del_yn != '') {
            setItems.push({
                key: 'DEL_YN',
                val: del_yn
            })
        }
        if (state !== undefined) {
            setItems.push({
                key: 'state',
                val: parseInt(state)
            })
        }
        db.cmd(db.statement("update", "users", "set " + db.lineClause(setItems, ","), whereClause))
        return true
    }
}
var getUserBalance = function(keyData, callback) {
    var query = "SELECT `WALLET` FROM users WHERE ID=" + keyData.who;
    db.con.query(query, function (err, rows, fields) {
        if (err) {
            return callback(err, null);
        }else{
            var return_data = {
                res: true,
                content: rows[0]
            }
            return callback(null, return_data);
        }
    });
}
var updateBalance = function (updateData , callback) {
    var amount = updateData.amount * Math.pow(10 , 6);
    var updateQuery = "UPDATE users SET `WALLET`=`WALLET`+" + amount + " WHERE ID=" + updateData.who;
    db.con.query(updateQuery, function (err, rows, fields) {
        if(err) {
            return callback(err, null)
        } else {
            var return_data = {
                res: true,
                content: rows
            }
            return callback(null, return_data);
        }
    })
}
var getReferralCode = function(user_id) {
    var query = "SELECT REFERRAL_CODE FROM users WHERE ID=" + user_id;
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err)
                reject(err);
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['REFERRAL_CODE'])
            }
        });
    });
}
var getUserAvatarImage = function(user_id) {
    var query = "SELECT AVATAR FROM users WHERE ID=" + user_id;
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err)
                reject(err);
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['AVATAR'])
            }
        });
    });
}
var getParentReferralCode = function(user_id) {
    var query = "SELECT REFERRAL_CODE_P , REFERRAL_CODE FROM users WHERE ID=" + user_id;
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err)
                reject(err);
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0])
            }
        });
    });
}
var getUseridByParentReferralCode = function(referral_code_p) {
    var query = "SELECT ID FROM users WHERE REFERRAL_CODE='" + referral_code_p + "'";
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err)
                reject(err);
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['ID'])
            }
        });
    });
}
var updateAdminBalance = function (updateData) {
    var updateQuery = "UPDATE admin SET `REFERRAL_WALLET`=`REFERRAL_WALLET`+" + updateData.amount + " WHERE ID=" + updateData.who;
    return new Promise((resolve , reject) => {
        db.con.query(updateQuery , function(err , result) {
            if(err)
                reject(err)
            else
                resolve(true)
        })
    })
}
var updateUserBalance = function (updateData) {
    var updateQuery = "UPDATE users SET `WALLET`=`WALLET`+" + updateData.amount + " WHERE ID=" + updateData.who;
    return new Promise((resolve , reject) => {
        db.con.query(updateQuery , function(err , result) {
            if(err)
                reject(err)
            else
                resolve(true)
        })
    })
}

var getUserProfile = function(user_id) {
    var query = "SELECT * FROM users WHERE ID = " + user_id;
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);   
                resolve(result)
            }
        })
    })
}

var getUserInfoByPassToken = function(pass_token) {
    var query = "SELECT * FROM users WHERE PASS_TOKEN = '" + pass_token + "'";
    return new Promise((resolve , reject) => {
        db.con.query(query , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result)
            }
        })
    })
}


var updateUserProfile = function(data = {} , filter = {}) {
    var sql = "update users set UPDATE_TIME = " + Math.floor(Date.now() / 1000) + "  ";
    for(let[key , value] of Object.entries(data))
        sql += " , " + key + " = '" + value + "' ";
    sql += " where 1=1 " ;
    for(let[key , value] of Object.entries(filter))
        sql += " and " + key + " = '" + value + "' ";
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result) {
            if(err)
                reject(err)
            else
                resolve(true);
        });
    })
}

var userModel = {
    getUserInfo: getUserInfo,
    signup: signup,
    bet_available: bet_available,
    getList: getList,
    update: update,
    updateBalance: updateBalance,
    getUserBalance: getUserBalance,
    getReferralCode: getReferralCode,
    checkUsername: checkUsername,
    checkEmail: checkEmail,
    checkReferralCode: checkReferralCode,
    updateAdminBalance: updateAdminBalance,
    updateUserBalance: updateUserBalance,
    getParentReferralCode: getParentReferralCode,
    getUseridByParentReferralCode: getUseridByParentReferralCode,
    getUserProfile: getUserProfile,
    updateUserProfile: updateUserProfile,
    getUserAvatarImage: getUserAvatarImage,
    getUserInfoByPassToken: getUserInfoByPassToken
}

module.exports = userModel;