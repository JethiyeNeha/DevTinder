const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();
const port = 7777;

app.use(express.json());

app.post("/signup", async (req, res) => {
  const newUser = new User(req.body);
  try {
    await newUser.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error creating user", error);
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
    const isValidUpdates = Object.keys(data).every((update) => ALLOWED_UPDATES.includes(update));
    if (!isValidUpdates) {
      throw new Error("Invalid updates");
    }
    if(data.skills.length > 5){
      throw new Error("Skills cannot be more than 5");
    }
    const user = await User.findByIdAndUpdate({_id:id}, data, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log("Updated user:", user);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send( "Error updating user: " + error);
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
