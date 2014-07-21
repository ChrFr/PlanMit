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
                this.creationMode = options.creationMode || false
                _.bindAll(this, 'registerShapeshift', 'render', 'partitionEditDiv');                 
                this.collection.bind("reset", this.render);
                
                //only fetch the edition from db (incl. overwrite), 
                //if no models are overwritten (meaning it is not already load)
                if (this.collection.models.length === 0){
                    this.collection.fetch({reset: true});}
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
                var editorWidth = parseInt(this.$el.css('width'));
                                   
                var placeholders = new Array();               
                
                this.collection.each(function(segment){
                    if (segment.attributes.category === 0){
                        placeholders.push(segment);
                    }
                });
                if (!this.creationMode)
                    _.each(placeholders, function(placeholder){
                       _this.collection.remove(placeholder); 
                    });
                                
                var p = _.after(this.collection.length, 
                    function(){_this.registerShapeshift()});
                            
                function addDiv(height, width, editable){
                    var curDiv = $(document.createElement('div'));
                    $(curDiv).css('height', height + 'px');
                    $(curDiv).css('width', width + 'px');
                    _this.$el.append(curDiv);
                    if (editable)
                        $(curDiv).addClass('container droparea');
                    return curDiv;
                }
                var divWidth = 0;
                var totalWidth = 0;
                
                var editable;
                if (!this.creationMode)
                    editable = this.collection.at(0).fixed;
                else
                    editable = true;
                var curDiv = addDiv(height, editorWidth, editable);
                
                for (var i = 0; i < this.collection.length; i++){
                    var current = this.collection.at(i);
                    var next = this.collection.at(i+1);    
                    var width = current.size * _this.pixelRatio();                    
                    divWidth += width;
                    totalWidth += width;
                    $(curDiv).css('width', divWidth);
                    var segmentView = new SegmentView({
                        'parent': curDiv,
                        'segment': current,
                        'height': height,
                        'yOffset': 0,
                        'width': width
                    });         
                    segmentView.render(p);  
                    
                    if (!this.creationMode && next && (next.fixed || next.fixed !== current.fixed)){ 
                        //reset div width to start counting for next one
                        divWidth = 0;
                        //is there a gap between to the next fixed div? -> add a 
                        //editable div in between
                        var gap = next.offset - (current.offset + current.size);
                        if (next.fixed && current.fixed && gap > 0.5){
                            addDiv(height, gap * this.pixelRatio(), true);
                        }
                        if (next.fixed && !current.fixed && gap){
                            curDiv.css('width', parseInt(curDiv.css('width')) + gap * this.pixelRatio());
                        }
                        console.log (current.fixed);
                        console.log(!(current.fixed))
                        curDiv = addDiv(height, 0, !(next.fixed));
                        this.$el.append(curDiv);
                    }
                        
                };
                
            },
                                    
            registerShapeshift: function(){  
                _.each(this.$el.find('.container.droparea'), function(div){ 
                    var columns = parseInt($(div).css('width'));
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
                this.updatePositions();
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
                        clone.offset = ($(div).offset().left - _this.$el.offset().left) / _this.pixelRatio()
                        _this.updatePositions();
                        _this.collection.addSegment(clone, !(_this.creationMode));
                        return $(div).attr('id', clone.id);
                    }
                });
            },
            
            getDivPosition: function(id){
                var pos = 0;
                var i = 0;
                _.each(this.$el.find('.segment'), (function(div){
                    if ($(div).attr('id') === id){
                        pos = i;
                        return;
                    };
                    i++;
                }));
                return pos;
            },
                        
            updatePositions: function(){
                console.log(this.collection);
                var ids = [];
                var offset = [];
                var _this = this;
                _.each(this.$el.find('.segment'), (function(div){
                    ids.push($(div).attr('id'));
                    offset.push(($(div).offset().left - _this.$el.offset().left) / _this.pixelRatio())
                }));
                this.collection.updatePositions(ids, offset);
                console.log(this.collection);
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            },    

        });

        // Returns the View class
        return EditorView;

    }

);