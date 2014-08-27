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
                this.session.login();
            }
        });
        
        // Returns the View class
        return EditorView;

    }

);