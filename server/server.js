
var http    = require("http");
var express = require("express");
var socketIo = require("socket.io");
var easyrtc = require("easyrtc");
var whiskers = require('whiskers');

process.title = "node-easyrtc";

var port = process.env.PORT || 8080;

var app = express();
app.use("/static", express.static(__dirname+'/static'));

app.set('views', __dirname+'/views');
app.set('view engine', 'whiskers');
app.engine('.html', whiskers.__express);

app.get('/', function(req, res){
    renderWithTemplate('index.html', res);
});

app.get('/viewing', function(req, res){
	renderWithTemplate('viewing.html', res);
});

app.get('/create', function(req, res){
    renderWithTemplate('create.html', res);
});

app.get('/contact', function(req, res){
    renderWithTemplate('contact.html', res);
});

app.get('/credits', function(req, res){
    renderWithTemplate('credits.html', res);
});


app.get('/lobby', function(req, res){
    res.render('lobby.html', {
        appName: (req.get('host') + req.originalUrl).replace(/\W/g,"_")
    });
});

// Start Express http server
var webServer = http.createServer(app).listen(port);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

var myIceServers = [
  {"url":"stun:stun.l.google.com:19302"},
  {"url":"stun:stun1.l.google.com:19302"},
  {"url":"stun:stun2.l.google.com:19302"},
  {"url":"stun:stun3.l.google.com:19302"}
  // {
  //   "url":"turn:[ADDRESS]:[PORT]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // },
  // {
  //   "url":"turn:[ADDRESS]:[PORT][?transport=tcp]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // }
];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "debug");
easyrtc.setOption("demosEnable", false);

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});


function renderWithTemplate(template, res) {
    var options = {
        year: new Date().getFullYear(),
        partials: {
            body: template
        }
    };
    res.render('layout.html', options);
}
