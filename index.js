const dfs = require("./services/dfs");
const fs = require('fs');
var request = require('request');
var StringDecoder = require('string_decoder').StringDecoder;
const moment = require('moment');

// Este método es el método de entrada que ejecuta games()
function main() {
    /*dfs.listDirectory("cbd").then((val) => {
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
    });*/
	var p1 = new Promise((accept) => accept(games()));
}

/*function games(){
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
	    var p2 = new Promise((accept) => accept(channels(game)) );
	}
      }
    }
    request(options, callback);
}*/

//Esta función llama a channels() con el juego que se desea analizar, es necesario modificar el valor de game para analizar
function games() {
	var game = "Warframe";
	var p2 = channels(game);
}

//Esta función obtiene mediante la API de Twitch un límite de 20 canales de habla hispana que estén jugando al juego
function channels(game) {
	var optionsChannel = {
		url: 'https://api.twitch.tv/kraken/streams/?limit=20&language=es&game=' + game,
		headers: {
			'Accept': 'application/vnd.twitchtv.v5+json',
			'Client-ID': 'jl327dbx7x5m3niawzk0fsj5ac09z2'
		}
	};
	function callbackChannel(error, response, body) {
		if (!error && response.statusCode == 200) {
			var infoChannel = JSON.parse(body);
			var chan = [];
			for (var j = 0; j < infoChannel.streams.length; j++) {
				chan.push(infoChannel.streams[j].channel.name);
				viewers(chan, game);
			}
			console.log(chan);
		}
	}
	request(optionsChannel, callbackChannel);
}

//Y esta función obtiene cada uno de esos canales y devuelve los espectadores que estén viéndolo
function viewers(chan, game) {

	for (var z = 0; z < chan.length; z++) {
		var optionsViewers = {
			url: 'https://tmi.twitch.tv/group/user/' + chan[z] + '/chatters'
		};
		const chann = chan[z];
		function callbackViewers(error, response, body) {
			if (!error && response.statusCode == 200) {
				var infoViewer = JSON.parse(body);
				//var res = [];
				var newData = "";
				var newDate = moment().format('YYYYDDMMhh');
				//Aquí se va concatenando los datos de la forma "espectador,juego,canal,fecha" (formato csv) y es enviado al servidor AWS
				for (var d = 0; d < infoViewer.chatters.viewers.length; d++) {
					//res.push({viewer: infoViewer.chatters.viewers[d], game: game});
					newData = newData + infoViewer.chatters.viewers[d] + "," + game + "," + chann + "," + newDate + "\r\n";
				}
				//Aquí se envía al servidor AWS concatenándo dicho string al final del archivo testFile en el servidor AWS
				dfs.appendFile("cbd/data.csv", newData).catch((err) => {
					console.log(err);
				});
				//console.log(res);
			}
		}

		request(optionsViewers, callbackViewers);
	}
	//dfs.writeFile("cbd/testFile", "");
}

main();
