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

            // Renders the view's template to the UI
            render: function() {            
                var canvas = this.$el.find('canvas')[0];
                this.segmentViews = new this.SegmentViewCollection(this.$el);
                this.placeholder = new this.Placeholder(this.segmentViews, this.$el);
                this.measure = new this.MeasureDisplay(this.segmentViews, canvas, this.$el);
                this.measure.draw();
                
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
                return this;
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
            
            SegmentViewCollection: function(parent){
                this.parent = parent;
                this.first = null;
                
                this.at = function(pos){
                    var found = null;
                    var next = this.first;
                    var i = 0;
                    while (next) {
                        if (i === pos) {
                            found = next;
                            break;
                        };
                        next = next.next;
                        i++;
                    };
                    return found;
                };          

                this.doesFit = function(div){
                    var left = $(div).offset().left - parent.offset().left;
                    var width = parseInt($(div).css('width'));
                    var right = left + width;
                    var editorWidth = parseInt(parent.css('width'));
                    var gap = {fits: false,
                               left: 0,
                               right: 0};
                    if (!this.first){
                        if (width <= editorWidth) {
                            gap.fits = true;
                            gap.left = left;
                            gap.right = editorWidth - right;
                        }
                        return gap;
                    };
                    //temporary first element is left border
                    var tmp = {left: 0, width: 0, cid: null, next: this.first};
                    var segmentView = tmp;
                    while(segmentView){ 
                        var divID = div.data('segmentViewID');                        
                        //ignore segmentView currently dragged
                        if (divID && segmentView.cid === divID)
                            continue;
                        var segLeft = segmentView.left;
                        var segRight = segLeft + segmentView.width; 
                        var next = segmentView.next;
                        if (next){                
                            //ignore segmentView currently dragged
                            if (next.cid === divID)
                                next = segmentView.next.next;
                        };                        
                        
                        //take editor border, if there is no next segment
                        var nextLeft = (next) ? next.left: editorWidth;

                        //2 segments found, where div is in between
                        if (left >= segRight && left <= nextLeft){
                            //enough room for the div?
                            if (right <= nextLeft){  
                                gap.fits = true;
                                gap.left = left - segRight;
                                gap.right = nextLeft - right;
                            }
                            //break loop, because list is sorted 
                            break;
                        }
                        segmentView = segmentView.next;
                    };
                    
                    tmp.next = null;
                    
                    return gap;
                };

                this.insert = function(segmentView){
                    if (!this.first){
                        this.first = segmentView;
                        segmentView.prev = null;
                        segmentView.next = null;
                    }
                    else {
                        var next = this.first;
                        var prev = null;
                        while(next){ 
                            if (segmentView.left <= next.left)
                                break;        
                            prev = next;
                            next = next.next;
                        };
                        segmentView.prev = (prev) ? prev : null;
                        if (!prev){
                            this.first = segmentView;
                        }
                        segmentView.next = (next) ? next : null;
                        if (segmentView.prev)
                            segmentView.prev.next = segmentView;
                        if (segmentView.next)
                            segmentView.next.prev = segmentView;;               
                    };
                    segmentView.on("moved", function(){                            
                        this.relocate(this);
                    });
                    segmentView.on("delete", function(){                            
                        this.remove(this, true);
                    });
                };

                this.remove = function(segmentView, doDelete){
                    //bend pointers
                    var prev = segmentView.prev;
                    var next = segmentView.next;
                    if (prev){
                        prev.next = (next) ? next: null;
                    };
                    if (next){
                        next.prev = (prev) ? prev: null;
                        if (!prev){
                            this.first = next;
                        }                            
                    };
                    segmentView.prev = null;
                    segmentView.next = null;
                    //ToDo: remove view, segmentView.remove() removes the whole 
                    //editor (most likely because the parent el is the editor)
                    /*if (doDelete)
                        segmentView.remove();*/
                };

                this.clear = function(){
                    var segmentView = this.first;
                    while(segmentView){ 
                        segmentView.off("delete");                          
                        segmentView.delete();
                        segmentView = segmentView.next;
                    };
                    this.first = null;
                };

                //replace a single view to maintain sort order
                this.relocate = function(segmentView){
                    this.remove(segmentView);
                    segmentView.off("moved");
                    this.insert(segmentView);                        
                };
            },
            
            MeasureDisplay: function(segmentViews, canvas, parent){
                this.canvas = canvas;
                this.parent = parent;
                this.segmentViews = segmentViews;                
                $(canvas).css('width', parent.css('width'));
                $(canvas).css('height', parent.css('height'));     
                
                this.draw = function(){      
                    var ctx=this.canvas.getContext("2d");
                    ctx.beginPath();
                    ctx.moveTo(0, 2);
                    ctx.lineTo(parseInt($(this.canvas).css('width')), 2);  
                    ctx.stroke();
                };
            },
                
            Placeholder: function(segmentViews, parent){
                this.parent = parent;
                this.segmentViews = segmentViews;
                this.active = false;
                this.left = 0;
                this.div = null;
                this.cid = null;
                this.segmentView = null;
                this.snapTolerance = 20;
                this.offsetX = -20;
                this.droppable = true;

                this.updatePos = function(left){
                    if (this.active){
                        left += this.offsetX;
                        var minLeft = parent.offset().left;
                        var maxLeft = minLeft + 
                                      parseInt(parent.css('width')) -
                                      parseInt($(this.div).css('width'));
                        if (left <= minLeft)
                            left = minLeft;                                
                        else if (left >= maxLeft)
                            left = maxLeft;
                        this.left = left;
                        $(this.div).css('left', left);
                        var gap = this.segmentViews.doesFit(this.div);
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
                };

                this.setActive = function(active, clone){
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
                        $(this.div).css('height', parent.css('height'));
                        $(this.div).addClass('placeholder');
                        $(this.div).data('segmentViewID', this.cid);
                        $(this.div).zIndex(9999);
                        parent.append(this.div);
                        this.updatePos(left);
                    }
                };                               
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