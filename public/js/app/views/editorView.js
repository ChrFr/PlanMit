// SourceView.js
// -------
define(["jquery", "backbone", "views/segmentView",
        "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, SegmentView, shapeshift){

        var EditorView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".sink",

            // View constructor
            initialize: function(options) {
                this.resources = options.resources;                
                _.bindAll(this, 'registerShapeshift', 'render'); 
                this.collection.bind("ready", this.render);
            },            

            // View Event Handlers
            events: {

            },
            
            //add

            // Renders the view's template to the UI
            render: function() {   
                var _this = this; 
                
                if (this.collection.length === 0)
                    this.registerShapeshift();
                var shapeshift = _.after(this.collection.length, this.registerShapeshift);
                this.collection.each(function(segment){
                    var width = segment.size * _this.pixelRatio();
                    var segmentView = new SegmentView({'parent': _this.$el,
                                                       'segment': segment,
                                                       'height': _this.$el.height(),
                                                       'width': width
                                                      }); 
                    segmentView.render(shapeshift);
                });                
                
                var _this = this;                
                var txtarea = $("#log");
                this.$el.on('divAdded', function(event, div){
                    _this.addClone(div);    
                    _this.collection.resizeID($(div).attr('id'), 
                        parseInt($(div).css('width')) / _this.pixelRatio());
                    txtarea.val(txtarea.val() + '\n' + div.id + " added");
                    _this.updateAttributeLog();
                });
                this.$el.on('divRemoved', function(event, id){
                    _this.collection.removeID(id);
                    txtarea.val(txtarea.val() + '\n' + id + " removed");
                    _this.updateAttributeLog();
                });
                this.$el.on('divResized', function(event, div){    
                    _this.collection.resizeID($(div).attr('id'), 
                        parseInt($(div).css('width')) / _this.pixelRatio());
                    txtarea.val(txtarea.val() + '\n' + div.id + " resized");
                    _this.updateAttributeLog();
                });
                this.$el.on('divPositionChanged', function(event){
                    _this.updatePositions();                    
                    _this.collection.sort();
                    txtarea.val(txtarea.val() + '\n positions changed');
                    _this.updateAttributeLog();
                });
                
                this.updateAttributeLog();
                return this;
            },
            
            updateAttributeLog: function(){                
                $('#elementspx').val(this.allChildrenWidth() * this.pixelRatio());
                $('#elementsm').val(this.allChildrenWidth());
                $('#streetpx').val(this.streetProfileWidth() * this.pixelRatio());                    
                $('#streetm').val(this.streetProfileWidth());
            },
            
            registerShapeshift: function(){    
                this.$el.shapeshift({
                    colWidth: 1,
                    gutterX: 0,
                    minColumns: parseInt(this.$el.css('width')),
                    editTool: {
                        enabled: true
                    },
                    autoHeight: false,
                    align: "left",
                    paddingX: 0,
                    paddingY: 0,
                }); 
                
                
                $(".trash").shapeshift({
                  autoHeight: false,
                  colWidth: 1,
                  enableTrash: true
                });
            },
            
            pixelRatio: function(){
                return parseInt($(this.$el[0]).css('width')) / 
                           this.collection.width;
            },
                        
            allChildrenWidth: function(){
                var width = 0;
                this.collection.each((function(child){
                    width += child.size;
                }));
                return width;
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            },      
            
            streetProfileWidth: function(){
                var width = parseInt($(this.$el[0]).css('width')) / this.pixelRatio();
                this.collection.each((function(child){
                    //category 1 (borders like buildings etc.) don't belong
                    //to the profile of the street
                    if (child.attributes.category === 1)
                        width -= child.size;
                }));
                return width;
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            },    
            
            addClone: function(div){
                var id = $(div).attr('id');  
                var _this = this;
                this.resources.each(function(segment){
                    if (id === segment.id){
                        var clone = segment.clone();
                        clone.setUniqueID();
                        clone.pos = _this.getDivPosition(id);                        
                        _this.updatePositions();
                        _this.collection.addSegment(clone);
                        return $(div).attr('id', clone.id);
                    }
                });
            },
            
            getDivPosition: function(id){
                var pos = 0;
                var i = 0;
                _.each(this.$el.find('.ss-active-child'), (function(div){
                    if ($(div).attr('id') === id){
                        pos = i;
                        return;
                    };
                    i++;
                }));
                return pos;
            },
                        
            updatePositions: function(){
                var ids = [];
                _.each(this.$el.find('.ss-active-child'), (function(div){
                    ids.push($(div).attr('id'));
                }));
                this.collection.updatePositions(ids);
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            },    

        });

        // Returns the View class
        return EditorView;

    }

);