const {Readable} = require('stream');

function bufferToStream(binary) {

    return new Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });

}


module.exports = {
    bufferToStream: bufferToStream,
};
