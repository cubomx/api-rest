// global
global.appRoot = __dirname;

const express = require("express");
// module of routes
const router = require("./routes");

const dotenv = require('dotenv');
const { response } = require("express");
dotenv.config();

const port = process.env.PORT || 2000;

var app = express( );

app.use(express.json( ));
app.use(express.urlencoded({extended : false}));

app.use( router );

app.listen( port );

console.log(`Listening in ${port} port`);