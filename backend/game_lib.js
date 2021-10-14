var mysql = require('mysql');
var config = require('./src/config');
var crypto = require('crypto');
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
function getGameHash(game_name , game_id , callback) 
{                  
    var table = game_name + "_game_hashes";
    con.query("SELECT HASH FROM " + table + " WHERE GAME_ID = " + game_id , function (err, result, fields) {
        if (err) 
            callback('' , err);
        else {
            result = JSON.stringify(result);
            result = JSON.parse(result);
            callback(result[0]['HASH'] , false);
        }
    });
}
function gameResult(seed, salt) {
	const nBits = 52 // number of most significant bits to use
	// 1. HMAC_SHA256(key=salt, message=seed)
	const hmac = crypto.createHmac("sha256", salt)
	hmac.update(seed)
	seed = hmac.digest("hex")
	// 2. r = 52 most significant bits
	seed = seed.slice(0, nBits / 4)
	const r = parseInt(seed, 16)
	// 3. X = r / 2^52
	let X = r / Math.pow(2, nBits) // uniformly distributed in [0; 1)
	// 4. X = 99 / (1-X)
	X = 99 / (1 - X)
	// 5. return max(trunc(X), 100)
	const result = Math.floor(X)
	return Math.max(1, result / 100)
}
module.exports = {
    con , getGameHash , gameResult
}