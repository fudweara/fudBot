const Mongo = require('../config/mongo');
const Utils = require('../utils/utils');
const MusicMetadata = require('music-metadata-browser');
const {MessageEmbed} = require('discord.js');

const ytdl = require('ytdl-core');
const {validateUrl} = require('youtube-validate');

const request = require('request').defaults({encoding: null});

const i18n = require("i18n");

// List music youtube
let listMusic = [];
let currentMusicPlayed = 0;
let currentConnection = null; //current connection
const resetQueue = () => {
    currentConnection = null;
    listMusic = [];
    currentMusicPlayed = 0;
};
const playCurrentMusic = () => {

    currentConnection.play(ytdl(listMusic[currentMusicPlayed], {filter: 'audioonly'})).on("finish", () => {
        nextMusic();
    })

};

const nextMusic = () => {
    if (listMusic[currentMusicPlayed + 1]) {
        currentMusicPlayed++;
        playCurrentMusic();
    } else {
        currentConnection.disconnect();
        resetQueue();
    }
};

//Exported function
addNewSound = async (msg) => {

    const soundName = msg.content.split(' ')[1];

    // Check if something is missing or sound size is too big
    if (!soundName) {
        msg.reply(i18n.__('Incorrect command add sound'));
        return;
    }

    if (!msg.attachments.size) {
        msg.reply(i18n.__('No sound attached'));
        return;
    }

    if (msg.attachments.first().size > 2000000) {
        msg.reply(i18n.__('Max size add sound', 2));
        return;
    }

    await Mongo.getSound(soundName, (audioFile) => {

        if (audioFile) {
            msg.reply(i18n.__('Music already have the name'));
            return;
        }

        // We can add the sound to the DB
        request.get(msg.attachments.first().url, function (err, res, body) {
            MusicMetadata.parseBuffer(body)
                .then(metadata => {

                    Mongo.addSound({
                        name: soundName,
                        binary: body,
                        author: msg.author.id,
                        duration: metadata.format.duration * 1000,
                        createdAt: new Date(),
                    });

                });
        });

        const prefixCall = process.env.PREFIX_CALL ? process.env.PREFIX_CALL : '!';


        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle(i18n.__('Sound added!'))
            // Set the color of the embed
            .setColor(0xff0000)
            // Set the main content of the embed
            .setDescription(i18n.__('Suggestion launch music',(prefixCall + 'play ' + soundName)));
        // Send the embed to the same channel as the message
        msg.channel.send(embed);

    });


};

const playSound = async (message) => {

    const soundName = message.content.split(' ')[1];

    if (!soundName) {
        message.reply(i18n.__('Song name forgotten'));
        return;
    }

    // Checks
    if (message.member.voice.channel === null) {
        message.reply(i18n.__('Not in vocal channel'));
        return;
    }


    // Get sound in DB
    await Mongo.getSound(soundName, function (audioFile) {

        if (!audioFile) {
            message.reply(i18n.__('No music found'));
            return;
        }

        // Join channel
        message.member.voice.channel.join().then((connection) => {

            // Play sound
            connection.play(Utils.bufferToStream(audioFile.binary.buffer));

            // Disconnect 2s after the end of the sound
            setTimeout(() => {
                connection.disconnect();
                resetQueue();
            }, audioFile.duration + 1000)
        });


    });


};

const playYoutubeSound = async (message) => {

    // Checks
    if (message.member.voice.channel === null) {
        message.reply(i18n.__('Not in vocal channel'));
        return;
    }

    if (!message.content.split(' ')[1]) {

        message.reply(i18n.__('No youtube link'));
        return;
    }

    const youtubeAddress = message.content.split(' ')[1];

    validateUrl(youtubeAddress)
        .then(res => {
            listMusic.push(youtubeAddress);
            // if no current connection => bot is not playing music now
            if (!currentConnection)
                message.member.voice.channel.join().then((connection) => {
                    currentConnection = connection;
                    playCurrentMusic();
                });
            message.reply(i18n.__('Added to list',youtubeAddress))

        }).catch((err) => {
        message.reply(i18n.__('Youtube link not valid'));
    });

};


const displayWaitingListPlay = (message) => {

    let messageBuilt = [];

    if (!listMusic.length) {
        message.reply(i18n.__("No music in queue"));
        return;
    }

    listMusic.forEach((music, index) => {
        let row = {
            name: (index + 1) + '.' + (currentMusicPlayed === index ? i18n.__("Now played") : ''),
            value: music,
        };
        messageBuilt.push(row);
    });

    const embed = new MessageEmbed()
        // Set the title of the field
        .setTitle(i18n.__('Playlist'))
        // Set the color of the embed
        .setColor(0xff0000)
        .addFields(messageBuilt);
    // Send the embed to the same channel as the message
    message.channel.send(embed);

};

const nextSound = (message) => {
    if (!currentConnection) {
        message.reply(i18n.__('No music'));
        return;
    }

    nextMusic();
};

const previousSound = (message) => {
    if (!currentConnection) {
        message.reply(i18n.__('No music'));
        return;
    }

    if (currentMusicPlayed === 0) {
        message.reply(i18n.__('No previous music'));
        return;
    }
    currentMusicPlayed--;
    playCurrentMusic();

};

const stopPlaylist = (message) => {
    if (!currentConnection) {
        message.reply(i18n.__('No music'));
        return;
    }
    currentConnection.disconnect();
    resetQueue();

};


module.exports = {
    add: addNewSound,
    play: playSound,
    playYoutube: playYoutubeSound,
    waitingList: displayWaitingListPlay,
    next: nextSound,
    previous: previousSound,
    stop: stopPlaylist,
};
