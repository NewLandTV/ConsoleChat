// Require
const { Client, Collection, GatewayIntentBits, Message } = require("discord.js");
const { token, channelId } = require("./config.json");
const fs = require("fs");
const { SendMsgToClients } = require("./Server.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.data.name, command);
}

client.once("ready", () => {
    client.user.setActivity("Sender Bot Discord", { type: "PLAYING" });

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async message => {
    const msg = `${message.member.displayName} : ${message.content}`;

    SendMsgToClients(msg);

    console.log(msg);
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        // Slash command execute
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true
        });
    }
});

client.login(token);

module.exports = {
    SendMessage(msg) {
        client.channels.cache.get(channelId).send(msg);
    }
};

require("./Server.js").KeepAlive();