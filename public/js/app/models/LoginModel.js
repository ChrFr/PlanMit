// SegmentModel.js
// the model of a single segment
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var LoginModel = Backbone.Model.extend({
            
            url : '/api/session',

            initialize : function(){
                var _this = this;
                this.csrf = null;
                //get a session token and setup ajax to always send it on
                //requests
                $.ajax({url: this.url,
                    success:function(result){
                        _this.csrf = result.csrf;
                        $.ajaxSetup({
                            headers : {
                                'X-CSRF-Token' : _this.csrf
                            }
                        });
                    }
                });
                this.supportStorage = false;
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

            login : function(data){
                var _this = this;
                console.log(data)
                var login = $.ajax({
                    url : this.url + '/login',
                    data : data,
                    type : 'POST'
                });
                console.log(login)
                /*
                login.done(function(response){
                    _this.set('authenticated', true);
                    _this.set('user', JSON.stringify(response.user));
                    if(_this.get('redirectFrom')){
                        var path = _this.get('redirectFrom');
                        _this.unset('redirectFrom');
                        Backbone.history.navigate(path, { trigger : true });
                    }else{
                        Backbone.history.navigate('', { trigger : true });
                    }
                });
                login.fail(function(){
                    Backbone.history.navigate('login', { trigger : true });
                });*/
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