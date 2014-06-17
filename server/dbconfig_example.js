//enter valid entries and rename the file to dbconfig.js
module.exports = function(){
    var login = {
        user: "username",
        password: "password",
        host: "localhost",
        port: "5432",
        database: "database_name"
    };
    return login;
}();