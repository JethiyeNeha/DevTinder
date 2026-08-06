const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignupData } = require("./utils/validation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
const port = 7777;
const userAuth = require("./middlewares/userAuth");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    //Validate the data
    validateSignupData(req);

    //Encrypt the password
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    //Creating a new instance of the User model and saving it to the database
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error creating user: " + error);
  }
});

app.get("/profile", userAuth, async (req, res) => {

  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error fetching profile: " + error);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    // const { targetUserId } = req.body;
    const user = req.user;

    // // Check if the target user exists
    // const targetUser = await User.findById(targetUserId);
    // if (!targetUser) {
    //   return res.status(404).send("Target user not found");
    // }

    // Add the connection request to the target user's connectionRequests array
    // targetUser.connectionRequests.push(user._id);
    // await targetUser.save();

    res.send(user.firstName + " sent the request successfully");
  } catch (error) {
    res.status(400).send("Error sending connection request: " + error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    //Create JWT
    const token = await user.getJWT();

    //Add token to the cookie and send response
    console.log("Token:", token);

    res.cookie("token", token, {expires: new Date(Date.now() + 3600000), httpOnly: true });
    res.send("Login successful");
  } catch (error) {
    res.status(400).send("Error logging in: " + error);
  }
});

//Get user by email
app.get("/user", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.find({ email: email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send("Error fetching user", error);
  }
});

//FEED API - GET /feed - get all the users from the database

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(400).send("Error fetching users", error);
  }
});

//delete user by id from the database

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  } catch (error) {
    res.status(400).send("Error deleting user", error);
  }
});

//update data of user

app.patch("/user/:userId", async (req, res) => {
  const id = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = ["lastName", "age", "gender", "skills", "about"];
    const isValidUpdates = Object.keys(data).every((update) =>
      ALLOWED_UPDATES.includes(update),
    );
    if (!isValidUpdates) {
      throw new Error("Invalid updates");
    }
    if (data.skills.length > 5) {
      throw new Error("Skills cannot be more than 5");
    }
    const user = await User.findByIdAndUpdate({ _id: id }, data, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log("Updated user:", user);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send("Error updating user: " + error);
  }
});

connectDB()
  .then(() => {
    console.log("Connected to database");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });
