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

        //return all project specific segments and projects base attributes
        get: function(req, res){ 
            var _pg = pgQuery;
            pgQuery('SELECT * FROM projects WHERE id=' + req.params.pid, 
            function(result){
                //merge the project object with the borders from db                
                if (result.length === 0)
                    return res.send(404);
                return res.send(result);
            });
        },

        post: function(req, res){
            var post = "UPDATE projects SET default_template = '"
                        + JSON.stringify(req.body.template) + 
                        "' WHERE id=" 
                        + req.params.pid;
            pgQuery(post,
                function(result){
                    return res.send(result);
                });
        },

        delete: function(req, res){}
    };

    var segments = {        
        list: function(req, res){
            /*
            if(!req.session.user)
                return res.send(401);*/
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
                        '(SELECT id AS type, category, ' +
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
                        '(SELECT id AS type, category, ' +
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
            //if projectid is given, get the project specific segment
            if (req.params.pid){
                pgQuery('SELECT * FROM segments LEFT JOIN ' + 
                        '(SELECT id AS type, category, rules ' +
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
            else {
                pgQuery('SELECT * FROM segments LEFT JOIN ' + 
                        '(SELECT id AS type, category, rules ' +
                        'FROM segment_types) AS rule ON segments.type = rule.type' +
                        ' WHERE id=' 
                        + req.params.sid, 
                function(result){
                    //merge the project object with the borders from db                
                    if (result.length === 0)
                        return res.send(404);                    
                    return res.send(result[0]);
                });   
            }
        }
        
    };
    
    var images = {
        list: function(req, res){
            if(!req.session.user)
                return res.send(401);
            
            pgQuery('SELECT * from images', 
            function(result){
                if (result.length === 0)
                    return res.send(404);
                return res.send(result[0]);
            });
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
    
    var session = {
        
        //csrf login taken from http://danialk.github.io/blog/2013/07/28/advanced-security-in-backbone-application/
        getToken: function(req, res){
            return res.send({csrf: req.csrfToken()});
        },
        
        getLogin: function(req, res){
            if(req.session.user){
              res.send(200, {
                  auth : true,
                  user : req.session.user
                });
            }else{
                res.send(401, {
                    auth : false,
                    csrf : req.session._csrf
                });
            }
        },

        login: function(req, res){
            var name = req.body.name;
                console.log(name);
            var password = req.body.password;
            pgQuery("SELECT * from users WHERE name='" + name + "'", 
            function(result){
                for (var i=0; i < result.length; i++) {
                    if(result[i].password === password){    
                        res.statusCode = 200;
                        req.session.user = {name: name};
                        return res.json({
                            auth : true,
                            user : req.session.user
                        });
                    }
                }; 
                req.session.user = null;
                res.statusCode = 401;
                return res.end('invalid user or password');             
            });
        },

        logout: function(req, res){ 
            //Sending new csrf to client when user logged out
            //for next user to sign in without refreshing the page
            req.session.user = null;
            req.session._csrf = uid(24);

            res.send(200, {
                csrf : req.session._csrf
            });
        },
        
        register: function(req, res){ 
        },
        
        unsuscribe: function(req, res){ 
        },
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
        },
        '/session': {
            get: session.getToken,
            delete: session.delete, 
            '/:login': {
                get: session.getLogin,  
                post: session.login,      
            },
            '/:register': {        
                post: session.register,
                delete: session.unsuscribe
            },       
        }
    });
    
    return app;
}();