
var http    = require("http");
var express = require("express");
var whiskers = require('whiskers');
var winston = require('winston');

var port = process.env.PORT || 8080;

var app = express();

winston.add(winston.transports.File, { filename: 'client.log', json: false });
app.get('/log', function(req, res){
    winston.log('info', req.query.user+"; "+req.query.message);
    res.end();
});
app.use("/static", express.static(__dirname+'/static'));
app.use("/node_modules", express.static(__dirname+'/../node_modules'));

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


function renderWithTemplate(template, res) {
    var options = {
        year: new Date().getFullYear(),
        partials: {
            body: template
        }
    };
    res.render('layout.html', options);
}
