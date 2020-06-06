const {MessageEmbed, EmbedFieldData} = require('discord.js');
const commandList = require('../commandList');
const deleteMessage = (msg) => {

    let numberOfMessages = msg.content.split(' ')[1] ? msg.content.split(' ')[1] : 1;
    let isFirstMessage = true; // beurk

    msg.channel.messages.fetch().then(messages => {
        messages.map((message) => {

            if (isFirstMessage) {
                isFirstMessage = !isFirstMessage;
                return;
            }

            if (numberOfMessages > 0) {
                message.delete().then();
                numberOfMessages--;
            }
        });
    });

};


const help = async (msg) => {

    //Prepare message display
    let lines = [];
    await commandList.commandList.map((command, index) => {

        let value = command.parameters ? command.parameters.map((param) => ' ' + param.name + ': ' + param.type) : 'Pas de paramètres';
        value = 'Paramètres => ' + value + '\n' + command.description;
        let row = {
            name: commandList.prefix + command.name,
            value: value,
        };
        lines.push(row);
    });


    const embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('Liste des commandes:')
        // Set the color of the embed
        .setColor(0xff0000)
        .addFields(lines);
    // Send the embed to the same channel as the message
    msg.channel.send(embed);

};

module.exports = {
    deleteMessage: deleteMessage,
    help: help,
};
