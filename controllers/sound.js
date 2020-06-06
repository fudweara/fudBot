const Mongo = require('../config/mongo');
const Utils = require('../utils/utils');
const MusicMetadata = require('music-metadata-browser');
const {MessageEmbed} = require('discord.js');

const request = require('request').defaults({encoding: null});

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

    // Join channel
    const connection = await message.member.voice.channel.join();

    // Get sound in DB
    await Mongo.getSound(soundName, function (audioFile) {

        if (!audioFile) {
            message.reply('Aucune musique trouvé qui avec ce nom.');
            return;
        }

        // Play sound
        connection.play(Utils.bufferToStream(audioFile.binary.buffer));

        // Disconnect 2s after the end of the sound
        setTimeout(() => connection.disconnect(), audioFile.duration + 2000)

    });


};


module.exports = {
    add: addNewSound,
    play: playSound,
};
