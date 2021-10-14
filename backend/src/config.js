var path = require('path');
var crash_port = 4202
var chat_port = 4204
var main_port = 3001
var base_domain = "45.76.180.140"
//var base_domain = "localhost"

var config = {
    debug: true,
    crash_port: crash_port,
    chat_port : chat_port,
    mysql : {
        host : 'localhost',
        user : 'root',
        //password : 'mirai2018',
        password : '',
        database : 'bitcrash'
    },
    base_domain: base_domain,
    main_host_url : "http://" + base_domain + ":" + main_port + "/api/",
    //general_profile_url : "http://" + base_domain + ":7801/img/uploads/avatar/general_profile.png"c
    general_profile_url : "http://" + base_domain + ":8080/img/uploads/avatar/general_profile.png",

    BTC_SITE_WALLET_ADDRESS : "19ejNRyHmqgotgztP7XeLsXbHD7K5tkTJo",
    BTC_SITE_PRIVATE_KEY : "fb422f196446b71f851240984d92baa2fc229f9fdf71335a68db161cebe75ac9",
    BTC_SITE_PUBLIC_KEY : "0284673d7f6b73990999cf16cf03394069e1bca2b8536213ee3e23b50e7fb71b1c",
    BLOCKCYPHER_TOKEN : "f00484c44b6c457abf570448470af78c",
    BLOCKCYPHER_CALLBACK_HOST_URL : "http://" + base_domain + ":" + main_port + "/",
    BTC_withdraw_fee: 0.00005,
    BTC_min_withdraw_amount: 0.0001,
    //MAIN_REFERRAL_PREFIX: "https://" + base_domain + "/#/home",
    MAIN_REFERRAL_PREFIX: "http://" + base_domain + "/#/home",
    //HOST: "https://" + base_domain,
    HOST: "http://" + base_domain,
    IMAGE_TEMP_DEST: "/var/www/html/bitcrash/temp",
    AVATAR_STORE_PATH: "/var/www/html/bitcrash/img/uploads/avatar/",

    //crash_host_url : "https://" + base_domain + ":" + crash_port + "/bot_apply".toString,
    crash_host_url : "http://" + base_domain + ":" + crash_port + "/bot_apply".toString,

    EMAIL: 'no-reply@bitcrash.co.za',
    EMAIL_PWD: 'Rpy@2010!#_',
    EMAIL_REQUEST: 'https://cryptoonline.ml:3001/api/user/forgot_user_password'
}

module.exports = config