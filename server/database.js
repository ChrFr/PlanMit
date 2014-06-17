module.exports = function(){
    var express = require('express');
    var app = express();
    
    app.get('/projects', function(req, res){
        res.send('platzhalter liste projekte');
    });
    
    app.get('/projects/:pid', function(req, res){
        res.send('Projekt ' + req.params.pid);
    });
    
    app.get('/projects/:pid/segments/', function(req, res){
        res.send('platzhalter liste segmente');
    });
    
    app.get('/projects/:pid/segments/:sid', function(req, res){
        res.send('Projekt ' + req.params.pid + ' Segment ' + req.params.sid);
    });

    return app;
}();