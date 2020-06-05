const mongo = require('../config/mongo');

addNewSound = (msg) =>{

    mongo.addSound({
        item: "canvas",
        qty: 100,
        tags: ["cotton"],
        size: {h: 28, w: 35.5, uom: "cm"}
    });

};

module.exports = {
    addNewSound: addNewSound,
};
