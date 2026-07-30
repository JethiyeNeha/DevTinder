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
    res.status(401).send("Error creating user", error);
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
