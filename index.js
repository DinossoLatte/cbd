const dfs = require("./services/dfs");
const fs = require('fs');
var request = require('request');
var StringDecoder = require('string_decoder').StringDecoder;

// test de petición
function main() {
    dfs.listDirectory("cbd").then((val) => {
        return new Promise((accept) => accept(val.FileStatuses.FileStatus[0].pathSuffix) );
    }).then((res) => {
		var p1 = new Promise((accept) => accept(req1()) );
        /*fs.readFile("cbd/testFile", (err, data) => {
	    var str = [];
	    var p1 = new Promise((accept) => accept(req1(str)) );
	    dfs.writeFile("cbd/testFile", data.toString('utf8'));
	    .then((result) => {
                console.log(result);
            });
        });*/
    }).catch((err) => {
        console.warn(err);
    });
}

function req1(){
    var options = {
       url: 'https://api.twitch.tv/kraken/games/top?limit=1',
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
	    var p2 = new Promise((accept) => accept(req2(game)) );
	}
      }
    }
    request(options, callback);
}

function req2(game){
    var optionsChannel = {
	   url: 'https://api.twitch.tv/kraken/streams/?limit=1&language=es&game='+game,
	   headers: {
		'Accept': 'application/vnd.twitchtv.v5+json',
		'Client-ID': 'jl327dbx7x5m3niawzk0fsj5ac09z2'
	   }
    };
    function callbackChannel(error, response, body) {
      if (!error && response.statusCode == 200) {
	var infoChannel = JSON.parse(body);
	var channels = [];
	for(var j=0; j<infoChannel.streams.length; j++){
		channels.push(infoChannel.streams[j].channel.name);
		var p3 = new Promise((accept) => accept(req3(channels, game)) );
	}
      }
    }
    request(optionsChannel, callbackChannel);
}

function req3(channels, game){
    for(var z=0; z<channels.length; z++){
	    var optionsViewers = {
		   url: 'https://tmi.twitch.tv/group/user/'+channels[z]+'/chatters'
	    };
	    function callbackViewers(error, response, body) {
	      if (!error && response.statusCode == 200) {
		var infoViewer = JSON.parse(body);
		//var res = [];
		fs.readFile("cbd/testFile", (err, data) => {
			var newData = JSON.parse(data.toString('utf8'));
			for(var d=0; d<infoViewer.chatters.viewers.length;d++){
				//res.push({viewer: infoViewer.chatters.viewers[d], game: game});
				var num = data.find((name, game) => name==infoViewer.chatters.viewers[d] && game==game);
				if(num){
					var ind = data.findIndex((name, game) => name==infoViewer.chatters.viewers[d] && game==game);
					newData[ind]={name: infoViewer.chatters.viewers[d], game: game, number: num+1};
				}else{
					newData.push({name: infoViewer.chatters.viewers[d], game: game, number: 1});
				}
			}
			fs.writeFile("cbd/testFile", JSON.stringify(newData));
		});
		//console.log(res);
	      }
	    }
	    request(optionsViewers, callbackViewers);
    }
}

main();
