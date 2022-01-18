const { Client, Intents } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const messageFilter = (msg) => {
	if (msg.author.id == client.user.id) return false;

	return msg.content.toLowerCase().includes("piw");
}

let collectors = [];

const reloadCollectors = () => {
	console.log("Reloadign collectors ...");
	client.guilds.fetch()
		.then((partialguilds) =>
			Promise.all(partialguilds.map((partialguild) => {
				return partialguild.fetch();
			}))
		)
		.then((guilds) =>
			Promise.all(guilds.map((guild) => {
				return guild.channels.fetch();
			}))
		)
		.then((listofchannels) => {
			// channels is list of maps, figure that out
			return listofchannels.flatMap((channels) => {
				return Array.from(channels)
					.filter(([_, channel]) => channel.isText())
					.map(([_, channel]) => channel);
			});
		})
		.then((channels) => {
			// Close all opened collectors
			collectors.forEach((collector) => { collector.stop(); });
			collectors = [];
			channels.forEach((channel) => {
				if(channel.name.includes("dlabota")){
					console.log(channel);
					channel.send("piwo");
				}
				const filter = messageFilter;
				const collector = channel.createMessageCollector({ filter});
				collector.on('collect', (msg) => {
					channel.send("Czy ktoś powiedział piwo ?");
					msg.react("🍻");
				});

				collectors.push(collector);
			});

			console.log(`Loaded ${collectors.length} collectors !`);
		});
}

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	setImmediate(reloadCollectors);
	setInterval(reloadCollectors, 1000 * 60 * 20);
});

// Login to Discord with your client's token
if(!process.env.TOKEN){
	console.log("No token loaded. Check your .env file config");
	return;
}

client.login(process.env.TOKEN);
