'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
var activity    = require('./routes/activity');
var index = require('./lib/index')
var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.post('/login', routes.login );
app.post('/logout', routes.logout );

// Custom Hello World Activity Routes
app.post('/save/', activity.save );
app.post('/validate/', activity.validate );
app.post('/publish/', activity.publish );
app.post('/execute/', activity.execute );
app.post('/stop/', activity.stop);
app.get('/query/', index.query);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
