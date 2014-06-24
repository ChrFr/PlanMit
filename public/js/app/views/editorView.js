// SourceView.js
// -------
define(["jquery", "backbone", "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, shapeshift){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".sink",

            // View constructor
            initialize: function(source) {
                this.resources = source;
                console.log(this.collection);
                this.render();
                //if collection changes, view will be rendered
                //_.bindAll(this, "render");
                //this.collection.bind("reset", this.render);
            },            

            // View Event Handlers
            events: {

            },
            
            //add

            // Renders the view's template to the UI
            render: function() {    
                this.$el.shapeshift({
                  colWidth: 1,
                  gutterX: 0,
                  minColumns: this.$el.width(),
                  minHeight: this.$el.height() - 20,
                  editTool: {
                      enabled: true
                  },
                  //maxHeight: 500,
                  autoHeight: false,
                  align: "left"
                }); 
                var _this = this;
                this.$el.on('divAdded', _this.addSegment);
                this.$el.on('divRemoved', _this.removeSegment);
                this.$el.on('divPositionChanged', _this.changePosition);
                return this;
            },
            
            addSegment: function(event, div){
                var id = div.attr('id');
                console.log(id);
            },
            
            removeSegment: function(event, div){
                var id = div.attr('id');
                console.log(id);                
            },
            
            changePosition: function(event, div){
                var id = div.attr('id');
                console.log(id);                
            },
            
            getSegmentByID: function(id){
                
            }
            

        });

        // Returns the View class
        return SourceView;

    }

);