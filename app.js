/**
 * Module dependencies.
 */
require('dotenv').config();

const dotenv = require('dotenv');
dotenv.config({path: '.env'});

const Discord = require('discord.js');
const mongo = require('./config/mongo');
const request = require('request').defaults({encoding: null});

//Import files for functionality
const Sound = require('./controllers/Sound');
const Utils = require('./controllers/utils');

const client = new Discord.Client();
const prefixCall = '!';

mongo.init();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {


    // when file is up
    if (msg.attachments.size) {
        console.log(msg.attachments[0]);

        request.get('', function (err, res, body) {
            //process exif here

        });

        Sound.addNewSound(msg);
        console.log('file uploaded')
    }

    switch (msg.content.split(' ')[0]) {

        case prefixCall + 'ping':
            msg.reply('pong');
            break;

        case prefixCall + 'delete' :
            Utils.deleteMessage(msg);
            break;
    }

    if(msg.content[0] ===prefixCall){
        msg.delete();
    }
});


client.login(process.env.DISCORD_TOKEN).then(r => console.log('Token is good, connected!'));
