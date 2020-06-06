/**
 * Module dependencies.
 */
require('dotenv').config();

const dotenv = require('dotenv');
dotenv.config({path: '.env'});

const Discord = require('discord.js');
const mongo = require('./config/mongo');

//Import files for functionality
const Sound = require('./controllers/sound');
const Utils = require('./controllers/utils');

const client = new Discord.Client();
const prefixCall = '!';

mongo.init();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', async msg => {


    switch (msg.content.split(' ')[0]) {

        case prefixCall + 'help':
            Utils.help(msg);
            break;

        case prefixCall + 'ping':
            msg.reply('pong');
            break;

        case prefixCall + 'add':
            Sound.add(msg);
            break;

        case prefixCall + 'play':
            await Sound.play(msg);
            break;

        case prefixCall + 'delete' :
            Utils.deleteMessage(msg);
            break;
    }

});


client.login(process.env.DISCORD_TOKEN).then(r => console.log('Token is good, connected!'));

