// LoginModel.js
// --------
define(["jquery", "backbone"],

    /**
    * Holds the informations about a session. Manages the CSRF-Token.
    * 
    * @return  the LoginModel class
    */    
    function($, Backbone) {

        var LoginModel = Backbone.Model.extend({
            
            url : 'api/session',

            initialize : function(){
                var _this = this;
                _this.bind('change:csrf', function(){
                            var csrf = _this.get('csrf');
                            $.ajaxSetup({                    
                                headers : {
                                    'X-CSRF-Token' : _this.get('csrf')
                                }}
                            );                            
                 });
                //get a session token and setup ajax to always send it on
                //requests
                $.ajax({url: this.url,
                    success:function(result){
                        _this.set('csrf', result.csrf);
                    }
                });
            },
            
            //authenticate by sending the data wit the user information
            //to the server
            login : function(data){
                var _this = this;
                var login = $.ajax({
                    url : this.url + '/login',
                    data : data,
                    type : 'POST'
                });
                login.done(function(response){
                    _this.set('authenticated', true);
                    _this.set('user', response.user); 
                });
                login.fail(function(response){
                    _this.set('authenticated', false);
                    _this.set('user', null);
                });
            },
            
            //send the register data to the server
            register : function(data){
                var _this = this;
                var login = $.ajax({
                    url : _this.url + '/register',
                    data : data,
                    type : 'POST'
                });
                login.done(function(response){
                });
                login.fail(function(response){
                });
            },

            //logout by sending delete session request to server
            logout : function(){
                var _this = this;
                $.ajax({
                    url : this.url,
                    type : 'DELETE'
                }).done(function(response){
                    _this.clear();
                    //get new token
                    _this.initialize();
                });
            }
        });
        return LoginModel;
    }
);