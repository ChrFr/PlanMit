// SourceView.js
// -------
define(["jquery", "backbone", "text!templates/login.html"],

    function($, Backbone, template){

        var EditorView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: "#mainFrame",

            // View constructor
            initialize: function(options) {
                var _this = this;
                var options = options || {};
                this.session = options.session;
                if (this.session) 
                    this.session.bind("change:user", function() {_this.render()});
                this.render();      
            },            

            // View Event Handlers
            events: {
                "click #loginButton": "login",
                "click #registerButton": "register",
                "click #logoutButton": "logout",
            },        

            // Renders the view's template to the UI
            render: function() {        
                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});
                
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template); 
                if (this.session.get('authenticated')){
                    $('#loginForm').hide();
                    $('#registerForm').hide();
                    $('#loginStatus').show();
                    this.displayStatus();
                }
                else{
                    $('#loginForm').show();
                    $('#registerForm').show();
                    $('#loginStatus').hide();
                }
            
                // Maintains chainability
                return this;
            },
            
            login: function() {
                var name = $('#loginForm').find('#name').val() || '';      
                var password = $('#loginForm').find('#password').val() || '';
                this.session.login({
                    name: name,
                    password: password
                });
            },
            
            logout: function(){
                this.session.logout();
            },
            
            register: function(){
                var name = $('#registerForm').find('#name').val() || '';       
                var email = $('#registerForm').find('#email').val() || '';      
                var password = $('#registerForm').find('#password').val() || '';
                this.session.register({
                    name: name,
                    email: email,
                    password: password
                });
            },
            
            displayStatus: function(){            
                var user = this.session.get('user');                
                $('#loginStatus').find('#name').val(user.name);
                $('#loginStatus').find('#email').val(user.email);
                $('#loginStatus').find('#password').val(user.password);
                if (user.superuser)
                    $('#loginStatus').find('#status').text('Sie sind als Superuser angemeldet');
            }
        });
        
        // Returns the View class
        return EditorView;

    }

);