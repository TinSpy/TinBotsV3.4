//node --max-old-space-size=8192 a/f.js
        bots = {};
		var v=0;
		var x=0;
var fs = require('fs-extra');
var path = require('path');
extend = require("extend");
var config = require('./config');
require("colors");
var AgarioClient = require('agario-client'); //Use this in your scripts
spawnCount = 0;
console.log(("Feeder Started." ).green.bold);
console.log(("Trying to Connect" ).red.bold);
console.log(("..." ).white);
console.log(("..." ).white);
console.log(("Successfully connected with Server").green.bold);

function FeederBot(bot_id, agent, bot_number, server, origin) {
    this.bot_id = bot_id; //ID of bot for logging

    this.interval_id = 0; //here we will store setInterval's ID
    this.ball_id = null;
    this.server = ''; //server address will be stored here
    this.client = new AgarioClient('Bot_' + this.bot_id); //creates new client
    this.client.debug = 0;
    this.client.agent = agent;
	this.client.headers          = {            //headers for WebSocket connection.
        'Origin': origin, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36','Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,es-ES','Accept-Encoding': 'gzip, deflate, sdch'
    };
	this.client.origin=origin;
    this.isOnFeedMission = false;
    this.lastsent = {minx: 0, miny: 0, maxx: 0, maxy: 0};
    this.onboard_client(server, bot_number);
	this.a = 0;
}

FeederBot.prototype = {
    log: function(text) {
        if (config.verbosityLevel > 0) {
            console.log('Bot_' + this.bot_id + ': ' + text);
        }
    },

    reset_map_data: function(){
        var bot = this;
        bot.map_min_x = null;
        bot.map_min_y = null;
        bot.map_max_x = null;
        bot.map_max_y = null;
    },

    onboard_client: function(server, bot_number) {
        var bot = this;
        setTimeout(function() {
            bot.connect(server);
        }, config.onboardingTimer * bot_number);
    },

    connect: function(server) {
        if (config.verbosityLevel > 0) {
            console.log('Entering Server ' + server);
        }

        if (spawnCount > config.maxBots) {
            console.log('ERROR: spawned to many bots - Increase config.maxBots for more bots.');
            return;
        }

        this.server = server;
        this.client.connect(server);
        this.attachEvents();
    },

    attachEvents: function() {
        var bot = this;
        bot.client.on('connected', function() {
			bot.a=0;
            bot.reset_map_data();
            spawnCount++;
            socket.emit("spawn-count"+v,spawnCount);
            bot.interval_id = setInterval(function() {
                bot.moveToPlayerPosWithOffset();
            }, 100);
        });

        bot.client.on('connectionError', function(e) {
			if(this.a<5){this.connect(game_server_ip);this.a++;} //Couldn't connect, try again.
        });

        bot.client.on('disconnect', function() {
			this.connect(game_server_ip); //Disconnected from the server, connect again!
            if (spawnCount > 0){ spawnCount--; bot_count--;}
            socket.emit("spawn-count", spawnCount + '/' + config.maxBots);
        });

		process.on('uncaughtException', function (err) {
		  console.log(err);
		});
		
		process.setMaxListeners(0);
		
        bot.client.on('packetError', function(packet, err, preventCrash) {
           bot.log('Packet error detected for packet: ' + packet.toString());
           bot.log('Crash will be prevented, bot will be disconnected');
           preventCrash();
           //bot.client.disconnect();
        });
    },

    moveToPlayerPosWithOffset: function() {
        bot = this;
        if(valid_player_pos==null)return
        //console.log("offset move " + offset_x + ";" + offset_y);

        bot.client.moveTo(valid_player_pos["x"], valid_player_pos["y"], valid_player_pos["l"],valid_player_pos["p"],valid_player_pos["c"]);
    },

};

var WebSocket = require('ws');
var valid_player_pos = null;
var reconnect = false;
var suicide_targets = null;
var socket = require('socket.io-client')(config.feederServer);

socket.on('pos', function(data) {
    valid_player_pos = data;
    //console.log(data);
});
socket.on('spawn-count', function(data) {
    n = data;
});
socket.on('cmd', function(data) {
    console.log("connected");
    if (data.server == "Bot splitted") {
        for (bot in bots) {
            bots[bot].client.split();
        }
    } else if (data.server == "Bot ejected") {
        for (bot in bots) {
            bots[bot].client.eject();
        }
    } else if (data.name == "connect_server") {
        if (data.ip == null) {
            return;
        }
        if (data.ip == "") {
            return;
        }
		if(x==1)process.exit(1);
        game_server_ip = data.ip;
		origin = data.origin;
        console.log("Found Server: " + game_server_ip);
		startFeederBotOnProxies()
    } else if(data.name == "reconnect_server") {
		reconnect = true;
		if (data.ip == null) {
            return;
        }
        if (data.ip == "") {
            return;
        }
        for (bot in bots) {
            bots[bot].client.disconnect();
        }
        bots = {};
        game_server_ip = data.ip;
		origin = data.origin;
        console.log("Found Server: " + game_server_ip);
	}
});

socket.on('force-login', function(data) {
	v++;
    console.log(data);
    if (data == "Spawning Bots") {
        return;
    }
    socket.emit("login", {
        "uuid": config.client_uuid,
        "type": "server"
    });
});

fs = require('fs');
var HttpsProxyAgent = require('https-proxy-agent');
var Socks = require('socks');

//object of bots
var bots = {};

bot_count = 0;

var fs = require('fs');
var lines = fs.readFileSync(config.proxies).toString().split("\n");
var url = require('url');
var game_server_ip = null;

function createAgent(ip,type) {

    data = ip.split(":");

    return new Socks.Agent({
            proxy: {
                ipaddress: data[0],
                port: parseInt(data[1]),
                type: parseInt(type)
            }}
    );
}

var proxy_mode = "SOCKS5";

function startFeederBotOnProxies() {
	if(x==1)return;
    for (proxy_line in lines) {

        if(lines[proxy_line].trim() == "#HTTP"){
            proxy_mode = "HTTP";
        }else if(lines[proxy_line].trim() == "#SOCKS4"){
            proxy_mode = "SOCKS4";
        }else if(lines[proxy_line].trim() == "#SOCKS5"){
            proxy_mode = "SOCKS5";
        }

        if (lines[proxy_line][0] == "#" || lines[proxy_line].length < 3) {
            continue;
        }

        //usefull for testing single proxies
        if (process.argv[3] != null && proxy_line != process.argv[3]) {
            continue;
        }

        proxy = "http://" + lines[proxy_line];
        proxy_single = lines[proxy_line];

        try {

            var opts = url.parse(proxy);

            if (proxy != null) {
                if(proxy_mode=="HTTP"){
                    agent = HttpsProxyAgent(opts);
                }else if(proxy_mode=="SOCKS4"){
                    agent = createAgent(lines[proxy_line],4);
                }else if(proxy_mode=="SOCKS5"){
					console.log(proxy_line);
                    agent = createAgent(lines[proxy_line],5);
                }

            } else {
                var agent = null;
            }

            if (lines[proxy_line] == "NOPROXY") {
                agent = null;
            }

            for (i = 0; i < config.botsPerIp; i++) {
				if(bot_count<config.maxBots){
					bot_count++;
					bots[bot_count] = new FeederBot(bot_count, agent, bot_count, game_server_ip, origin);
				}
            }

        } catch (e) {
            console.log('Error occured on startup: ' + e);
        }
    }
	x=1;
}