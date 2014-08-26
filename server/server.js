// DEPENDENCIES
// ============
var express = require("express"),
    http = require("http"),
    port = (process.env.PORT || 8001),
    server = module.exports = express();

// SERVER CONFIGURATION
// ====================
server.configure(function() {

    server.use(express["static"](__dirname + "/../public"));

    server.use(express.errorHandler({

      dumpExceptions: true,

      showStack: true

    }));

    //csrf sec taken from http://danialk.github.io/blog/2013/07/28/advanced-security-in-backbone-application/
    server.set('views', __dirname + '/views');
    server.set('view engine', 'jade');
    server.use(express.favicon());
    server.use(express.logger('dev'));
    server.use(express.bodyParser());
    server.use(express.cookieParser('NOTHING'));
    server.use(express.session());
    // This middleware adds _csrf to 
    // our session
    // req.session._csrf
    server.use(express.csrf());
    server.use(express.methodOverride());
    server.use(server.router);
    server.use(function(req, res, next){
      res.setHeader('X-CSRF-Token', req.session._csrf);
      next();
    });
    // development only
    if ('development' == server.get('env')) {
      server.use(express.errorHandler());
    }

    server.get("/", function(req, res){
      //send and csrf token with frist request
      //and assign it to a global csrf variable
      //inside the template
      res.render('index', {
          csrf : req.session._csrf
      });
    });
});

server.use('/api', require('./database_routes')); 

// SERVER
// ======

// Start Node.js Server
http.createServer(server).listen(port);
