const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    console.log("Cookie:", cookies);
    if (!token) {
      throw new Error("Invalid token");
    }
    const decodedMessage = await jwt.verify(token, "secret");
    const { _id } = decodedMessage;
    console.log("Decoded message:", _id);

    const user = await User.findById(_id);
    console.log("User:", user);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: " + error.message);
  }
};

module.exports = userAuth;