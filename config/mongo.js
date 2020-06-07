const MongoClient = require('mongodb').MongoClient;

const url = process.env.MONGO_DB_URL; // <dbname>?retryWrites=true&w=majority

// Database Name
const dbName = process.env.MONGO_DB_DB_NAME;


let db;

const mongoInit = () => {
    // Use connect method to connect to the server
    MongoClient.connect(url, {useUnifiedTopology: true}, function (err, client) {

        db = client.db(dbName);
        //client.close().then(r => console.log("Client closed"));

    });
};

const addSound = (sound) => {

    db.collection('sounds').insertOne(sound)
        .then(function (result) {
            //console.log('added');
        })
};

const getSoundWithName = (name, callback) => {

    db.collection('sounds').find({'name': name}).toArray(function (err, docs) {

        if (err) console.error(err);
        callback(docs[0]);
    });

};


module.exports = {
    init: mongoInit,
    addSound: addSound,
    getSound: getSoundWithName,
};
