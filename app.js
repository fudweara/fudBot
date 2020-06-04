/**
 * Module dependencies.
 */
require('dotenv').config();

const dotenv = require('dotenv');
dotenv.config({path: '.env'});

const Discord = require('discord.js');
const mongoInit = require('./config/mongo');

const client = new Discord.Client();
const prefixCall = '!';

mongoInit();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {

    switch(msg.content){
        case prefixCall + 'ping':
            msg.reply('pong');
            break;
        default:
            console.log('menfou');
            break;
    }
});


client.login(process.env.DISCORD_TOKEN).then(r => console.log('Token is good, connected!'));
