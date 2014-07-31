// SourceView.js
// -------
define(["jquery", "backbone", "views/segmentView"],

    function($, Backbone, SegmentView){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".source",

            // View constructor
            initialize: function(options) {
                
                //if collection changes, view will be rendered
                _.bindAll(this, "render");
                this.collection.bind("reset", this.render);
                //this.target = options.target;
            },            

            // View Event Handlers
            events: {

            },
            
            // Renders the view's template to the UI
            render: function() {                
                var _this = this;
                this.collection.each(function(segment){
                    var segmentView = new SegmentView({'el': _this.el,
                                                       'segment': segment,
                                                       'cloneable': true});
                                                       //'target': this.target
                    segmentView.render();
                });          
                
                return this;

            }
                
        });

        // Returns the View class
        return SourceView;

    }

);