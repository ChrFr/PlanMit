// navbarView.js
// -------
define(["jquery", "backbone", "text!templates/navbar.html"],

    function($, Backbone, template){

        var View = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".navbar.navbar-default",

            // View constructor
            initialize: function(segments) {
                // Calls the view's render method
                this.render();                
                //change active item if navbar item is clicked
                $('ul.nav > li').click(function (e) {
                    $('ul.nav > li').removeClass('active');
                    $(this).addClass('active');                
                });     
            },

            // View Event Handlers
            events: {

            },

            // Renders the view's template to the UI
            render: function() {               

                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});
                // Dynamically updates the UI with the view's template
                console.log(this.$el);
                this.$el.html(this.template);
                // Maintains chainability
                return this;

            }

        });

        // Returns the View class
        return View;

    }

);