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
                this.isAdminView = options.isAdminView || false
                _.bindAll(this, 'registerShapeshift', 'render', 'partitionEditDiv');                 
                this.collection.bind("reset", this.render);
                
                //only fetch the edition from db (incl. overwrite), 
                //if no models are overwritten (meaning it is not already load)
                if (this.collection.models.length === 0){
                    this.collection.fetch();}
                //else only render (and show modified edition rather than reset
                else
                    this.render();
            },            

            // View Event Handlers
            events: {

            },
            
            //add

            // Renders the view's template to the UI
            render: function() {   
                var _this = this; 
                
                if (this.collection.length > 0)
                    this.partitionEditDiv(); 
                
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
            
            //divide the edit view into no editable divs and editable divs 
            //(last ones are registered to shapeshift) depending on the
            //the fixed attribute of each segment model in the collection
            partitionEditDiv: function(){
                var _this = this; 
                var height = parseInt(this.$el.css('height'));
                var p = _.after(this.collection.length, 
                    function(){_this.registerShapeshift()});
                            
                //group the segments by fixed or not (left to right)
                //and render them in grouped divs
                var group = 0;   
                var div = $(document.createElement('div'));
                $(div).css('height', height + 'px');
                $(div).css('width', this.$el.css('width'));
                $(div).attr('id', 'edit0');     
                this.$el.append(div);
                var currentWidth = 0;
                for (var i = 0; i < this.collection.length; i++){
                    var current = this.collection.at(i);
                    var next = this.collection.at(i+1);   
                    if (!current.fixed)
                        $('#edit'+group).addClass('container droparea');    
                    var width = parseInt(current.size * _this.pixelRatio());
                    currentWidth += width;
                    $('#edit'+group).css('width', currentWidth + 'px');
                    if (current.attributes.category !== 0) {
                        var segmentView = new SegmentView({
                            'parent': $('#edit'+group),
                            'segment': current,
                            'height': height,
                            'width': width
                        });                         
                        segmentView.render(p);}
                    else
                        p();
                    //next segment has different fixed attribute -> add div for next group
                    if (next && current.fixed !== next.fixed){                                
                        group++;                  
                        currentWidth = 0;                                
                        var div = $(document.createElement('div'));
                        $(div).css('height', height);     
                        $(div).attr('id', 'edit'+group); 
                        this.$el.append(div);  
                    }
                };          
            },
                        
            registerShapeshift: function(){   
                var columns = parseInt(this.$el.css('width'));
                _.each(this.$el.find('.container.droparea'), function(div){
                    $(div).shapeshift({
                        colWidth: 1,
                        gutterX: 0,
                        minColumns: columns,
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