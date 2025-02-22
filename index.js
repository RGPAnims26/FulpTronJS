﻿const fs = require('fs');
const rp = require('request-promise');
const path = require('path');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

// require the discord.js module
const Discord = require('discord.js');
// create a new Discord client
const client = new Discord.Client();
const https = require('https');
const request = require('request');
const {Util} = require('discord.js');

const GoogleSpreadsheet = require('google-spreadsheet');
const {promisify} = require('util');

//command set up
client.commands = new Discord.Collection();

//extra shit
const ytdl = require('ytdl-core-discord');

// consts
const nonDiscordUserMsg = 'you need to be using Discord to get this feature!';

// NOTE IMPORTANT READ THIS
// This line is commented in the master/heroku version, but it is needed if you were to run the code locally
// let {prefix, token, clientID, luckyGuilds, luckyChannels, ownerID, NGappID, NGencKey, spreadsheetID, GOOGLE_API_KEY, MMappID} = require('./config.json');
let {prefix, token, clientID, luckyGuilds, luckyChannels, ownerID, NGappID, NGencKey, spreadsheetID, GOOGLE_API_KEY, MMappID} = require('./config.example.json');

//let gCreds = require('./fulpGdrive.json');
let gCreds = require('./fulpGdrive.json');

// THIS IS FOR HEROKU SHIT
if (process.env.prefix) prefix = process.env.prefix;
if (process.env.clientID) clientID = process.env.clientID;
if (process.env.ownerID) ownerID = process.env.ownerID;
if (process.env.token) token = process.env.token;
if (process.env.NGappID) NGappID = process.env.NGappID;
if (process.env.NGencKey) NGencKey = process.env.NGencKey;
if (process.env.spreadsheetID) spreadsheetID = process.env.spreadsheetID;
if (process.env.GOOGLE_API_KEY) GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (process.env.MMappID) MMappID = process.env.MMappID;
if (process.env.private_key_id) gCreds.private_key_id = process.env.private_key_id;
if (process.env.private_key) gCreds.private_key = process.env.private_key.replace(/\\n/g, '\n');

// Music bot shit
const YouTube = require(`simple-youtube-api`);
const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();

// gets filled later
// TODO: make it get filled in order consistently, often it fills the dogl section and deleteThis shit out of order
// see prepPics() like 5 lines lower to see the bullshit im trying to do lmao
const fulpPics = [];

let shoomOCound = 2;

function prepPics()
{
	getImages('fulp');
	console.log('Fulp shit');
	getImages('dogl');
	console.log('dogl shit');
	getImages('delete');
	console.log('delete shit');
	
}

// when the client is ready, run this code
// this event will trigger whenever your bot:
// - finishes logging in
// - reconnects after disconnecting
client.on('ready', () => 
{
	prepPics();

	console.log('Ready!');
	console.log(`....................................................................................................
	.............................................'''''''''''............................................
	.........................................'''' '''   '''''''''.......................................
	.....................................'''''''''''' '''''''''''''''...................................
	...................................'''''''.'''.''...........''.'''''................................
	...............................'''''''...-..--:----.-:--..........'''''.............................
	............................'''''....---::-::///::::::::----::----....''''..........................
	................................-:--::::/://////////::::::::::/::::....'''''........................
	..........................---:-::--://////////////:::.--:::---://///:-...'  ''......................
	.........................-:-:::-...::-:::::::-.-:---.'-.-----:-----://:/:-''' ''....................
	........................-::::-.''---...-----.''...''''''......------::::::-.'''''...................
	.....................-.-::--.'''.-.''''.....''..''''''''....'....---:-::://:-''' '..................
	.....................-.::--. ''..''''''.'.''...'' '''''....' ''.....--::-::/:.''' '.................
	....................-::/-..'''..''''''''''''..'''''  '.'''''' '........-:--:/:..'' '................
	....................:+/--.''''.'       '' ''''' ''''''''''''' '.''.'....----//-...'''...............
	...................://:... ''''             ''''.:-''' ''   ' '' ''''....---:/:--...''..............
	..................-/+:.'.'  '' '.:'       ''.--:+:'   '''   '  ' '''''''..---/:-:...''..............
	................:/:/:.'..'     :so:'    ./+osssyo'   ..'./' '  '  ''''' ''''.::-:...................
	.............../sy:/-.'.'    '-yh/.''.-ohhhyyyy/' '/+o:+yd: ''. '' '      ''.-.--...................
	.............-+yys::-''''    :dyoyysyhmmddhhhy:'':yhhyydmmh.''::-+:'..     ''''.....................
	............:oysss-..'   '::.ymmmmmmmNNNNmmmh:-oyddddmmmmmmy- '/yhdo-s/'     '..--.--...............
	...........:oyssss-.''   :hdsso+::--:+shdmmmhydmdddmmNNNNNNmd/''odmmsyyo. ''''.-:.-s/-..............
	..........-oysssss-.''   odh+/::::::::::/+sdmmmmdmmddyysosyyhhyo/hmmhysy:  ''.-::.:yy+..............
	.........-+yssssss:.'   .yhyyyyyyo/:-:oys++shdmmmdss+//::--.-:/osdmmdhyy/  ''.-:-.-syy:.............
	........./yyssssss/.'  'sdddhhysyo''-'/yhy++hdmNhsssssssoo++ososyyhmddhyo  ''.::.'-syh+.............
	........:oyssssssso.  'odddmhhhyso-''-ydhyosdmNNh+oysso+'' .-+ydhddmmhyys'  ''--..+ssho-............
	........+yyssssssss'' :ymmmmmdhhyyyyyyyyysoyhmNNy/shysys'. 'omdddmdmdhhhs'  ''..'/sssyy:............
	.......:oysssssssssy/'/hdmmmmmmmmddhhhhhhdshdmNNyyhhhhso/:/+syyhdmmmdhhhs.    ''-osssyh/............
	......./sysssssssssmy:yddmmmmmmmmmmNmmmmmmshdNNmshmmddhhyyhhhhyhdmmmmdhhy'   '-oossssyh+-...........
	.......+hysssssssssdmhyddmmmmmNmmmmmmmmmmdyydNNmhdmmmmmmmmmmmmmmmmmmmddds' './shsssssyh+............
	......-ohsssssssssssdhyddmdmNMMNmmmmmmmddhshdmNNmmmmmmmmmmmmNNNNmmmmmmmdo' .oodssssssyh/............
	......:syssssssssssssyyhdddmNNNNmmmmmmsyyyhmmmmNNmmddmdddddmNNNNmmmmmmmmo.:yohyssssssyh/............
	....../yyssssssssssssssyhddmmmmmmmmmdooyyhhdddmmNmmyymmddddmNNNmmmmmmmdhssyyyhsssssssyy/............
	......:yysssssssssssssssyhddmmmmmmmyo///-/yhhhysshd+/sdmmddmmmmmmmmmmdhyyhddyssssssssys:............
	......:sysssssssssssssoooyddmmmmmmysys//.-:osys::sysoshmmddmmmmmmmmddhsshddssssssssssh+-............
	......:shssssssssssssss/+shdddmmmdyhdmddhdhyydddddddyhhdmmmdmmdmddhhhs+sssssssssssssys/.............
	......-+hsssssssssssssso/oyhhhdmdhhdmmmmmmdhhddddmdddhhhmmmmmmmddhyys+ssssssssssssssyo/.............
	......./hyssssssssssssss++shhhhhyyhdmmmdddddddddddddddhydmddmmmdhyys+osssssssssssssss+-.............
	.......:yhsssssssssssssso/+yhhhss++++/++syyssysssyhhhhy+hmdmmmdhyys/sssssssssssssssy+/..............
	........ohyssssssssssssss+/oyddddmdyssysoo++++++////+oo:ydmmmmdys+/ossssssssssssssyo+-..............
	........-yhyssssssssssssso/+ohddmmmddhhhddhhhhhhhyyyyhdymmmmmdy+/ohsssssssssssssssy+:...............
	.........:yyssoo++/+///::-.:osdddmmmmmdhhhhhhhhhdddmmmmmNmddhs/+yhdssssssssssssssy+/................
	..........-/-..''''''''' '''/syhddmmmmmdhyyyyhdddmmmmmmmmdhs+/oyhdd+-:+oosssssssyo/-................
	..''''' ' '''''''''''''' '''o+oyhddmmmmmhsosyhddmmmmmmmmdyo//syhddd/''''.-/oosyy+:..................
	'   '''''''''''''''''''' ''.sh++oshdddddddhhhdmmmmmmmddyo/:yhyhhddd:'''''' '.:+/....................
	'''''''''''''''''''''''' ''-ssohyo+syyhhhhhhhddddddhso+//sshmhddddh.' '''''''''''...................
	'''''''''''''''''''''''''''-soyddhs//oosyyyyyyyyyss+///+hhyydmmddh:'' '''''''''' '''................
	''''''''''''''''''''''''' ''ssdmddho/+++o+++++++ooossooydddhdmmdh/''''''''''''''''''''..............
	''''''''''''''''''''''''''''/sdmmmdy+ooyyyyyhhhhddddysyddmmmmmdh:''''''''''''''''''''''''...........
	'''''''''''''''''''''''''' '.oymmmmmyshdddddddddddddyshmmmmmmdy:''''''''''''''''''''''''''''........
	''''''''''''''''''''''''''''''oydmmmdydmmmmNNNNNmmmmyhmmmmmdhs.''''''''''''''''''''''''''''''''.....
	'''''''''''''''''''''''''''' '-syhdmmmdmmdddmmmmmmmmmmmmmmdy+''''''''''''''''''''''''''''''''''''''.
	''''..'''''''''''''''''''''''''.oyyddmmmmmmmNNNmmmmmmmmmmhs-''''''''''''''''''''''''''''''''''''''''
	'....'''''''''''''''''''''''''''./ssyhdmmmmmmmmmmmmmmmmdy/''''' ''''''''''''''''''''''''''''''''''''
	....''''''''''''''''''''''''''''''./+syyhddddmmmdddddhs:''''   '''''''''''''''''''''''''''''''''''''
	....''''''   ''''''''''''''''''' ''''.:+oyyyyyyyso+/:.''''  '''''''''''''''''''''''''''''...''''''''
	..'''''''    '''''''''''''''''''  ''''''''....'''''''''  ''''''''''''' '''' '''''''''''......'''''''
	.'.''''       ''''''''''''''''''''''''''''''''''''''  ''''''''''            ''''''''''.......'''''''`);
	console.info("FULPTRON IS ONLINE");
	console.info(`FulpTron is on ${client.guilds.size} servers!`);
	console.info(client.guilds.map(g => g.name).join("\n"));

});

let ngRef = ['Cock joke. username is here', 'username, just do what comes natural -T', 'le username has arrived', 'username, do you remember what a tardigrade is?',
			'Angels sang out in an immaculate chorus, down from the heavends decended username', 'username was blammed for this post', 'username has nice titties for a lil boy',
		"Aw gee whiz I hope a username doesn't totally come out of nowhere and own me.", 'Cryptic metaphor -username', 'What the hell is private username doing in there?'];

client.on('guildMemberAdd', async member =>
{
	// code specific to the Flash Holes server
	if (member.guild.id == 283807027720093697)
	{
		let curRole = member.guild.roles.find("name", "Flash Hole");
			
		member.addRole(curRole);
	}

	//G
	let guildIndex = luckyGuilds.indexOf(member.guild.id);
	if (guildIndex != -1)
	{
		let infoPart = '*\nYou can use the command `fulpNGLogin` to sign into the Newgrounds API, and `fulpAddRole <role>` to give yourself other roles(`fulpRoles` to see all roles, and `fulpHelp` for more info)'

		let intro = ngRef[Math.floor(Math.random() * ngRef.length)];
		intro = intro.replace('username',  "**" + member.user.username + "**");

		return member.guild.channels.find('id', `{luckyChannels[guildIndex][0]}`).send("*" + intro + infoPart);
	}

});

client.on('message', async message => 
{
	// Don't respond to messages made by the bot itself
	if (message.author.id == clientID) return;

	let isInGuild = message.guild != null;
	let isDiscordUser = !message.author.bot;

	//RATING EMOTES ON NG SERVER
	let guildIndex = isInGuild ? luckyGuilds.indexOf(message.guild.id) : -1;
	if (guildIndex != -1 && luckyChannels[guildIndex].includes(message.channel.id))
	{
		if (!message.content.startsWith('[noreact]'))
		{
			if (message.attachments.size > 0 || message.content.startsWith("https://www.newgrounds.com/art/view") || message.content.startsWith('https://www.newgrounds.com/audio/listen/') || message.content.startsWith('https://www.newgrounds.com/portal/view/'))
			{
				let picoSuffix = "";
				if (Math.random() > 0.5)
					picoSuffix = "pico"

				message.react(message.guild.emojis.find('name', "0stars" + picoSuffix))
				.then(react => message.react(message.guild.emojis.find('name', "1star" + picoSuffix)))
				.then(react => message.react(message.guild.emojis.find('name', "2stars" + picoSuffix)))
				.then(react => 	message.react(message.guild.emojis.find('name', "3stars" + picoSuffix)))
				.then(react => message.react(message.guild.emojis.find('name', "4stars" + picoSuffix)))
				.then(react => message.react(message.guild.emojis.find('name', "5stars" + picoSuffix)));
			}
		}
	}


	if (message.content.toLowerCase() === "are we talking about tom fulp?" || message.content.toLowerCase() === "are we talking about tom fulp?" )
	{
		// message.reply basically the same as message.channel.send, but @'s the person who sent it
		message.reply("I **LOVE** talking about Tom Fulp!");
	}
	else if (message.content.toLowerCase() === "can i get a rip in chat?")
	{
		// message.reply basically the same as message.channel.send, but @'s the person who sent it
		message.reply("\nRIP\nRIP\nRIP");
	}

	//Automate Welcome Channel WIP
	/*if(message.content.toLowerCase() === "test" || message.channel.id() === "read-the-rules-for-access"){
		//message.member.addRole("NG");
		message.reply("works");

		let usr = args[0];
		if (usr == undefined)
		{
			return message.channel.send("Go to Newgrounds.com!\nhttps://newgrounds.com")
		}

		//let usr = args[0];
		//`https://${usr}.newgrounds.com`

		if(class === "level-${}-${}"){
			
		}
	}*/

	else if(message.content.toLowerCase() === "monster mashing"){
		message.reply("Did someone say M0NSTER MASHING!?\nhttps://www.newgrounds.com/portal/view/707498");
	}

	//IF IT DOESNT START WITH "FULP" then IT DONT REGISTER PAST THIS POINT
	else if (!message.content.toLowerCase().startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	// this message(and all others below it) does need a prefix, because it's after the if statement, and also needs the other info above, like command and args
	if (command == 'ping') 
	{
		// var emoji = Discord.emoji.from
		let pang = Math.round(client.ping);
		message.channel.send(`Pong! Ping: ${pang}ms`);
	}

	else if (command == 'shame')
	{
		message.channel.send('**SHAAAAAME**');
	}

	else if(command == 'die'){
		message.channel.send(`(＾A＾)  ̿ ̿'̿'\̵͇̿̿\з`);
	}

	else if (command == 'help')
	{
		message.channel.send("https://github.com/ninjamuffin99/FulpTronJS/blob/master/COMMANDS.md");
	}

	else if (command == 'emotetest')
	{
		if (!isInGuild) return;
		message.channel.guild.createEmoji('./pics/luis/luis.jpg', 'luis', [message.guild.roles.find('name', 'Newgrounder')])
	}

	else if (command == 'screenshare' || command =='share')
	{
		if (!isInGuild) return;
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}

		const { voiceChannel } = message.member;

		if (!voiceChannel) {
			return message.reply('please join a voice channel first!');
		}

		return message.channel.send('http://www.discordapp.com/channels/' + message.guild.id + '/' + voiceChannel.id)
	}

	const serverQueue = isInGuild ? queue.get(message.guild.id) : null;
		console.log(serverQueue);
	 
	if (command == 'play' || command == 'join') 
	{
		if (!isInGuild) return;
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		//return message.channel.send("WOOPS if you are reading this fulpPlay is BUSTED right now. Ur boy ninjamuffin already knows this and is tryin to fix it");

		const searchString = args.slice(0).join(" ");
		const url = args[0] ? args[0].replace(/<(.+)>/g, '$1') : '';

		if (message.channel.type !== 'text') return;

		const { voiceChannel } = message.member;

		if (!voiceChannel) {
			return message.reply('please join a voice channel first!');
		}

		const permissions = voiceChannel.permissionsFor(message.client.user);

		/*
		if (!message.member.speaking)
		{
			return message.channel.send('You are muted, so it is likely you should not be using me!');
		}
		*/
		if (!permissions.has('CONNECT'))
		{
			return message.channel.send("I can't join that voice channel with my current roles :(");
		}
		if (!permissions.has('SPEAK'))
		{
			return message.channel.send('I cannot speak in this voice channel with my current permissions :(');
		}
		if (!message.member.voiceChannel.memberPermissions(message.member).has('SPEAK'))
		{
			return message.channel.send('You do not have permission to speak in this channel, so it is likely you should not be using me either!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) 
		{
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) 
			{
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return message.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
		} 
		else 
		{
			try 
			{
				var video = await youtube.getVideo(url);
			} 
			catch (error) 
			{
				try 
				{
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					message.channel.send(`
__**Song selection:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
**Please provide a value to select one of the search results ranging from 1-10.**
					`);
					// eslint-disable-next-line max-depth
					try 
					{
						var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} 
					catch (err) {
						console.error(err);
						return message.channel.send('No or invalid value entered, cancelling video selection.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} 
				catch (err) 
				{
					console.error(err);
					return message.channel.send('🆘 I could not obtain any search results.');
				}
			}
			return handleVideo(video, message, voiceChannel);
		}
	} else if (command === 'skip') {
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
		if (!message.member.voiceChannel.memberPermissions(message.member).has('SPEAK'))
		{
			return message.channel.send('You do not have permission to speak in this channel, so it is likely you should not be using me either!');
		}
		
		if (!serverQueue) return message.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === 'stop') {
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
		if (!message.member.voiceChannel.memberPermissions(message.member).has('SPEAK'))
		{
			return message.channel.send('You do not have permission to speak in this channel, so it is likely you should not be using me either!');
		}
		
		if (!serverQueue) return message.channel.send('There is nothing playing that I could stop for you.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return undefined;
	} else if (command === 'volume') {
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');

		if (!message.member.voiceChannel.memberPermissions(message.member).has('SPEAK'))
		{
			return message.channel.send('You do not have permission to speak in this channel, so it is likely you should not be using me either!');
		}
		
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		if (!args[0]) return message.channel.send(`The current volume is: **${serverQueue.volume}**`);
		if (args[0] > 200) return message.channel.send('pls do not use FulpTron for evil (max volume is 200)');
		serverQueue.volume = args[0];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
		return message.channel.send(`I set the volume to: **${args[0]}**`);
	} else if (command === 'np' || command === 'nowplaying') {
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		return message.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
	} else if (command === 'queue' || command === 'q') {
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		return message.channel.send(`
__**Song queue:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Now playing:** ${serverQueue.songs[0].title}
		`);
	} else if (command === 'pause') {
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return message.channel.send('⏸ Paused the music for you!');
		}
		if (!message.member.voiceChannel.memberPermissions(message.member).has('SPEAK'))
		{
			return message.channel.send('You do not have permission to speak in this channel, so it is likely you should not be using me either!');
		}
		
		return message.channel.send('There is nothing playing.');
	} else if (command === 'resume') {
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		if (serverQueue && !serverQueue.playing) 
		{
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return message.channel.send('▶ Resumed the music for you!');
		}
		return message.channel.send('There is nothing playing.');
	}

	 
	// STUPID JS NOTE: MAKE SURE YOU USE ` BACKTICKS LIKE THIS, INSTEAD OF ' APOSTROPHES LIKE THIS
	// IF YOU WANT TO USE EZ VARIABLES AND SHIT
	else if (command == 'server') 
	{
		if (!isInGuild) return;
		message.channel.send(`This server's name is: ${message.guild.name}
Total members: ${message.guild.memberCount}
Server Region: ${message.guild.region}
		
FulpTron joined this server at: ${message.guild.joinedAt}
The Owner is: ${message.guild.owner.user.username}`);
	}

	else if (command == 'invite')
	{
		message.channel.send(`Use this link to invite FulpTron to a server that you have admin access on! https://discordapp.com/oauth2/authorize?client_id=${clientID}&scope=bot&permissions=8`);
	}

	else if (command == 'discord')
	{
		message.channel.send("https://discord.gg/HzvnXfZ");
	}

	else if (command == 'kick')
	{
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		if (!message.member.permissions.has("KICK_MEMBERS"))
		{
			return message.reply("you don't have permission to kick u doof!");
		}
		if (!message.mentions.users.size)
		{
			return message.reply('you need to @ someone to kick em')
		}

		const taggedUser = message.mentions.users.first();

		message.channel.send(`You wanted to kick: ${taggedUser.username}`);
	}

	else if (command == 'prune' || command == 'purge')
	{
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}
		if (!message.member.hasPermission('MANAGE_MESSAGES'))
		{
			return message.channel.send("You need to have the permission 'Manage Messages' enabled for one of your roles!");
		}

		const amount = parseInt(args[0]) + 1;

		if (isNaN(amount))
		{
			return message.reply('that does not seem to be a valid number');
		}
		else if (amount <= 1 || amount > 100)
		{
			return message.reply('you need to input a number between 1 and 99');
		}

		message.channel.bulkDelete(amount, true).catch(err =>
		{
			console.error(err);
			message.channel.send("OOPSIE WOOPSIE!! Uwu We madea fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!");
			message.channel.send("acutally there was just an error trying to prune message oopsies");
		})
	}

	else if (command == "uptime"){
		//message.reply(`Current uptime is : ${client.uptime.toPrecision(2) * 0.001} seconds`)
		let totalSeconds = (client.uptime / 1000);
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = totalSeconds % 60;
		let sec = Math.floor(seconds);
		let uptime = `${hours} hours, ${minutes} minutes and ${sec} seconds`;
		message.reply("Current uptime is : " + uptime);
	}

	else if (command == "points")
	{
		if (!isInGuild) return;
		let score = client.getScore.get(message.author.id, message.guild.id);
		if (!score)
		{
			score = {id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 };
		}
		score.points++;
		
		const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
		if(score.level < curLevel) 
		{
		  score.level++;
		  message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
		}

		console.log(`level status: ${curLevel} / ${score.level}`);

		client.setScore.run(score);
		console.log(score);
	}

	else if (command == "picarto")
	{
		let username = args[0];
		let url = `https://api.picarto.tv/v1/channel/name/${username}`;

		https.get(url, (resp) => 
		{
			let data = '';

			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
			  data += chunk;
			});

			resp.on('end', () => {
				console.log(JSON.parse(data));
				JSON.parse(data, (key, value) =>
				{
					if (key == "online")
					{
						if (value)
						{
							message.channel.send(`${username} is streaming!`)
						}
						else
							message.channel.send(`${username} is not streaming :(`)
					}
				});

			  });
		});

	}


	else if (command == "quiz")
	{
		// https://opentdb.com/api.php?amount=1

		let url = `https://opentdb.com/api.php?amount=1`;



		https.get(url, (resp) => 
		{
			let data = '';

			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
			  data += chunk;
			});

			resp.on('end', () => {
				let theQuiz = JSON.parse(data).results[0];
				console.log(JSON.parse(data).results[0])

				let messageSending = theQuiz.category + "\n" + unescapeHTML(theQuiz.question);

				let answerArray = theQuiz.incorrect_answers;
				let correctAnswerPos = Math.floor(Math.random() * (theQuiz.incorrect_answers.length + 1));
				console.log("Answer is " + correctAnswerPos);
				answerArray.splice(correctAnswerPos, 0, theQuiz.correct_answer)

				for (let a = 0; a < answerArray.length; a++)
				{
					messageSending += "\n" + (a + 1) + ". " + answerArray[a];
				}

				message.channel.send(messageSending).then(() =>
				{
					message.channel.awaitMessages(mess => mess.content.startsWith(correctAnswerPos + 1), {
						max: 1,
						time: 20000,
						errors: ['time'],
					  })
					  .then((collected) => {
						  message.reply(`You got the right answer i think, ${theQuiz.correct_answer}`);
						})
						.catch(() => {
						  message.channel.send(`Ran outta time, the correct answer was ${(correctAnswerPos + 1) + ". " + theQuiz.correct_answer}`);
						});
				});

// message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {

			  });
		});

	}



	else if (command == 'roles')
	{
		if (!isInGuild) return;
		let roleList = message.guild.roles.map(r => {
			if (["Admins", 'Moderators', "@everyone", 'BrenBot', 'Mr. Fulp', 'Contributor', 'Nitro Booster'].indexOf(r.name) > -1 || r.name.endsWith('Collab'))
				return "";
			else
				return r.name;
		}).join("--");
		message.channel.send("Roles on " + message.guild.name + "\n " + roleList)
	}

	//Cam you do it
	else if (command == "addrole"){
		if (!isInGuild) return;
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}

		let role = args.slice(0).join(" ");
		if (role.endsWith('Collab'))
			return message.reply('Message the collab organizer if you would like to participate in this collab!');

		if (['Admins', "Moderators", 'BrenBot', 'Contributor', 'james'].indexOf(role) > -1)
			return message.reply('Hey stop that!');
		if (["Newgrounder", 'Supporter'].indexOf(role) > -1)
			return message.reply('the role "' + role + '" requires you to log into the Newgrounds API. Use the command `fulpNGLogin`');
		let curRole = message.guild.roles.find("name", role);

		if (!message.guild.roles.exists("name", role))
		{
			return message.reply(`This server doesn't seem to have ${role} as a role... you should know that the roles are case sensitive!`)
		}
		if (message.member.roles.exists("name", role))
		{
			return message.reply(`you already have the ${curRole.name} role!`)
		}
			
		message.member.addRole(curRole);
		message.reply(`just got the ${curRole.name} role!`);
	}

	else if (command == "removerole")
	{
		if (!isInGuild) return;
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}

		let role = args.slice(0).join(" ");
		if (['Blammed'].indexOf(role) > -1)
			return message.reply('lol dummy');
		let curRole = message.guild.roles.find('name', role);

		if (!message.guild.roles.exists("name", role))
		{
			return message.reply(`This server doesn't seem to have ${role} as a role... you should know that the roles are case sensitive!`)
		}
		if (!message.member.roles.exists("name", role))
		{
			return message.reply(`you already had the ${curRole.name} role removed!`)
		}

		message.member.removeRole(curRole).then(message.reply(`removed your ${curRole.name} role!`))
	}
	/* 
	if (command == "timeout" && message.author.role("mod"))
	{
		if (!isInGuild) return;
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}

		let usr = args[0];
		
		if (!message.guild.roles.exists("name", role))
		{
			return message.reply(`This server doesn't seem to have ${role} as a role... you should know that the roles are case sensitive!`)
		}
		if (message.member.roles.exists("name", role))
		{
			return message.reply(`you alread have the ${curRole.name} role!`)
		}

		message.member.addRole(curRole);
		//message.reply('just got the ${curRole.name} role!');
	}
	 */
	else if (command == 'args-info')
	{
		if (!args.length)
		{
			return message.channel.send(`You didn't provide any arguments, ${message.author}`);
		}

		message.channel.send(`Command name: ${command}\nArgumenets: ${args}`);
	}

	else if (command === "asl") 
	{
		let age = args[0]; // Remember arrays are 0-based!.
		let sex = args[1];
		let location = args[2];
		message.reply(`Hello ${message.author.username}, I see you're a ${age} year old ${sex} from ${location}. Wanna date?`);
	}

	else if (command == 'cringe' || command == 'snap')
	{
		message.channel.send('brandyCringe.png', {file: "pics/brandy/brandyCringe.png"});
	}

	else if (command == 'dogl' || command == 'dogg')
	{
		

		let curPic = randomFromArray(1);
		console.log("THE PIC");
		console.log(curPic);

		message.channel.send(curPic, {file: "pics/dogl/" + curPic});
	}

	else if ( command == 'delete' || command == 'delet' || command == 'gun')
	{
		let curPic = randomFromArray(2);
		console.log("THE PIC");
		console.log(curPic);

		message.channel.send(curPic, {file: "pics/delete/" + curPic});
	}

	if (command == `pic`)
	{
		if (args[0] == "luis")
		{
			return message.channel.send("luis.jpg", {file: "pics/luis/" + "luis.jpg"});
		}

		if (args[0] == 'dogl' || args[0] == "dogg")
		{
			let curPic = randomFromArray(1);
			console.log("THE PIC");
			console.log(curPic);

			return message.channel.send(curPic, {file: "pics/dogl/" + curPic});
		}

		let curPic = randomFromArray(0);
		console.log("THE PIC");
		console.log(curPic);

		message.channel.send(curPic, {file: "pics/fulp/" + curPic});
	}

	else if (command == "watching")
	{
		let text = args.slice(0).join(" ");
		client.user.setActivity(text, { type: 'WATCHING'});
	}

	else if (command == 'playing') 
	{
		let text = args.slice(0).join(" ");
			client.user.setActivity(text, { type: 'PLAYING' })
			.then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
  			.catch(console.error);
	}

	else if (command == "shoom" || command == "jojo")
	{
		let shoomBeginning = "**SH";

		for (i = shoomOCound; i > 0; i--)
		{
			shoomBeginning += "O";
		}

		shoomBeginning += "M**";
		shoomBeginning += `\nO Amount: ${shoomOCound}`

		shoomOCound += 1;

		message.channel.send(shoomBeginning);

	}

	else if (command === 'say')
	{
		let text = args.slice(0).join(" ");
		message.delete();
		message.channel.send(text);
		
		console.log(message.author.username + " says: " + text);
	}

	else if (command == 'roll')
	{
		let min = 1;
		let max = parseInt(args[0]);

		if (isNaN(max))
			max = 20;
		
		message.channel.send(`🎲 You rolled a: ${Math.floor(Math.random() * (max - min + 1)) + min}`)

	}

	else if (command == 'ngfollow')
	{
		let usr = args[0];
		if (usr == undefined)
		{
			return message.channel.send("Go to Newgrounds.com!\nhttps://newgrounds.com")
		}
		else
		{
			if (usr == 'Tom' || usr == 'TomFulp')
			{
				return message.channel.send("Go follow Tom Fulp himself on Newgrounds!\nhttps://TomFulp.newgrounds.com")
			}
			message.channel.send(`Go follow ${usr} on Newgrounds!\nhttps://${usr}.newgrounds.com`)
		}
	}

	else if (command == 'loli')
	{
		 message.channel.send({ files: ['https://cdn.discordapp.com/attachments/422660110830272514/446516094006460417/unknown.png']})
		.then(message.channel.send('**inb4 BAN**'))
		.then(message.channel.send({ files: ['https://cdn.discordapp.com/attachments/422660110830272514/446516105880535041/unknown.png']}));
	}

	else if (command == 'source' || command == 'sourcecode' || command == 'github')
	{
		message.channel.send("Dig through my code on Github: \nhttps://github.com/ninjamuffin99/FulpTronJS");
	}

	// WARNING VERY DANGEROUS COMMAND THAT CAN RUIN THE BOT'S HOST IF IN THE WRONG HANDS
	// BUT IM CODING IT IN FOR THE LOLS LMAOOO
	// make sure you set 'ownerID' as your discord ID (the numbers and shit) to make sure that no goon besides the host uses it
	else if (command == 'eval')
	{
			if (message.author.id !== ownerID) return;
			try
			{
				const code = args.join(" ");
				let evaled = eval(code);

				if (typeof evaled !== "string")
					evaled = require("util").inspect(evaled);

				message.channel.send(clean(evaled), {code:"xl"});

			}
			catch(err)
			{
				message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
			}
	}

	else if (command == 'ngplay')
	{
		if (!isDiscordUser)
		{
			return message.reply(nonDiscordUserMsg);
		}

		if (!message.member.voiceChannel.memberPermissions(message.member).has('SPEAK'))
		{
			return message.channel.send('You do not have permission to speak in this channel, so it is likely you should not be using me either!');
		}

		let songUrl = args[0];

		if (songUrl == undefined)
			return message.channel.send("Please leave a link to a Newgrounds audio submission!")

		if (songUrl.startsWith('https://www.newgrounds.com/playlists'))
		{
			const options = {
				uri: songUrl,
				transform: function (body) {
				  return cheerio.load(body);
				}
			  };

			  rp(options)
			  .then(($) => {
				  let songList = $('.itemlist.alternating').find('li');
				  
				  for (let i = 0; i < songList.toArray().length; i++)
				  {
					let daSong = songList.toArray()[i].children[1].children[1].attribs.href;
					daSong = daSong.slice(2, daSong.length);
					daSong = "https://" + daSong;
					handleNGSongs(daSong, message, message.member.voiceChannel, true);
				  }
			  });
		}
		else
		{
			handleNGSongs(songUrl, message, message.member.voiceChannel);
		}

		
	}

	// cheerio.js scraping help and info:
	// https://codeburst.io/an-introduction-to-web-scraping-with-node-js-1045b55c63f7
	// also check out the cheerio.js github and website
	else if (command == "ngscrape" || command == 'scrape' || command == 'stats')
	{

		//return message.channel.send("woops this command is busted right now sorry lolol");

		let usr = args[0];

		if (usr === undefined)
			return message.reply("please input a newgrounds username!");
	
		// Buuilds the embed
		let embed = new Discord.RichEmbed()
		.setURL(`https://${usr}.newgrounds.com`)
		.setTitle(`${usr}'s stats on Newgrounds`, )
		.setTimestamp()
		.setColor(0xfda238)
		.setThumbnail("https://i.ytimg.com/vi/ZRFIqusuqN8/maxresdefault.jpg");
		// Dont want this stinky footer image
		// .setImage("https://desu-usergeneratedcontent.xyz/g/image/1499/80/1499801793392.png");

		

		const options = {
			uri: `https://${usr}.newgrounds.com`,
			transform: function (body) {
			  return cheerio.load(body);
			}
		  };
		  
		  rp(options)
			.then(($) => {
				let ngInfo = $('.user-header').text();
				let ngArray = ngInfo.split("\n");

				let ngInfo2 = $('.stats-general').text();
				let ngArray2 = ngInfo2.split("\n");

				infoClean(ngArray);
				infoClean(ngArray2);

				function infoClean(curList)
				{
					// NOTE This needs  alot of cleaning up. Currently the ngArray just slices out the first few bits, and the embed doesn't account
					// for if the user doesn't have a certain submission type, so currrently the embed is commented out
					let listOfShit = curList;
					let secondArray = [];

					// CLEANS THE ARRAY
					for (var i=0; i < listOfShit.length; i++)
					{
						listOfShit[i] = listOfShit[i].trim();
						listOfShit[i] = listOfShit[i].replace(/\t/g, "");
					}
					listOfShit = listOfShit.filter(function(value, index, arr)
					{
						return value != "";
					});

					listOfShit[listOfShit.length - 1] = listOfShit[listOfShit.length - 1].replace("Medals", " Medals");
					listOfShit[listOfShit.length - 1] = listOfShit[listOfShit.length - 1].replace("Supporter", " Supporter");
					let trophMedSupps = listOfShit[listOfShit.length - 1].split(" ");
					listOfShit.pop();

					trophMedSupps.forEach(function(shit)
					{
						/*
						if (shit.toLowerCase().trim().startsWith("supporter"))
						{
							console.log("CLEANED SUPP SHIT LAOSADKOASD");
							shit.concat(trophMedSupps[trophMedSupps.length - 2]);
							shit.concat(trophMedSupps[trophMedSupps.length - 1]);
							trophMedSupps.pop();
							trophMedSupps.pop();
							listOfShit.pop();
							listOfShit.pop();
						}
						*/
						listOfShit.push(shit)
						
					});
						
					for (var i=0; i < listOfShit.length; i++)
					{
						let dumb = listOfShit[i].trim();
						dumb = dumb.replace(/:/g, ": ");
						dumb = dumb.replace("Medals", " Medals");
						dumb = dumb.replace("Supporter", " Supporter");
						if (dumb.length > 0)
							secondArray.push(dumb);
					}

					let splitShit = secondArray.join('\n');

					embed.addField(`Submission stats`, `${splitShit}`, true);

				}

				message.channel.send({embed});
				// message.channel.send($('.stats-general').text());
			})
			.catch((err) => {
			  console.log(err);
			  message.channel.send(`an error occured.. did you enter in an actual Newgrounds user??` );
			});
		
	}

	else if (command == "nglogout")
	{
		if (!isInGuild) return;
		const doc = new GoogleSpreadsheet(spreadsheetID);
		await promisify(doc.useServiceAccountAuth)(gCreds);
		const info = await promisify(doc.getInfo)();

		const sheet = info.worksheets[0];
		console.log(`Title: ${sheet.title}, Rows: ${sheet.rowCount}`);

		const Rows = await promisify(sheet.getRows)({
				offset: 1
		});

		let rowToDelete = null;


		Rows.forEach(function(row, index)
		{
			if (row.discord == message.author.id)
			{
				rowToDelete = row;
				console.log("FOUND USER...");
				console.log(row.session);
			}
			else
			{
				console.log("NOT USER");
			}

			console.log(`SIGNED IN: ${row.expired}`);

			console.log(`Discord ID: ${row.discord}`);
			console.log(`Session ID: ${row.session}`);
			console.log(`Newgrounds Username ${row.newgrounds}`);
			console.log(`Is Supporter: ${row.supporter}`);
			console.log("----------");
		});

		if (rowToDelete)
		{
			rowToDelete.del();
			return message.reply("all your base are belong back to you.");
		}
	}

	else if (command == "nglogin")
	{
		if (!isInGuild) return;
		const doc = new GoogleSpreadsheet(spreadsheetID);
		await promisify(doc.useServiceAccountAuth)(gCreds);
		const info = await promisify(doc.getInfo)();

		const sheet = info.worksheets[0];
		console.log(`Title: ${sheet.title}, Rows: ${sheet.rowCount}`);

		const Rows = await promisify(sheet.getRows)({
				offset: 1
		});

		let signedIn = false;
		let userInDatabase = false;


		Rows.forEach(async function(row, index)
		{
			if (row.discord == message.author.id)
			{
				userInDatabase = true;
				console.log("FOUND USER...");
				console.log(row.session);
				var inputData = {
					"app_id": NGappID,
					"debug": true,
					"session_id": row.session,
					"call": {
						"component": "App.checkSession",
						"parameters": {},
						}
					};
			
				request.post(
					'https://www.newgrounds.io/gateway_v3.php',
					{ form: {input: JSON.stringify(inputData)} },
					function (error, response, body) 
					{
						//console.log("BODY")
						//console.log(body);
						let parsedResp = JSON.parse(response.body);
						
						console.log(JSON.parse(response.body));
						row.expired = parsedResp.result.data.session.expired;
						signedIn = !row.expired && parsedResp.result.data.session.user;
						if (signedIn)
						{
							row.newgrounds = parsedResp.result.data.session.user.name;
							row.supporter = parsedResp.result.data.session.user.supporter;

							if (isDiscordUser)
							{
								message.member.setNickname(parsedResp.result.data.session.user.name);

								message.reply("successfully signed into the Newgrounds API!");
								let role = message.guild.roles.find('name', 'Newgrounder');
								if (role)
								{
									message.member.addRole(role);
								}
								else
								{
									console.error('Newgrounder role does not exist on this guild');
								}

								if (row.supporter)
								{
									role = message.guild.roles.find('name', 'Supporter');
									if (role)
									{
										message.member.addRole(role);
									}
									else
									{
										console.error('Supporter role does not exist on this guild');
									}
								}
							}
							else
							{
								message.reply("signed into the Newgrounds API, but without any Discord-specific features.");
							}
						}

						row.save();
					}
				);
			}
			else
			{
				console.log("NOT USER");
			}

			console.log('SIGNED IN: ' + signedIn)

			console.log(`Discord ID: ${row.discord}`);
			console.log(`Session ID: ${row.session}`);
			console.log(`Newgrounds Username ${row.newgrounds}`);
			console.log(`Is Supporter: ${row.supporter}`);
			console.log("----------");
		});

		console.log('USERS IN DATABASE: ' + userInDatabase)

		if (!userInDatabase)
		{
			var inputData = {
				"app_id": NGappID,
				"debug": true,
				"call": {
					"component": "App.startSession",
					"parameters": {},
					}
				};
		
				request.post(
					'https://www.newgrounds.io/gateway_v3.php',
					{ form: {input: JSON.stringify(inputData)} },
					async function (error, response, body) {
						//console.log("BODY")
						//console.log(body);
						let parsedResp = JSON.parse(response.body);
						
						const ngUser = {
							discord: message.author.id,
							session: parsedResp.result.data.session.id
						};

						if (isDiscordUser)
						{
							await promisify(sheet.addRow)(ngUser);

							console.log(parsedResp);
							message.reply('link sent. Confirm it and then type fulpNGLogin here again!');
							message.author.send(`FulpTron will NOT have access to your Newgrounds password!!!\nFeel free to check the source code using the fulpSource command\nClick this link to sign into Newgrounds: ${parsedResp.result.data.session.passport_url}\nAnd then type in fulpNGLogin again to get the roles!`);
						}
						else
						{
							if (args.length != 1)
							{
								message.reply("Looks like you're not a Discord user. To log in, use this same command, but also type your email. (Don't worry, I'll take good care of it!)");
							}
							else
							{
								try
								{
									let transporter = nodemailer.createTransport({
										host: 'localhost',
										port: 25,
										tls: {
											rejectUnauthorized: false
										}
									});

									let info = await transporter.sendMail({
										from: '"FulpTronJS" <noreply-fulptron@miscworks.net>',
										to: `${args[0]}`,
										subject: 'FulpTron login',
										text: `Hi,\nLooks like you asked to link your Newgrounds account with a FulpTron-managed Discord server.\nFulpTron will NOT have access to your Newgrounds password!!!\nFeel free to check the source code using the fulpSource command\nClick this link to sign into Newgrounds: ${parsedResp.result.data.session.passport_url}\nAnd then type in fulpNGLogin again to get the roles!\n\nIf none of this rings a bell, disregard this email.`
									});

									await promisify(sheet.addRow)(ngUser);

									message.delete();
									message.reply("email se--I mean, what's an email? (Psst, type fulpNGLogin here again when you're done. If you get stuck, type fulpNGLogout.)");
								}
								catch (error)
								{
									message.reply("couldn't send an email. Check that it wasn't mistyped.");
								}
							}
						}
					}
				);
		}
	}
	

	else if (command == "mmscores")
	{

		var inputData = {
			"app_id": MMappID,
			"debug": false,
			"call": {
				"component": "ScoreBoard.getScores",
				"parameters": 
				{
					"id": 8004,
					"limit": 20,
					"period": "A"
				},
			}
		};
	
		request.post(
			'https://www.newgrounds.io/gateway_v3.php',
			{ form: {input: JSON.stringify(inputData)} },
			function (error, response, body) {
				console.log("RESPONSE")
				let parsedResp = JSON.parse(response.body);
				console.log(parsedResp);
				
				let scorePos = 0;

				let embed = new Discord.RichEmbed()
				.setURL(`https://www.newgrounds.com/portal/view/707498`)
				.setTitle(`Monster Mashing Hall Of Shame`, )
				.setTimestamp()
				.setColor(0xF30DFF)
				.setThumbnail("https://i.imgur.com/PMJb6SI.png");

				let field1 = [];
				let field2 = [];

				let listOfPeople = parsedResp.result.data.scores.map(s => {
					scorePos += 1;
					if (scorePos <= 10)
					{
						field1.push(`${scorePos}. [${s.user.name}](https://${s.user.name}.newgrounds.com) --- ${s.formatted_value}`);
					}
					else
						field2.push(`${scorePos}. [${s.user.name}](https://${s.user.name}.newgrounds.com) --- ${s.formatted_value}`);

					return `${scorePos}. [${s.user.name}](https://${s.user.name}.newgrounds.com) --- ${s.formatted_value}`;
				});

				console.log(listOfPeople.length);

				embed.addField("Distance", field1);
				embed.addField(" - ", field2);

				message.channel.send({embed});

				}
		);

	}

	else if (command == "testerror" && message.channel.author.id == ownerID)
		message.channel.send(` <@${ownerID}> an error occured`);
	/* 
	if (command == "ngaura")
	{
		let usr = args[0];

		if (usr === undefined)
			return message.reply("please input a name");
	
		const options = {
			uri: `https://${usr}.newgrounds.com`,
			transform: function (body) {
			  return cheerio.load(body);
			}
		  };
		  
		  rp(options)
			.then(($) => {
			  console.log($('.user-header-nav').text());
			  message.channel.send($('.user-header-nav').text());
			})
			.catch((err) => {
			  console.log(err);
			});
		
	}
 	*/
});

function clean(text)
{
	if (typeof(text) == "string")
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	else
		return text;
}

function handleNGSongs(songUrl, message, voicechannel, playlist=false)
{
	if (!songUrl.startsWith('https://www.newgrounds.com/audio'))
		return message.channel.send(`Woops, submission *${songUrl}* is not an audio submission, skipping...`)

	songUrl = songUrl.replace("listen", "feed");
	//console.log(songUrl);

	request.get(songUrl, {},
	function (error, response, body) 
	{
		let resp = JSON.parse(body);
		//console.log(resp);

		if (!resp.allow_external_api)
			return message.channel.send(`Sorry! The author of *${resp.title}* (NG user ${resp.authors[0].name}) has not allowed external API access, so it cannot be played. Message the author if you want this to be changed!`)

		const song = {
			id: resp.id,
			title: resp.title,
			url: resp.stream_url
		};
		
		console.log(song.url)

		
		if (song.url.length <= 2)
			return message.channel.send(`Song ${song.title} by ${resp.authors[0].name} cannot be played because they are not scouted yet!`)
		

		handleVideo(song, message, message.member.voiceChannel, playlist);
	});
}

async function handleVideo(video, message, voiceChannel, playlist = false) {
	const serverQueue = queue.get(message.guild.id);
	console.log(video);
	let isOnNG = video.url.startsWith("https://audio.ngfiles.com");
	console.log(video.url);

	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: video.url,
		onNG: isOnNG
	};

	console.log('constructed song');

	if (!serverQueue) {
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);
		console.log(queueConstruct);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(message.guild, queueConstruct.songs[0]);
			console.log(queueConstruct.songs)
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(message.guild.id);
			return message.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return message.channel.send(`✅ **${song.title}** has been added to the queue!`);
	}
	return undefined;
}


async function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	if (song.onNG)
	{
		const dispatcher = serverQueue.connection.playStream(song.url, {volume: 0.2})
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason + " is the reason the thing ended");
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error("SHITS BUSTED"));
	}
	else
	{
		const dispatcher = serverQueue.connection.playOpusStream(await ytdl(song.url, { filter: 'audioonly'}, { type: 'opus'}), {volume: 0.2})
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error("SHITS BUSTED"));
	// dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	dispatcher.setVolumeLogarithmic(0.30);

	}
	
	
	serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
}

var htmlEntities = {
    nbsp: ' ',
    cent: '¢',
    pound: '£',
    yen: '¥',
    euro: '€',
    copy: '©',
    reg: '®',
    lt: '<',
    gt: '>',
    quot: '"',
    amp: '&',
    apos: '\''
};


function unescapeHTML(str) {
    return str.replace(/\&([^;]+);/g, function (entity, entityCode) {
        var match;

        if (entityCode in htmlEntities) {
            return htmlEntities[entityCode];
            /*eslint no-cond-assign: 0*/
        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
            return String.fromCharCode(parseInt(match[1], 16));
            /*eslint no-cond-assign: 0*/
        } else if (match = entityCode.match(/^#(\d+)$/)) {
            return String.fromCharCode(~~match[1]);
        } else {
            return entity;
        }
    });
};

function getImages(personFolder)
{
	fulpPics.push([]);
	files = fs.readdirSync(__dirname + '/pics/' + personFolder);
	files.forEach(function(f)
	{
		fulpPics[fulpPics.length - 1].push(f);
	});
	console.log(fs.readdirSync(__dirname + '/pics/' + personFolder));
}


function randomFromArray(arr)
{
	let thePic = Math.floor(Math.random() * fulpPics[arr].length);
	console.log(fulpPics[arr][thePic]);
	return fulpPics[arr][thePic];
}

process.on('unhandledRejection', error => console.error(`Uncaught Promise Rejection:\n${error.stack}`));

// login to Discord with your app's token
client.login(token);