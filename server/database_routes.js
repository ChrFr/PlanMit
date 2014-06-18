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
            console.log(queryString);
            if(err) {
                return callback([]);
            }
            client.query(queryString, function(err, result) {
                //call `done()` to release the client back to the pool
                done();
                if(err) {
                    return callback([]);
                }
                return callback(result.rows);
            });
        });
    }

    var projects = {
      list: function(req, res){
        pqQuery('SELECT * from projects', function(result){
            return res.send(result);
        });
      },

      get: function(req, res){
        pqQuery('SELECT * from projects WHERE id=' + req.params.pid, 
        function(result){
            if (result.length === 0)
                return res.send(404);
            return res.send(result);
        });
      },

      delete: function(req, res){        
      }
    };

    var segTypeQuery = '(SELECT id AS type_id, ' + 
            'start_width AS default_start_width, ' + 
            'image_id AS default_image_id, ' +
            'rules AS default_rules from segment_types) AS seg_types '
        
    var query = 'SELECT * from segments LEFT JOIN ' + segTypeQuery +
                'ON segments.type_id=seg_types.type_id '
        
    var segments = {
      list: function(req, res){        
        pqQuery(query + 'WHERE segments.project_id=' + req.params.pid, 
        function(result){
            if (result.length === 0)
                return res.send(404);
            return res.send(result);
        });
      },

      get: function(req, res){
        pqQuery(query + 'WHERE segments.project_id=' + 
                req.params.pid + ' AND segments.id=' + req.params.sid, 
        function(result){
            if (result.length === 0)
                return res.send(404);
            return res.send(result);
        });
      },

      delete: function(req, res){        
      }
    };
    
    var images = {
      //you shouldn't access all images in db at once 
      //(due to performance issues)
      list: function(req, res){
        return res.send(403);
      },

      get: function(req, res){
        pqQuery('SELECT * from images WHERE id=' + req.params.iid, 
        function(result){
            if (result.length === 0)
                return res.send(404);
            return res.send(result);
        });
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
        },
        '/images':{
            get: images.list,
            '/:iid': {
                get: images.get,
                delete: images.delete
            }
        }
    });
    
    return app;
}();