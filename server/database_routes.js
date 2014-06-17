module.exports = function(){
    var express = require('express');
    var app = module.exports = express();
    
    //Mapping taken from https://github.com/visionmedia/express/blob/master/examples/route-map/index.js

    app.map = function(a, route){
      route = route || '';
      for (var key in a) {
        switch (typeof a[key]) {
          // { '/path': { ... }}
          case 'object':
            app.map(a[key], route + key);
            break;
          // get: function(){ ... }
          case 'function':
            app[key](route, a[key]);
            break;
        }
      }
    };
    
    var pg = require("pg");
    
    var login = require('./dbconfig')

    var conString = "pg://" + login.user + ":" + login.password + "@" + login.host + ":" + login.port + "/" + login.database;

    //var client = new pg.Client(conString);
    //client.connect();
    
    function pqQuery(queryString, callback){
        pg.connect(conString, function(err, client, done) {
            if(err) {
                return console.error('error running query', err);
            }
            client.query(queryString, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }
                callback(result.rows);
            });
        });
    }

    var projects = {
      list: function(req, res){
        pqQuery('SELECT * from projects', function(result){
            res.send(result);
        });
      },

      get: function(req, res){
        pqQuery('SELECT * from projects WHERE id=' + req.params.pid, function(result){
            res.send(result);
        });
      },

      delete: function(req, res){        
      }
    };

    var segments = {
      list: function(req, res){
        res.send('platzhalter liste segmente');
      },

      get: function(req, res){
        res.send('Projekt ' + req.params.pid + ' Segment ' + req.params.sid);
      },

      delete: function(req, res){        
      }
    };

    app.map({
        '/projects': {
            get: projects.list,
            delete: projects.delete,
            '/:pid': {
                get: projects.get,
                '/segments': {
                    get: segments.list,
                    '/:sid': {
                        get: segments.get,
                        delete: segments.delete
                    }
                }
            }
        }
    });
    /*
    var app = express();
    
    var pg = require("pg");
    
    var login = require('./dbconfig')

    var conString = "pg://" + login.user + ":" + login.password + "@" + login.host + ":" + login.port + "/" + login.database;

    //var client = new pg.Client(conString);
    //client.connect();
    
    function pqQuery(queryString){
        pg.connect(conString, function(err, client, done) {
            if(err) {
                return console.error('error running query', err);
            }
            client.query(queryString, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return console.error('error running query', err);
                }
                return result.rows;
              //output: 1
            });
        });
    }
    
    var projects = {
        log
    }
    
    app.get('/projects', function(req, res){        
        var result = pqQuery(s, err);
        if (!result)
            res.send('404');
        else 
            res.send(result);
    });
    
    app.get('/projects/:pid', function(req, res){
        res.send('Projekt ' + req.params.pid);
    });
    
    app.get('/projects/:pid/segments/', function(req, res){
        res.send('platzhalter liste segmente');
    });
    
    app.get('/projects/:pid/segments/:sid', function(req, res){
        res.send('Projekt ' + req.params.pid + ' Segment ' + req.params.sid);
    });*/

    return app;
}();