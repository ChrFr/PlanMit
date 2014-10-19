// SourceView.js
// -------
define(["jquery", "backbone", "views/SegmentView"],

    /**
    * A View on the Resources (SegmentCollection)
    *
    * @param options.el          the tag of the DOM Element, the view will be rendered in
    * @param options.images      an ImageCollection with the images of the segments
    * @param options.collection  a SegmentCollection containing the resources
    * @return                    the SourceView class
    * @see                       the resources (segments)
    */ 
    function($, Backbone, SegmentView){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".source",

            // constructor
            initialize: function(options) {                
                this.images = options.images;
                _.bindAll(this, "render");
                //if the resources are fetched and reset is triggerd -> render the view
                this.collection.bind("reset", this.render);
            },            
            
            // Renders the view's template to the UI
            render: function() {                
                var _this = this;
                //render the thumbnails of the segments
                this.collection.each(function(segment){
                    var segmentView = new SegmentView({el: _this.el,
                                                       segment: segment,
                                                       thumb: true,
                                                       thumbSize: parseInt(_this.$el.css('height')) - 2,
                                                       images: _this.images});
                    segmentView.render();
                });          
                
                return this;

            },
            
            //remove the view
            close: function () {
                this.unbind(); // Unbind all local event bindings
                this.remove(); // Remove view from DOM

            }
                
        });

        // Returns the View class
        return SourceView;

    }

);