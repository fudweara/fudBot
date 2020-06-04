const MongoClient = require('mongodb').MongoClient;


const url = process.env.MONGO_DB_URL; // <dbname>?retryWrites=true&w=majority

// Database Name
const dbName = process.env.MONGO_DB_DB_NAME;


let db;

const mongoInit = () => {
    // Use connect method to connect to the server
    MongoClient.connect(url, {useUnifiedTopology: true}, function (err, client) {

        console.log("Connected successfully to server");

        db = client.db(dbName);
        client.close();
    });
};

module.exports =  mongoInit;
