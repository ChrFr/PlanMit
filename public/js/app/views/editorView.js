// SourceView.js
// -------
define(["jquery", "backbone", "views/segmentView"],

    function($, Backbone, SegmentView){

        var EditorView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".sink",

            // View constructor
            initialize: function(options) {
                this.resources = options.resources; 
                this.fixElements = options.fixElements || false
                _.bindAll(this, 'render', 'loadEdition');                 
                this.collection.bind("reset", this.render);                
                     
                var _this = this;
                
                //sorted list of all views on segments inside the editor
                this.segmentViews = {
                    list: new Array(),
                    at: function(pos){
                        return this.list[pos];
                    },           
                    
                    doesFit: function(div){
                        var left = $(div).offset().left - _this.$el.offset().left;
                        var width = parseInt($(div).css('width'));
                        var right = left + width;
                        var editorWidth = parseInt(_this.$el.css('width'));
                        var gap = {fits: false,
                                   left: 0,
                                   right: 0};
                        //insert placeholder element infront of the list to check
                        //gap between left border of editor and first element
                        this.list.unshift({left: 0, width: 0, cid: null, next: this.list[0]});
                        $.each(this.list, function(index, segmentView){
                            //ignore dragged segmentView in list
                            if (div.data('segmentViewID') && segmentView.cid === div.data('segmentViewID'))
                                return true;
                            var segLeft = segmentView.left;
                            var segRight = segLeft + segmentView.width; 
                            var nextSegment = segmentView.next;
                            //take editor border, if there is no next segment
                            var nextLeft = editorWidth;
                            if (nextSegment){                                
                                //ignore dragged segmentView in list
                                if (segmentView.next.cid === div.data('segmentViewID'))
                                    nextSegment = segmentView.next.next;
                                if (nextSegment)
                                    nextLeft = nextSegment.left;
                            };
                            
                            //2 segments found, where div is in between
                            if (left >= segRight && left <= nextLeft){
                                //enough room for the div?
                                if (right <= nextLeft){                                
                                    gap.left = left - segRight;
                                    gap.right = nextLeft - right;
                                    gap.fits = true;
                                }
                                //break loop, because list is sorted 
                                return false;
                                
                            }
                        });
                        //remove placeholder
                        this.list.shift();
                        return gap;
                    },
                    
                    insert: function(segmentView){
                        var pos = 0;
                        $.each(this.list, function( index, existingView ){
                            if (segmentView.left <= existingView.left){
                                return false;               
                            }
                            pos += 1;
                        });
                        this.list.splice(pos, 0, segmentView);
                        segmentView.prev = (pos > 0) ? this.at(pos-1) : null;
                        segmentView.next = (pos < this.list.length - 1) ? this.at(pos+1) : null;
                        if (segmentView.prev)
                            segmentView.prev.next = segmentView;
                        if (segmentView.next)
                            segmentView.next.prev = segmentView;
                        var segmentViews = this;
                        segmentView.on("moved", function(){                            
                            segmentViews.relocate(this);
                        });
                        segmentView.on("delete", function(){                            
                            segmentViews.remove(this, true);
                        });
                    },
                    
                    remove: function(segmentView, doDelete){
                        var pos = 0;   
                        //bend pointers
                        var prev = segmentView.prev;
                        var next = segmentView.next;
                        if (prev){
                            prev.next = (next) ? next: null;
                        }
                        if (next){
                            next.prev = (prev) ? prev: null;
                        }
                        $.each(this.list, function( index, existingView ){
                            //return false breaks the loop (has to be false
                            //for whatever reason)
                            if (segmentView == existingView){
                                return false;               
                            }
                            pos += 1;
                        });
                        this.list.splice(pos, 1);
                        //ToDo: remove view, segmentView.remove() the whole 
                        //editor (most likely because the parent el is the editor)
                        /*if (doDelete)
                            segmentView.remove();*/
                    },
                    
                    clear: function(){
                        $.each(this.list, function( index, segmentView ){
                            segmentView.off("delete");                          
                            segmentView.delete();
                        });
                        this.list = new Array();
                    },
                    
                    //replace a single view to maintain sort order
                    relocate: function(segmentView){
                        this.remove(segmentView);
                        segmentView.off("moved");
                        this.insert(segmentView);                        
                    },
                    
                };
                
                this.placeholder = {
                    active: false,
                    left: 0,
                    div: null,   
                    cid: null,
                    segmentView: null,
                    snapTolerance: 20,
                    offsetX: -20, 
                    droppable: true,

                    updatePos: function(left){
                        if (this.active){
                            left += this.offsetX;
                            var minLeft = _this.$el.offset().left;
                            var maxLeft = minLeft + 
                                          parseInt(_this.$el.css('width')) -
                                          parseInt($(this.div).css('width'));
                            if (left <= minLeft)
                                left = minLeft;                                
                            else if (left >= maxLeft)
                                left = maxLeft;
                            this.left = left;
                            $(this.div).css('left', left);
                            var gap = _this.segmentViews.doesFit(this.div);
                            //flag as not droppable if collision to neighbours 
                            //is detected
                            if (!gap.fits){
                                this.droppable = false;
                                $(this.div).addClass('blocked');
                            }
                            //flag as droppable, 
                            //snap the placeholder to other segments
                            else {
                                this.droppable = true;
                                //take shortest distance to next segment
                                var snap = (gap.left < gap.right) ? -gap.left: gap.right;
                                //shift the placeholder, if distance is shorter 
                                //than the defined snap tolerance
                                if (Math.abs(snap) < this.snapTolerance){
                                    this.left += snap;
                                    $(this.div).css('left', this.left);
                                };
                                $(this.div).removeClass('blocked');
                            }
                        }
                    },
                    
                    setActive: function(active, clone){
                        this.active = active;
                        //remove placeholder if deactivated
                        if (!active)
                            $(this.div).remove();
                        //create placeholder on position of given div with offset
                        else if (clone){
                            //update the positions of the other divs
                            this.cid = clone.data('segmentViewID');
                            var left = clone.position().left;
                            var width = clone.css('width');
                            this.div = $(document.createElement('div'));
                            $(this.div).css('width', width);
                            $(this.div).css('height', _this.$el.css('height'));
                            $(this.div).addClass('placeholder');
                            $(this.div).data('segmentViewID', this.cid);
                            $(this.div).zIndex(9999);
                            _this.$el.append(this.div);
                            this.updatePos(left);
                        }
                    },
                    
                };              
                
                 //only fetch the edition from db (incl. overwrite), 
                //if no models are overwritten (meaning it is not already load)
                if (this.collection.models.length === 0){
                    this.collection.fetch({reset: true});}
                //else only render (and show modified edition rather than reset
                else
                    this.render();                
                
                //put a canvas in the background                
                var canvas = document.createElement("canvas");   
                this.canvas = canvas;
                $(canvas).css('position', 'absolute');
                $(canvas).css('width', this.$el.css('width'));
                $(canvas).css('height', this.$el.css('height'));
                $(canvas).zIndex(0);
                this.$el.append(canvas);
                
            },            

            // View Event Handlers
            events: {

            },        

            // Renders the view's template to the UI
            render: function() {   
                var _this = this;                
                
                this.makeDroppable();
                if (this.collection.length > 0)
                    this.loadEdition(); 
               
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
                    _this.collection.sort();
                    txtarea.val(txtarea.val() + '\n positions changed');
                    _this.updateAttributeLog();
                });
                
                this.updateAttributeLog();
                this.drawInfo();
                return this;
            },
            
            drawInfo: function(){      
                var ctx=this.canvas.getContext("2d");
                ctx.beginPath();
                ctx.moveTo(0, 2);
                ctx.lineTo(parseInt($(this.canvas).css('width')), 2);  
                ctx.stroke();
            },
            
            makeDroppable: function(){
                var _this = this;
                this.$el.droppable({
                    tolerance: "touch",
                    cursor: 'auto',
                    over: function(e, dragged) {
                        var clone = $(dragged.helper);        
                        clone.animate({height: _this.$el.css('height')}, 250);    
                        _this.placeholder.setActive(true, clone);
                        dragged.draggable.on( "drag", function( event, ui ) {
                            _this.placeholder.updatePos(event.clientX);} );
                        return;
                    },
                    drop: function(e, dropped) {
                        //if the origin of the dropped segment is not this container
                        //clone the segment and make a new view
                        var draggedDiv = dropped.draggable;
                        var placeholder = _this.placeholder;
                        if (_this.el != draggedDiv.parent()[0]){
                            dropped.helper.remove();
                            if (placeholder.droppable){
                                var segment = _this.resources.getSegmentByID(draggedDiv.data('segmentID')); 
                                var clone = segment.clone();
                                var segmentView = new SegmentView({'el': _this.el,
                                                                   'segment': clone,
                                                                   'leftOffset': placeholder.left,
                                                                   'height': parseInt(placeholder.div.css('height')),
                                                                   'pixelRatio': _this.pixelRatio()});
                                segmentView.render();
                                _this.collection.addSegment(clone);
                                _this.segmentViews.insert(segmentView);
                            }
                        }
                        //else move the existing element to the position of the
                        //placeholder
                        else if (placeholder.droppable){                                
                            //place the div on the position of the
                            //placeholder and prevent moving back
                            draggedDiv.css('top', _this.$el.css('top'));
                            draggedDiv.css('left', placeholder.left);
                            draggedDiv.draggable( "option", "revert", false );
                        }
                        else
                            //move the div back to its former position
                            draggedDiv.draggable( "option", "revert", true );
                        placeholder.setActive(false);
                    },
                    out: function(e, dragged){
                        var clone = $(dragged.helper);  
                        clone.animate({height: dragged.draggable.css('height')}, 100);
                        _this.placeholder.setActive(false);
                    }
                });
            },
                        
            updateAttributeLog: function(){                
                $('#elementspx').val(this.allChildrenWidth() * this.pixelRatio());
                $('#elementsm').val(this.allChildrenWidth());
                $('#streetpx').val(this.streetProfileWidth() * this.pixelRatio());                    
                $('#streetm').val(this.streetProfileWidth());
            },
            
            clear: function(){
                 this.segmentViews.clear();
                 this.collection.reset();
            },
            
            //divide the edit view into no editable divs and editable divs 
            //(last ones are registered to shapeshift) depending on the
            //the fixed attribute of each segment model in the collection
            loadEdition: function(){
                var _this = this;
                var height = parseInt(this.$el.css('height'));
                var editorOffset = this.$el.offset().left
                var ratio = this.pixelRatio();
                this.collection.each(function(segment){
                    var fixed = (_this.fixElements) ? segment.fixed: false;
                    var segmentView = new SegmentView({'el': _this.el,
                                                      'segment': segment,
                                                      'leftOffset': segment.startPos * ratio + editorOffset,
                                                      'height': height,
                                                      'fixed': fixed,
                                                      'width': segment.size * ratio,
                                                      'pixelRatio': _this.pixelRatio()});
                    segmentView.render();
                    _this.segmentViews.insert(segmentView);
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
            
                 
        });

        // Returns the View class
        return EditorView;

    }

);