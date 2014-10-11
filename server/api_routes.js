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
    
    var config = require('./config').dbconfig;

    //var client = new pg.Client(conString);
    //client.connect();
    
    function pgQuery(queryString, parameters, callback){
        pg.connect(config, function(err, client, done) {
            if(err) {
                return callback([]);
            }
            client.query(queryString, parameters, function(err, result) {
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
          pgQuery('SELECT * FROM projects', [], function(result){
              return res.send(result);
          });
        },

        //return all project specific segments and projects base attributes
        get: function(req, res){ 
            var _pg = pgQuery;
            pgQuery('SELECT * FROM projects WHERE id=$1', [req.params.pid], 
            function(result){
                //merge the project object with the borders from db                
                if (result.length === 0)
                    return res.send(404);
                return res.send(result[0]);
            });
        },

        post: function(req, res){
            var post = "UPDATE projects SET default_template=$1 WHERE id=$2";
            pgQuery(post, [JSON.stringify(req.body.template), req.params.pid],
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
                pgQuery('SELECT ignore_segments FROM projects WHERE id=$1', [req.params.pid], 
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
                        'rule.type WHERE available = true ' + ignorestr, [],
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
                        'rule.type', [],
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
                        ' WHERE available = true AND id=$1', [req.params.sid], 
                function(result){ 
                    if (result.length === 0)
                        return res.send(404);
                    var segment = result[0];
                    _pg('SELECT ignore_segments FROM projects WHERE id=$1', [req.params.pid], 
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
                        ' WHERE id=$1', [req.params.sid],
                function(result){
                    console.log(result)
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
            pgQuery('SELECT id, name, actual_size from images', [],
            function(result){
                if (result.length === 0)
                    return res.send(404);
                return res.send(result);
            });
        },

        get: function(req, res){
            pgQuery('SELECT id, name, actual_size from images WHERE id=$1', [req.params.iid],
            function(result){
                if (result.length === 0)
                    return res.send(404);
                return res.send(result[0]);
            });
        },

        getSVG: function(req, res){   
            pgQuery('SELECT img_svg from images WHERE id=$1', [req.params.iid],
            function(result){
                console.log(result);
                if (result.length === 0)
                    return res.send(404);
                return res.status(200).send(result[0].img_svg);
            });
        },

        getPNG: function(req, res){   
            pgQuery('SELECT img_png from images WHERE id=$1', [req.params.iid],
            function(result){
                if (result.length === 0)
                    return res.send(404);
                return res.send(result[0].img_png);
            });
        },
        
        getThumb: function(req, res){   
            pgQuery('SELECT img_thumb from images WHERE id=$1', [req.params.iid],
            function(result){
                if (result.length === 0)
                    return res.send(404);
                return res.send(result[0].img_thumb);
            });
        },
    };
    
    var session = {
        
        getToken: function(req, res){
            return res.send({csrf: req.csrfToken()});
        },
        
        getStatus: function(req, res){
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
            var password = req.body.password;
            pgQuery("SELECT * from users WHERE name=$1", [name],
            function(result){
                for (var i=0; i < result.length; i++) {
                    if(result[i].password === password){    
                        res.statusCode = 200;
                        req.session.user = {name: result[i].name,
                                            email: result[i].email,
                                            superuser: result[i].superuser};
                        return res.json({
                            auth : true,
                            user : req.session.user
                        });
                    }
                }; 
                req.session.user = null;
                res.statusCode = 400;
                return res.end('invalid user or password');             
            });
        },

        logout: function(req, res){ 
            req.session.user = null;
            res.send(200);
        },
        
        register: function(req, res){  
            var name = req.body.name;
            var email = req.body.email;
            var password = req.body.password;
            pgQuery("INSERT INTO users (name, email, password) VALUES ($1, $2, $3);", 
                [name, email, password],
                function(result){
                    return res.send(200);             
                });
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
                '/svg':{
                    get: images.getSVG
                },
                '/png':{
                    get: images.getPNG
                },
                '/thumb':{
                    get: images.getThumb
                },                
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
            delete: session.logout, 
            '/login': {
                get: session.getStatus,  
                post: session.login,      
            },
            '/register': {        
                post: session.register,
                delete: session.unsuscribe
            },       
        }
    });
    
    return app;
}();