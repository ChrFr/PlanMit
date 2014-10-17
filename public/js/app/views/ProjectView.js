// ProjectView.js
// -------
define(["jquery", "backbone", "text!templates/project.html"],

    function($, Backbone, template){
        var ProjectView = Backbone.View.extend({
            // The DOM Element associated with this view
            el: "#mainFrame",
            // View constructor
            initialize: function() {         
                // Calls the view's render method
                this.render();  
            },

            // View Event Handlers
            events: {
            },

            // Renders the view's template to the UI
            render: function() {
                // Setting the view's template property using the Underscore template method
                var projtmpl = _.template(template);
                // Dynamically updates the UI with the view's template
                for(var i=0; i< 10;i++)
                    $(this.el).append(projtmpl({projectName:i}));
                // Maintains chainability
                return this;
            }

        });

        // Returns the View class
        return ProjectView;

    }

);