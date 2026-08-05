
const validator = require("validator");

const validateSignupData = (req) => {


  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName ) {
    throw new Error("First name and last name are required");
  }
  if(!email || !validator.isEmail(email)) {
    throw new Error("Invalid email");
  }
  if(!password || !validator.isStrongPassword(password)) {
    throw new Error("Invalid password");
  }
}

module.exports = {
  validateSignupData,
};