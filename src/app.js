const express = require('express');
const app = express();
const port = 7777;

app.use("/test",(req, res) => {
res.send("Hello, World!");
});

app.use("/hello",(req, res) => {
res.send("Hello hello hi!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


