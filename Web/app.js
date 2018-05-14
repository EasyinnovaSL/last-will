/**
 * Node.js Login Boilerplate
 * More Info : http://kitchen.braitsch.io/building-a-login-system-in-node-js-and-mongodb/
 * Copyright (c) 2013-2016 Stephen Braitsch
 **/

var http = require('http');
var https = require('https');
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var fs = require('fs');
global.__base = __dirname + '/';

var port = process.env.PORT || 3001;

var app = express();

// App config
app.locals.pretty = true;
app.set('port', port);
app.set('views', __dirname + '/app/server/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('stylus').middleware({src: __dirname + '/app/public'}));
app.use(express.static(__dirname + '/app/public'));
app.use(expressLayouts);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('layout', __dirname + '/app/server/views/layout/index.html');
app.set("layout extractScripts", true);

// set up our express application
app.use(cookieParser());
app.use(bodyParser());

// required for passport
app.use(session({ secret: '4xty43yocfxzqkioptkpxcfgvggykb' }));

// Routes
require('./app/server/routes')(app);

// Listen HTTP
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port') + '.');
});



