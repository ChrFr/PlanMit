// View.js
// -------
define(["jquery", "backbone", "text!templates/edit.html", 
    "edittool/js/jquery.shapeshift.adapted", "collections/SegmentSource"],

    function($, Backbone, template, shapeshift, SegmentSource){

        var View = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".mainFrame",

            // View constructor
            initialize: function(resources) {
                
                this.resources = resources;
                this.resources.populate(3);

                // Calls the view's render method
                this.render();
                
                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});
                
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);
                
                $(".clones").shapeshift({
                    dragClone: true,
                    colWidth: 1,
                    gutterX: 0,
                    enableCrossDrop: false
                });
                $(".droparea").shapeshift({
                  colWidth: 1,
                  gutterX: 0,
                  minColumns: 800,
                  editTool: {
                      enabled: true
                  },
                  maxHeight: 200
                }); 
                $(".trash").shapeshift({
                  autoHeight: false,
                  colWidth: 1,
                  enableTrash: true
                });

            },

            // View Event Handlers
            events: {

            },

            // Renders the view's template to the UI
            render: function() {     
                // Maintains chainability
                return this;

            }

        });

        // Returns the View class
        return View;

    }

);