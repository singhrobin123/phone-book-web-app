const express = require("express");
const bodyParser = require("body-parser");
const router = require('./app/routes/index.route')
const path = require('path');

const app = express();

//For //Production
//app.use(express.static(path.join(__dirname, 'build')));

//For Development
app.use(express.static(path.join(__dirname, 'frontend/client/dist')));


// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb', extended: true}));


// simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to phone book web application." });
// });

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'frontend/client/dist', 'index.html'));
});
app.use("/api",router);

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
