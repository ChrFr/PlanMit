// SegmentModel.js
// the model of a single segment
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var LoginModel = Backbone.Model.extend({
            
            url : '/login',

            initialize : function(){
                this.csrf = null;
                //Ajax Request Configuration
                //To Set The CSRF Token To Request Header
                $.ajaxSetup({
                    headers : {
                        'X-CSRF-Token' : this.csrf
                    }
                });

                //Check for sessionStorage support
                //if(Storage && sessionStorage){
                    this.supportStorage = false;
                //}
            },

            get : function(key){
                return Backbone.Model.prototype.get.call(this, key);
            },


            set : function(key, value){
                Backbone.Model.prototype.set.call(this, key, value);
                return this;
            },

            unset : function(key){
                Backbone.Model.prototype.unset.call(this, key);
                return this;   
            },

            clear : function(){      
                Backbone.Model.prototype.clear(this);
            },

            login : function(credentials){
                var that = this;
                var login = $.ajax({
                    url : this.url,
                    data : credentials,
                    type : 'POST'
                });
                login.done(function(response){
                    that.set('authenticated', true);
                    that.set('user', JSON.stringify(response.user));
                    if(that.get('redirectFrom')){
                        var path = that.get('redirectFrom');
                        that.unset('redirectFrom');
                        Backbone.history.navigate(path, { trigger : true });
                    }else{
                        Backbone.history.navigate('', { trigger : true });
                    }
                });
                login.fail(function(){
                    Backbone.history.navigate('login', { trigger : true });
                });
            },

            logout : function(callback){
                var that = this;
                $.ajax({
                    url : this.url + '/logout',
                    type : 'DELETE'
                }).done(function(response){
                    //Clear all session data
                    that.clear();
                    //Set the new csrf token to csrf vaiable and
                    //call initialize to update the $.ajaxSetup 
                    // with new csrf
                    this.csrf = response.csrf;
                    that.initialize();
                    callback();
                });
            },


            getAuth : function(callback){
                var that = this;
                var Session = this.fetch();

                Session.done(function(response){
                    that.set('authenticated', true);
                    that.set('user', JSON.stringify(response.user));
                });

                Session.fail(function(response){
                    response = JSON.parse(response.responseText);
                    that.clear();
                    csrf = response.csrf !== csrf ? response.csrf : csrf;
                    that.initialize();
                });

                Session.always(callback);
            }
        });

        return LoginModel;

    }

);