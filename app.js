/**
 * Module dependencies.
 */
require('dotenv').config();

const dotenv = require('dotenv');
dotenv.config({path: '.env'});

const Discord = require('discord.js');
const mongo = require('./config/mongo');

//Internationalization
const i18n = require("i18n");

//Import files for functionality
const Sound = require('./controllers/sound');
const Utils = require('./controllers/utils');

const client = new Discord.Client();
const prefixCall = process.env.PREFIX_CALL ? process.env.PREFIX_CALL : '!';
const roleNameAdmin = process.env.NAME_ADMIN_ROLE;

//Init
mongo.init();
console.log(__dirname);
i18n.configure({
    locales: ['en', 'fr'],
    defaultLocale: process.env.LANGUAGE ? process.env.LANGUAGE : 'en',
    directory: __dirname + '/locales'
});


client.on('ready', () => {
    console.log(i18n.__('Logged in as %s', client.user.tag));

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

        case prefixCall + 'playyt':
            await Sound.playYoutube(msg);
            break;

        case prefixCall + 'delete' :
            havePermission(msg, (msg) => {
                Utils.deleteMessage(msg);
            });
            break;
        case prefixCall + 'list':
            Sound.waitingList(msg);
            break;
        case prefixCall + 'next':
            Sound.next(msg);
            break;
        case prefixCall + 'previous':
            Sound.previous(msg);
            break;
        case prefixCall + 'stop':
            Sound.stop(msg);
            break;
    }

});

const havePermission = (message, callback) => {

    if (!message.member.roles.cache.map(role => role.name).includes(roleNameAdmin))
        message.reply(i18n.__('Pas assez de permissions, tu dois avoir le rôle %s' + roleNameAdmin));
    else
        callback(message);
};


client.login(process.env.DISCORD_TOKEN).then(r => console.log(i18n.__('Token is good, connected!')));

