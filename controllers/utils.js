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


module.exports = {
    deleteMessage: deleteMessage,
};
