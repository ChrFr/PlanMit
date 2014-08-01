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
                this.creationMode = options.creationMode || false
                _.bindAll(this, 'render', 'partitionEditDiv');                 
                this.collection.bind("reset", this.render);
                
                //only fetch the edition from db (incl. overwrite), 
                //if no models are overwritten (meaning it is not already load)
                //if (this.collection.models.length === 0){
                //    this.collection.fetch({reset: true});}
                //else only render (and show modified edition rather than reset
                //else
                this.render();      
                var _this = this;
                
                //sorted list of all views on segments inside the editor
                this.segmentViews = {
                    list: new Array(),
                    at: function(pos){
                        return this.list[pos];
                    },
                    insert: function(segmentView){
                        var pos = 0;
                        $.each(this.list, function( index, existingView ){
                            if (segmentView.posX <= existingView.posX){
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
                    //replace a single view to maintain sort order
                    relocate: function(segmentView){
                        this.remove(segmentView);
                        segmentView.off("moved");
                        this.insert(segmentView);                        
                    }
                };
                
                this.placeholder = {
                    active: false,
                    left: 0,
                    div: null,   
                    id: null,
                    snapTolerance: 20,
                    offsetX: -20, 
                    droppable: true,
                    divPositions: _this.getDivPositions(),

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
                            var neighbours = this.checkNeighbours();
                            //flag as not droppable if collision to neighbours 
                            //is detected
                            if (neighbours.collision){
                                this.droppable = false;
                                $(this.div).addClass('blocked');
                            }
                            //flag as droppable, 
                            //snap the placeholder to other segments
                            else {
                                this.droppable = true;
                                this.left += neighbours.snap;
                                $(this.div).css('left', this.left);
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
                            this.id = clone.attr('id');
                            this.divPositions = _this.getDivPositions(this.id);
                            var left = clone.position().left;
                            var width = clone.css('width');
                            this.div = $(document.createElement('div'));
                            $(this.div).css('width', width);
                            $(this.div).css('height', _this.$el.css('height'));
                            $(this.div).addClass('placeholder');
                            $(this.div).zIndex(9999);
                            _this.$el.append(this.div);
                            this.updatePos(left);
                        }
                    },
                    
                    /*
                     * check for neighbours of the placeholder 
                     * return {collision: true} if collision detected
                     * return {snap: 0} if no neighbour is within snap range
                     * return {snap: pixels} if a neighbour is within snap range
                     */
                    checkNeighbours: function(){
                        var left = $(this.div).position().left;
                        var right = left + parseInt($(this.div).css('width'));
                        var ret = {collision: false,
                                   snap: 0};
                        var _this = this;
                        _.each(this.divPositions, (function(divPos){
                            var divRight = divPos.left + divPos.width;
                            if ((left >= divPos.left && 
                                 left <= divRight) ||
                                (right >= divPos.left &&
                                 right <= divRight)){
                                ret.collision = true;
                                return;
                            }
                            else {
                                //get distances to neighbours (left: negative 
                                //right: positive), 
                                //get the smaller distance to snap
                                var leftDistance = left - divRight;
                                var distance = leftDistance > 0? -leftDistance: 0;
                                var rightDistance = divPos.left - right;
                                if (rightDistance < Math.abs(distance))
                                    distance = rightDistance;
                                var distance = leftDistance > rightDistance ? -leftDistance: rightDistance;
                                if (Math.abs(distance) < _this.snapTolerance)
                                    ret.snap = distance;
                            }
                        }));
                        return ret;
                    }
                };
                
            },            

            // View Event Handlers
            events: {

            },        

            // Renders the view's template to the UI
            render: function() {   
                var _this = this; 

                this.makeDroppable();
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
                            var clone = _this.addClone(draggedDiv);
                            dropped.helper.remove();
                            if (placeholder.droppable){
                                var segmentView = new SegmentView({'el': _this.el,
                                                                   'segment': clone,
                                                                   'leftOffset': placeholder.left,
                                                                   'height': parseInt(placeholder.div.css('height')),
                                                                   'pixelRatio': _this.pixelRatio()});
                                segmentView.render();
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
                    if (!this.creationMode)
                        $(curDiv).css('width', divWidth);
                    var segmentView = new SegmentView({
                        'parent': curDiv,
                        'segment': current,
                        'height': height,
                        'yOffset': 0,
                        'width': width
                    });         
                    segmentView.render();  
                    
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
                        curDiv = addDiv(height, 0, !(next.fixed));
                        this.$el.append(curDiv);
                    }
                        
                };
                
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
                var clone = null;
                this.resources.each(function(segment){
                    if (id === segment.id){
                        clone = segment.clone();
                        clone.setUniqueID();
                        clone.pos = _this.getDivPosition(id);
                        clone.offset = ($(div).offset().left - _this.$el.offset().left) / _this.pixelRatio()
                        _this.updatePositions();
                        _this.collection.addSegment(clone, !(_this.creationMode));
                        
                        return;
                    }
                });
                return clone;
            },
            
            getDivPositions: function(ignoreID){
                var divPos = new Array();
                _.each(this.$el.find('.segment'), (function(div){
                    var id = $(div).attr('id');
                    if (ignoreID != id){
                        var left = parseInt($(div).css('left'));
                        var width = parseInt($(div).css('width'));
                        divPos.push({
                            id: id,
                            left: left,
                            width: width
                        });
                    }
                }));
                return divPos;
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
                var ids = [];
                var offset = [];
                var _this = this;
                _.each(this.$el.find('.segment'), (function(div){
                    ids.push($(div).attr('id'));
                    offset.push(($(div).offset().left - _this.$el.offset().left) / _this.pixelRatio())
                }));
                this.collection.updatePositions(ids, offset);
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            },    

        });

        // Returns the View class
        return EditorView;

    }

);