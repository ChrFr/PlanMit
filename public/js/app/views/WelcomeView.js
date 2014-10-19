// WelcomeView.js
// -------
define(["jquery", "backbone", "text!templates/welcome.html"],

    /**
    * A View that renders a welcome message onto the screen 
    *
    * @param  options.el  the tag of the DOM Element, the view will be rendered in
    * @return             the WelcomeView class
    * @see                a welcome screen
    */
    function($, Backbone, template){
        var WelcomeView = Backbone.View.extend({
            // The DOM Element associated with this view
            el: "#mainFrame",
            // View constructor
            initialize: function() {         
                // Calls the view's render method
                this.render();  
            },

            events: {
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
            
            //remove the view
            close: function () {
                this.unbind(); // Unbind all local event bindings
                this.remove(); // Remove view from DOM
            }

        });

        // Returns the View class
        return WelcomeView;

    }

);