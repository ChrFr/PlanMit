//enter valid entries and rename the file to dbconfig.js
module.exports = function(){
    var config = {
        serverconfig: {
            port: "61957"
        },
        dbconfig: {
            user: "postgres",            
            password: "topit524",
            host: "localhost",
            port: "5432",
            database: "bachelorarbeit"
        }
    };
    return config;
}();