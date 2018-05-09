const dfs = require("./services/dfs");
const fs = require('fs');
var request = require('request');
var StringDecoder = require('string_decoder').StringDecoder;

// test de petición
function main() {
    dfs.listDirectory("cbd").then((val) => {
        return new Promise((accept) => accept(val.FileStatuses.FileStatus[0].pathSuffix) );
    }).then((res) => {
        fs.readFile("cbd/testFile", (err, data) => {
	    var p1 = new Promise((accept) => accept(games()) );
	    //dfs.writeFile("cbd/testFile", data.toString('utf8'));
	    //.then((result) => {
            //    console.log(result);
            //});
        });
    }).catch((err) => {
        console.warn(err);
    });
}

function games(){
    var options = {
       url: 'https://api.twitch.tv/kraken/games/top?limit=11',
       headers: {
	 'Accept': 'application/vnd.twitchtv.v5+json',
	 'Client-ID': 'jl327dbx7x5m3niawzk0fsj5ac09z2'
       }
    };
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
	var info = JSON.parse(body);
	for(var i=0; i<info.top.length; i++){
	    var game = info.top[i].game.name;
	    var p2 = new Promise((accept) => accept(channels(game)) );
	}
      }
    }
    request(options, callback);
}

function channels(game){
    var optionsChannel = {
	   url: 'https://api.twitch.tv/kraken/streams/?limit=15&language=es&game='+game,
	   headers: {
		'Accept': 'application/vnd.twitchtv.v5+json',
		'Client-ID': 'jl327dbx7x5m3niawzk0fsj5ac09z2'
	   }
    };
    function callbackChannel(error, response, body) {
      if (!error && response.statusCode == 200) {
	var infoChannel = JSON.parse(body);
	var chan = [];
	for(var j=0; j<infoChannel.streams.length; j++){
		chan.push(infoChannel.streams[j].channel.name);
		var p3 = new Promise((accept) => accept(viewers(chan, game)) );
	}
	console.log(chan);
      }
    }
    request(optionsChannel, callbackChannel);
}

function viewers(chan, game){
    
    for(var z=0; z<chan.length; z++){
	    var optionsViewers = {
		   url: 'https://tmi.twitch.tv/group/user/'+chan[z]+'/chatters'
	    };
	    function callbackViewers(error, response, body) {
	      if (!error && response.statusCode == 200) {
		var infoViewer = JSON.parse(body);
		//var res = [];
		var newData = "";
		for(var d=0; d<infoViewer.chatters.viewers.length;d++){
			//res.push({viewer: infoViewer.chatters.viewers[d], game: game});
			newData = newData+infoViewer.chatters.viewers[d]+","+game+"\r\n";
		}
		dfs.appendFile("cbd/testFile", newData);
		//console.log(res);
	      }
	    }

	    request(optionsViewers, callbackViewers);
    }
	
	
}

main();
