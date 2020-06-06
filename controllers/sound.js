const mongo = require('../config/mongo');

const request = require('request').defaults({encoding: null});

addNewSound = (msg) => {
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

    // We can add the sound to the DB
    request.get(msg.attachments.first().url, function (err, res, body) {

        mongo.addSound({
            name: soundName,
            binary: body,
            author: msg.author.id,
            createdAt: new Date(),
        });
    });

    console.log('file uploaded')

};

module.exports = {
    addNewSound: addNewSound,
};
