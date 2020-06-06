const mongo = require('../config/mongo');

const request = require('request').defaults({encoding: null});

addNewSound = (msg) => {

    if (msg.attachments.size) {

        if (msg.attachments.first().size > 2000000) {
            msg.reply('Fichier audio trop grand. La taille maximum est 2mo');
            return;
        }

        request.get(msg.attachments.first().url, function (err, res, body) {

            mongo.addSound({
                binary: body,
                author: msg.author.id,
                createdAt: new Date(),
            });
        });

        console.log('file uploaded')
    } else
        msg.reply('Il manque le son')


};

module.exports = {
    addNewSound: addNewSound,
};
