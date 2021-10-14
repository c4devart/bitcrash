var async = require('async');
var _ = require('lodash');
var engine = require('./hash_lib');
var games = 1e6;  // you might want to make this 10M for a prod setting.
var block = {
    'roulette' : 1 , 
    'ladder' : 1 ,
    'jackpot' : 1 , 
    'crash' : 1
}
var game_name = 'crash';
var offset = 1 + (block[game_name] - 1) * games;
var game = games;
var serverSeed = `bitcrash_bitcoin_crash_nobody_does_not_know_this_chain_${new Date().toString('yyyy_MM_DD')}`;
function loop(cb) {
    var parallel = Math.min(game , 1000);
    var inserts = _.range(parallel).map(function() {
        return function(cb) {
            game --;
            serverSeed = engine.genGameHash(game_name , serverSeed , offset + game);
            engine.insertHash(game_name , offset + game , serverSeed , cb);
        }
    });
    async.parallel(inserts , function(err) {
        if(err)  throw err;
        var pct = 100 * (games - game) / games;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(
            "Processed: " + (games - game) + ' / ' + games + 
            ' (' + pct.toFixed(2) + '%)');
        if(game > 0)
            loop(cb);
        else {
            console.log(' Done');
            cb();
        }
    });
}
loop( function() {
    console.log('Finished with serverseed: ' , serverSeed);
}); 
