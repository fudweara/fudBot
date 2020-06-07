const Mongo = require('../config/mongo');
const Utils = require('../utils/utils');
const MusicMetadata = require('music-metadata-browser');
const {MessageEmbed} = require('discord.js');

const ytdl = require('ytdl-core');
const {validateUrl} = require('youtube-validate');

const request = require('request').defaults({encoding: null});

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
        msg.reply('La commande c\'est !add nomduson et toi tu as oublié le nom du son');
        return;
    }

    if (!msg.attachments.size) {
        msg.reply('Il manque le son');
        return;
    }

    if (msg.attachments.first().size > 2000000) {
        msg.reply('Fichier audio trop grand. La taille maximum est 2mo');
        return;
    }

    await Mongo.getSound(soundName, (audioFile) => {

        if (audioFile) {
            msg.reply('Une musique a déjà ce nom.');
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

        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Son ajouté!')
            // Set the color of the embed
            .setColor(0xff0000)
            // Set the main content of the embed
            .setDescription('Si tu veux le lancer : !play ' + soundName);
        // Send the embed to the same channel as the message
        msg.channel.send(embed);

    });


};

const playSound = async (message) => {

    const soundName = message.content.split(' ')[1];

    if (!soundName) {
        message.reply('C\'est quoi le nom de la musique ?');
        return;
    }

    // Checks
    if (message.member.voice.channel === null) {
        message.reply('Tu n\'est pas dans un channel vocal sur ce serveur.');
        return;
    }


    // Get sound in DB
    await Mongo.getSound(soundName, function (audioFile) {

        if (!audioFile) {
            message.reply('Aucune musique trouvé qui avec ce nom.');
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
        message.reply('Tu n\'est pas dans un channel vocal sur ce serveur.');
        return;
    }

    if (!message.content.split(' ')[1]) {
        message.reply('Il manque le lien Youtube.');
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
            message.reply(youtubeAddress + ' ajouté à la file!')

        }).catch((err) => {
        message.reply('Le lien youtube n\'est pas valide');
    });

};


const displayWaitingListPlay = (message) => {

    let messageBuilt = [];

    if (!listMusic.length) {
        message.reply('Il n\'y a pas de musique en queue');
        return;
    }

    listMusic.forEach((music, index) => {
        let row = {
            name: (index + 1) + '.' + (currentMusicPlayed === index ? ' (EN TRAIN D\'ETRE ECOUTEE)' : ''),
            value: music,
        };
        messageBuilt.push(row);
    });

    const embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('File d\'attente:')
        // Set the color of the embed
        .setColor(0xff0000)
        .addFields(messageBuilt);
    // Send the embed to the same channel as the message
    message.channel.send(embed);

};

const nextSound = (message) => {
    if (!currentConnection) {
        message.reply('Il n\' y a pas de musique actuellement joué');
        return;
    }

    nextMusic();
};

const previousSound = (message) => {
    if (!currentConnection) {
        message.reply('Il n\' y a pas de musique actuellement joué');
        return;
    }

    if (currentMusicPlayed === 0) {
        message.reply('Il n\'y a pas de musique avant');
        return;
    }
    currentMusicPlayed--;
    playCurrentMusic();

};

const stopPlaylist = (message) => {
    if (!currentConnection) {
        message.reply('Il n\' y a pas de musique actuellement joué');
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
