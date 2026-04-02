require("dotenv").config();
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

const user = require("./routes/user.js");
const rolemod = require("./routes/admin.js");

app.use("/api/user",user);
app.use("/api/rolemod",rolemod);

app.get('/', (req, res) => {
  res.send('Hello World! siddhant')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
