var db = require('./../../utils/database');

exports.getReferralPercentage = function() {
    var sql = "SELECT VALUE FROM variable WHERE VARIABLE = 'REFERRAL_PERCENTAGE'";
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['VALUE']);
            }
        });
    })
}

exports.getWithdrawalFee = function() {
    var sql = "SELECT VALUE FROM variable WHERE VARIABLE = 'WITHDRAWAL_FEE'";
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['VALUE']);
            }
        });
    })
}

exports.updateReferralPercentage = function(value) {
    var sql = "UPDATE variable SET VALUE = '" + value + "' WHERE VARIABLE = 'REFERRAL_PERCENTAGE'";
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result) {
            if(err)
                reject(err)
            else {
                resolve(true);
            }
        });
    })
}

exports.updateWithdrawalFee = function(value) {
    var sql = "UPDATE variable SET VALUE = '" + value + "' WHERE VARIABLE = 'WITHDRAWAL_FEE'";
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result) {
            if(err)
                reject(err)
            else {
                resolve(true);
            }
        });
    })   
}

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

exports.getVariable = function(variable) {
    var sql = "SELECT VALUE FROM variable WHERE VARIABLE = '" + variable + "'";
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['VALUE']);
            }
        });
    })
}

exports.updateUserVariable = function(variable , value) {
    var value = mysql_real_escape_string(value)
    var sql = "UPDATE variable SET VALUE = '" + value + "' WHERE VARIABLE = '" + variable + "'";
    return new Promise((resolve , reject) => {
        db.con.query(sql , function(err , result) {
            if(err)
                reject(err)
            else {
                resolve(true);
            }
        });
    })   
}

