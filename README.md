
This project uses Backbone-Require-Boilerplate (BRB) provided by Greg Franko.
https://github.com/BoilerplateMVC/Backbone-Require-Boilerplate

additionally requires: node-postgres for PostgreSQL Connection

installation guide:

- install Node.js
- optional: install nodemon ("npm install nodemon -g")
- type "npm install" inside the main folder of this cloned project
- if npm install fails to install pg: manually install with "npm install pg.js" inside the main folder (Windows 8 issue in package node-gyp)
- to configure the postgres connection, edit the ./server/dbconfig_example.js and rename it to dbconfig.js
- to start the server, type "nodemon" inside the main folder (or "node /server/server.js" if nodemon is not installed)
- finally the index page can be accessed under http://localhost:8001