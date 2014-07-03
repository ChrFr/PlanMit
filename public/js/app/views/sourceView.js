// SourceView.js
// -------
define(["jquery", "backbone", "views/segmentView", 
        "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, SegmentView, shapeshift){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".source",

            // View constructor
            initialize: function() {
                
                //if collection changes, view will be rendered
                _.bindAll(this, "render");
                this.collection.bind("reset", this.render);

            },            

            // View Event Handlers
            events: {

            },
            
            // Renders the view's template to the UI
            render: function() {                
                var _this = this;
                this.collection.each(function(segment){
                    var segmentView = new SegmentView({'parent': _this.$el,
                                                       'segment': segment});
                    segmentView.render();
                });          
                
                //register the container with it's childs to shapeshift
                this.$el.shapeshift({
                    dragClone: true,
                    colWidth: 1,
                    gutterX: 0,
                    minColumns: 100,
                    enableCrossDrop: false
                });
                return this;

            }
                
        });

        // Returns the View class
        return SourceView;

    }

);