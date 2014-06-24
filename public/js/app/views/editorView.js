// SourceView.js
// -------
define(["jquery", "backbone", "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, shapeshift){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".sink",

            // View constructor
            initialize: function(options) {
                this.resources = options.resources;
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
                this.$el.on('divAdded', function(event, div){
                    _this.addClone(div);
                });
                this.$el.on('divRemoved', function(event, id){
                    _this.removeSegment(id);
                });
                this.$el.on('divPositionChanged', _this.updatePositions);
                return this;
            },
            
            addClone: function(div){
                var id = div.attr('id');  
                var _this = this;
                this.resources.each(function(segment){
                    if (id === segment.id){
                        var clone = segment.clone();
                        _this.collection.addSegment(clone);
                        clone.setUniqueID();
                        return div.attr('id', clone.id);
                    }
                });
            },
            
            removeSegment: function(id){           
                this.collection.removeID(id);
            },
            
            updatePositions: function(event, div){
                //check order of children of div here, set pos of models in collection by passing ids to collection
            }            

        });

        // Returns the View class
        return SourceView;

    }

);