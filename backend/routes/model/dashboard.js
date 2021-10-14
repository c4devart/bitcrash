var db = require('./../../utils/database');
var rn = require('random-number');
var dateFormat = require('dateformat');
var getActiveNewUsersByToday = function (today) {
    var sql = "SELECT count(*) as today_count \
        FROM `users` \
        WHERE CREATE_TIME >= " + today + " \
        and STATE = '0'"

    return new Promise((resolve , reject) => {
       db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['today_count']);
            }
        }); 
   });    
}
var getNewUsersByToday = function (today) {
    var sql = "SELECT count(*) as today_count \
        FROM `users` \
        WHERE CREATE_TIME >= " + today + " \
        "

    return new Promise((resolve , reject) => {
       db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['today_count']);
            }
        }); 
   });    
}
var getLoggedUsersByToday = function(today) {
    var sql = "SELECT count(*) as today_count \
        FROM `users` \
        WHERE LAST_VISIT IS NOT NULL \
                     AND   LAST_VISIT >= " + today + " \
        "    

    return new Promise((resolve , reject) => {
       db.con.query(sql , function(err , result , fields) {
            if(err)
                reject(err)
            else {
                result = JSON.stringify(result);
                result = JSON.parse(result);
                resolve(result[0]['today_count']);
            }
        }); 
   });           
}
var getStatistics = async function (type, params={}) {
    if (type === 'user') {
        const new_users = await getNewUsersByToday(params.today)
        const logged_users = await getLoggedUsersByToday(params.today) 
        const active_users = await getActiveNewUsersByToday(params.today)
        return [
            { desc: 'New users', value:  new_users },
            { desc: 'Logged users', value: logged_users },
            { desc: 'Active users', value: active_users }
        ]
    } else if (type === 'betting') {
        return [
            { desc: 'Ticket placed', value: '0' },
            { desc: 'Lost tickets', value: '0' },
            { desc: 'Won tickets', value: '0' },
            { desc: 'Pending tickets', value: '0' },
            { desc: 'Cancelled tickets', value: '0' }
        ]
    } else if (type === 'financial') {
        return [
            { desc: 'Total deposits', value: '0' },
            { desc: 'Pending deposits', value: '0' },
            { desc: 'Average deposits', value: '0' },
            { desc: 'Highest deposits', value: '0' },
            { desc: 'Total withdrawals', value: '0' },
            { desc: 'Pending withdrawals', value: '0' },
            { desc: 'Average withdrawals', value: '0' },
            { desc: 'Highest withdrawals', value: '0' }
        ]
    } else {
        return []
    }
}
var getVisits = function (type) {
    var options = {
        min: 0
        , max: 100
        , integer: true
    }
    var tempArr = []
    var tempArr1 = []
    for (var i = 0; i < 30; i++) {
        tempArr.push(rn(options))
        tempArr1.push(rn(options))
    }
    if (type === 'user') {
        return {
            unique_visits: tempArr,
            page_views: tempArr1
        }
    } else if (type === 'betting') {
        return {
            unique_visits: tempArr,
            page_views: tempArr1
        }
    } else if (type === 'financial') {
        return {
            unique_visits: tempArr,
            page_views: tempArr1
        }
    } else {
        return {
            unique_visits: [],
            page_views: []
        }
    }
}
var model = {
    getStatistics: getStatistics,
    getVisits: getVisits
}

module.exports = model;