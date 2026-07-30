const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://nehalachuria:vy0rIgehPNrDoAHT@learningnode.rdln0rv.mongodb.net/devTinder",
  );
};


module.exports = connectDB;
