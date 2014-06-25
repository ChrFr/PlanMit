// SourceView.js
// -------
define(["jquery", "backbone", "views/segmentView",
        "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, SegmentView, shapeshift){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".sink",

            // View constructor
            initialize: function(options) {
                this.resources = options.resources;
                this.render();
            },            

            // View Event Handlers
            events: {

            },
            
            //add

            // Renders the view's template to the UI
            render: function() {   
                var _this = this;
                this.collection.each(function(segment){
                    var segmentView = new SegmentView({'parent': _this.$el,
                                                       'segment': segment,
                                                       'height': _this.$el.height()}); 
                });       
                this.$el.shapeshift({
                    colWidth: 1,
                    gutterX: 0,
                    minColumns: this.$el.width(),
                    editTool: {
                        enabled: true
                    },
                    autoHeight: false,
                    align: "left",
                    paddingX: 0,
                    paddingY: 0,
                }); 
                var _this = this;
                this.$el.on('divAdded', function(event, div){
                    _this.addClone(div);
                });
                this.$el.on('divRemoved', function(event, id){
                    _this.collection.removeID(id);
                });
                this.$el.on('divResized', function(event, div){
                    _this.collection.resizeID($(div).attr('id'), $(div).width());
                });
                this.$el.on('divPositionChanged', _this.updatePositions);
                return this;
            },
            
            addClone: function(div){
                var id = $(div).attr('id');  
                var _this = this;
                this.resources.each(function(segment){
                    if (id === segment.id){
                        var clone = segment.clone();
                        _this.collection.addSegment(clone);
                        clone.setUniqueID();
                        return $(div).attr('id', clone.id);
                    }
                });
                this.updatePositions();
                //console.log(this.collection);
            },
                        
            updatePositions: function(){
                var ids = [];
                _.each(this.$el.find('.ss-active-child'), (function(div){
                    ids.push($(div).attr('id'));
                }));
                this.collection.updatePositions(ids);
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            }            

        });

        // Returns the View class
        return SourceView;

    }

);