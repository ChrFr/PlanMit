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
    
    function pgQuery(queryString, callback){
        pg.connect(conString, function(err, client, done) {
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
          pgQuery('SELECT * FROM projects', function(result){
              return res.send(result);
          });
        },

        get: function(req, res){ 
            var _pg = pgQuery;
            pgQuery('SELECT * FROM projects WHERE id=' + req.params.pid, 
            function(result){
                //merge the project object with the borders from db                
                if (result.length === 0)
                    return res.send(404);
                var resProj = result[0];
                var left = resProj.left_border;
                var right = resProj.right_border;
                var order = 'ORDER BY id ';
                if (left < right)
                    order += 'ASC';
                else
                    order += 'DESC';
                _pg('SELECT * FROM segments WHERE id in(' + left + 
                        ',' + right + ') ' + order,
                function(result){
                    if (result.length === 0)
                        return res.send(resProj);
                    if (result.length === 1)                    
                        result.push(result[0]);
                    if (left)
                        resProj.left_border = result[0]
                    if (right)
                        resProj.right_border = result[1]
                    return res.send(resProj);
                })
                return;
            });
        },

        post: function(req, res){
            var post = "UPDATE projects SET default_template = '"
                        + JSON.stringify(req.body.template) + 
                        "' WHERE id=" 
                        + req.params.pid;
            console.log(post);
            console.log(req.body.template);
            pgQuery(post,
                function(result){
                    return res.send(result);
                });
        },

        delete: function(req, res){}
    };

    var segments = {        
        list: function(req, res){  
            var _pg = pgQuery;
            //if projectid is given, get the project specific segments
            if (req.params.pid){
                pgQuery('SELECT ignore_segments FROM projects WHERE id=' 
                        + req.params.pid, 
                function(result){
                    var ignored = [];
                    var ignorestr = '';
                    if (result.length > 0 && result[0].ignore_segments){
                        ignored = result[0].ignore_segments;
                        ignorestr += 'AND id NOT IN (';
                        for (var i = 0; i < ignored.length; i++){
                            ignorestr += ignored[i];
                            if (i < ignored.length - 1)
                                ignorestr += ',';
                            else
                                ignorestr += ')';  
                        }
                    }
                    //get the segments with their types and the rules according to
                    //their type
                    //available determines, if the segment is available as a resource
                    //for editing
                    _pg('SELECT * FROM segments LEFT JOIN ' + 
                        '(SELECT id AS type, category, min_width, max_width, ' +
                        'rules FROM segment_types) AS rule ON segments.type = ' +
                        'rule.type WHERE available = true ' + ignorestr, 
                    function(result){
                        if (result.length === 0)
                            return res.send(404);
                        return res.send(result);
                    });
                    return;
                });
            }
            else {
                pgQuery('SELECT * FROM segments LEFT JOIN ' + 
                        '(SELECT id AS type, category, min_width, max_width, ' +
                        'rules FROM segment_types) AS rule ON segments.type = ' +
                        'rule.type', 
                function(result){
                    //merge the project object with the borders from db                
                    if (result.length === 0)
                        return res.send(404);                    
                    return res.send(result);
                });                       
            }
                
        },

        get: function(req, res){
            var _pg = pgQuery;
            pgQuery('SELECT * FROM segments LEFT JOIN ' + 
                    '(SELECT id AS type, min_width, max_width, rules ' +
                    'FROM segment_types) AS rule ON segments.type = rule.type' +
                    ' WHERE available = true AND id=' 
                    + req.params.sid, 
            function(result){ 
                if (result.length === 0)
                    return res.send(404);
                var segment = result[0];
                _pg('SELECT ignore_segments FROM projects WHERE id=' 
                    + req.params.pid,
                function(result){     
                    if (result.length === 0)
                        return res.send(segment);
                    var ignored = result[0].ignore_segments || [];
                    //look if found segment is ignored by project
                    for (var i = 0; i < ignored.length; i++){
                        if (segment.id === ignored[i])                       
                            return res.send(404);
                    }
                    return res.send(segment);
                })
                return;
            });
        }
        
    };
    
    var images = {
      //you shouldn't access all images in db at once 
      //(due to performance issues)
      list: function(req, res){
        return res.send(403);
      },

      get: function(req, res){
        pgQuery('SELECT * from images WHERE id=' + req.params.iid, 
        function(result){
            if (result.length === 0)
                return res.send(404);
            return res.send(result[0]);
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
                post: projects.post,
                //only project specific segments
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
        },
        //all segments in database
        '/segments': {
            get: segments.list,
            '/:sid': {
                get: segments.get,
                delete: segments.delete
            }
        }
    });
    
    return app;
}();