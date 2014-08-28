// SourceView.js
// -------
define(["jquery", "backbone", "text!templates/login.html"],

    function($, Backbone, template){

        var EditorView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: "#mainFrame",

            // View constructor
            initialize: function(options) {
                this.session = options.session;
                this.render();      
            },            

            // View Event Handlers
            events: {
                "click #loginButton": "login",
            },        

            // Renders the view's template to the UI
            render: function() {        
                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});
                
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template); 
                // Maintains chainability
                return this;
            },
            
            login: function() {
                var name = $('input#name').val() || '';       
                var email = $('input#email').val() || '';      
                var password = $('input#password').val() || '';
                this.session.login({
                    name: name,
                    email: email,
                    password: password
                });
            }
        });
        
        // Returns the View class
        return EditorView;

    }

);