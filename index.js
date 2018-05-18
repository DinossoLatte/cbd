const dfs = require("./services/dfs");
const fs = require('fs');
var request = require('request');
var StringDecoder = require('string_decoder').StringDecoder;
const moment = require('moment');

const gamesList = ["League of Legends", "Fortnite", "Dota 2", "IRL", "PLAYERUNKNOWN'S BATTLEGROUNDS", "Hearthstone", "Overwatch", "World of Warcraft", "State of Decay 2",
	"Legend of Legaia", "Tom Clancy's Rainbow Six: Siege", "StarCraft II", "RuneScape", "Counter-Strike: Global Offensive", "Destiny 2", "Conan Exiles", "Music",
	"Black Desert Online", "Grand Theft Auto V", "Path of Exile", "Heroes of the Storm", "Escape From Tarkov", "Talk Shows", "FIFA 18", "Dead by Daylight", "World of Tanks",
	"Shadow Complex", "The Legend of Zelda: Breath of the Wild", "Arma 3", "Street Fighter V", "Xenoblade Chronicles 2", "Creative", "The Elder Scrolls: Legends", 
	"Minecraft", "Super Mario Maker", "Dark Souls II: Scholar of the First Sin", "Tekken 7", "Oxygen Not Included", "God of War", "Gwent: The Witcher Card Game", 
	"Warcraft III: The Frozen Throne", "Dragon Ball FighterZ", "Monster Hunter World", "Pillars of Eternity II: Deadfire", "Magic: The Gathering", "Always On",
	"Wizard of Legend", "Outlast", "Judgment: Apocalypse Survival Simulation", "osu!", "Darwin Project", "Mario Kart 8", "Retro", "Frostpunk", "Battlefield 1",
	"Rocket League", "ARK", "Dark Souls III", "Warframe", "Infestation: The New Z", "Farming Simulator 17", "Dying Reborn", "Grand Theft Auto: San Andreas", 
	"FINAL FANTASY XIV Online", "Terraria", "We Were Here Too", "Slay the Spire", "Super Mario Odyssey", "Stardew Valley", "Ring Of Elysium", "World of Warships",
	"Rust", "Lineage II: The Chaotic Chronicle", "H1Z1", "Summoners War: Sky Arena", "Heroes of Might and Magic III: The Shadow of Death", "VRChat", "The Legend of Zelda: Majora's Mask",
	"Paladins", "Spelunky", "Stay Close", "Smite", "DayZ", "Call of Duty: WWII", "Sea of Thieves", "Tibia", "Shadowverse", "The Elder Scrolls Online", "Thimbleweed Park",
	"GeoGuessr", "Deathgarden", "The Binding of Isaac: Afterbirth", "Bless Online", "Garry's Mod", "Stardew Valley", "Until Dawn", "BioShock Infinite", "Blade and Soul",
	"RimWorld", "ROBLOX", "Quake Champions", "They Are Billions", "MapleStory 2", "Age of Empires II", "Borderlands 2", "Bloodborne", "PUBG MOBILE", "Tera", "Aion",
	"Fallout 4", "NBA 2K18", "Battlerite", "Clash Royale", "Splatoon 2", "Far Cry 5", "The Witcher 3: Wild Hunt", "Subnautica", "The Sims 4", "Metin 2", "Radical Heights",
	"Dofus", "Team Fortress 2", "Cities: Skylines", "Cuphead", "NieR Automata", "Nioh", "Arena of Valor", "Don't Starve Together", "Sid Meier's Civilization V",
	"Dead Space 2", "Battlefield 4", "The Last of Us", "I Wanna Be The Guy", "Spore", "Kerbal Space Program", "Luigi's Mansion", "Arms", "Enter the Gungeon", 
	"ArcheAge", "Rise of the Tomb Raider", "Payday 2", "Forza Horizon 3", "Trove", "Hearts of Iron IV", "Life Is Strange", "Europa Universalis IV", "A Way Out", 
	"Doom", "Just Dance 2018", "Fallout: New Vegas", "Portal 2", "Watch Dogs 2", "Ni no Kuni II: Revenant Kingdom", "Dead Space 3", "Rayman Legends", "Life Is Strange: Before the Storm",
	"Slime Rancher", "Firewatch", "Microsoft Flight Simulator X", "Doki Doki Literature Club", "Guild Wars 2", "For Honor", "The Elder Scrolls V: Skyrim",
	"Diablo III: Reaper of Souls", "M.U.G.E.N", "Horizon Zero Dawn", "Granblue Fantasy", "Devil May Cry HD Collection", "Yu-Gi-Oh! Duel Links", "Astroneer", "EVE Online",
	"Football Manager 2018", "Elite: Dangerous", "Beyond: Two Souls", "Company of Heroes 2", "Princess Maker 5", "Ragnarok Online", "Undertale", "PlanetSide 2",
	"Call of Duty: Black Ops III", "Brawlhalla", "Final Fantasy XV", "APB Reloaded", "Super Smash Bros. Melee", "Super Smash Bros. for Wii U", "Deceit", "Lineage 2: Revolution"];

// Este método es el método de entrada que ejecuta games()
function main() {
	var p1 = new Promise((accept) => accept(games()));
}


//Esta función llama a channels() con el juego que se desea analizar, es necesario modificar el valor de game para analizar
function games() {
	for(var m=0;m<gamesList.length;m++){
		var game = gamesList[m];
		var p2 = channels(game);
	}
}

//Esta función obtiene mediante la API de Twitch un límite de 20 canales de habla hispana que estén jugando al juego
function channels(game) {
	var optionsChannel = {
		url: 'https://api.twitch.tv/kraken/streams/?limit=100&language=es&game=' + game,
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
