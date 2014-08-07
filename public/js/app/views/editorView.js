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
                this.creationMode = options.creationMode || false;
                this.fixElements = !this.creationMode;   
                this.streetSize = options.startSize || this.collection.getStreetSize() || 10;
                var _this = this;
                _.bindAll(this, 'render', 'loadEdition');                 
                this.collection.bind("reset", function(){                                 
                    _this.streetSize = options.startSize || this.getStreetSize() || 10;
                    console.log(_this.streetSize);
                    _this.render();
                    
                });  
                
                 //only fetch the edition from db (incl. overwrite), 
                //if no models are overwritten (meaning it is not already load)
                if (this.collection.length === 0){
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
                this.measure = new this.MeasureDisplay(canvas, this.$el, this.creationMode);
                this.streetView = new this.StreetView(this.$el, this.collection, this.measure);
                this.placeholder = new this.Placeholder(this.streetView, this.$el);
                this.streetView.changeScale(this.pixelRatio());
                
                if (this.creationMode){
                    var _this = this;
                    $('#scaleSlider').slider({
                        value: _this.streetSize,
                        range: 1,
                        min: 10,
                        max: 100,
                        animate: true,
                        slide: function (e, ui) {
                            $( "#scale" ).val( ui.value );
                        },
                        change: function(e, ui){                            
                            _this.streetSize = ui.value;
                            _this.streetView.changeScale(_this.pixelRatio());
                        }
                    });
                    $("#scale").val($('#scaleSlider').slider( "value" ));
                }
                this.makeDroppable();
                if (this.collection.length > 0)
                    this.loadEdition(); 
               
                return this;
            },
            
            makeDroppable: function(){
                var _this = this;
                this.$el.droppable({
                    tolerance: "intersect",
                    cursor: 'auto',
                    over: function(e, dragged) {
                        var clone = $(dragged.helper);  
                        var width = clone.data('size') * _this.pixelRatio();
                        clone.animate({height: _this.$el.css('height'),
                                       width: width}, 250);                                      
                        _this.placeholder.setActive(true, clone, width);
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
                            if (placeholder.droppable){
                                var segment = _this.resources.getSegmentByID(draggedDiv.data('segmentID')); 
                                var clonedSegment = segment.clone();
                                clonedSegment.size = dropped.helper.data('size');
                                var segmentView = new SegmentView({'el': _this.el,
                                                                   'segment': clonedSegment,
                                                                   'left': placeholder.left,
                                                                   'height': parseInt(placeholder.div.css('height')),
                                                                   'pixelRatio': _this.pixelRatio()});
                                segmentView.render();
                                _this.collection.addSegment(clonedSegment);
                                _this.streetView.insert(segmentView);
                            };                            
                            dropped.helper.remove();
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
                        clone.animate({height: dragged.draggable.css('width')}, 100);
                        _this.placeholder.setActive(false);
                    }
                });
            },
            
            StreetView: function(parent, collection, measureDisplay){
                this.parent = parent;
                this.collection = collection;
                this.first = null;
                this.length = 0;
                this.measureDisplay = measureDisplay;                
                this.pixelRatio = 1;
                
                this.changeScale = function(pixelRatio){
                    var changeRatio = pixelRatio / this.pixelRatio;
                    this.pixelRatio = pixelRatio;
                    var segmentView = this.first;
                    while (segmentView) {
                        var left = segmentView.left * changeRatio;
                        var width = segmentView.width * changeRatio;
                        segmentView.pixelRatio = pixelRatio;
                        segmentView.setLeft(left);
                        segmentView.setWidth(width);
                        segmentView.render();
                        segmentView = segmentView.next;
                    };
                    this.measureDisplay.draw(this);
                };
                
                this.at = function(pos){
                    var found = null;
                    var segmentView = this.first;
                    var i = 0;
                    while (segmentView) {
                        if (i === pos) {
                            found = segmentView;
                            break;
                        };
                        segmentView = segmentView.next;
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
                    var divID = div.data('segmentViewID');
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
                        //ignore segmentView currently dragged
                        if (divID && segmentView.cid === divID){
                            segmentView = segmentView.next;
                            continue;
                        }
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
                        if (left >= segRight && left < nextLeft){
                            //enough room for the div?
                            if (right <= nextLeft){  
                                gap.fits = true;
                            }
                            gap.left = left - segRight;
                            gap.right = nextLeft - right;
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
                    
                    var _this = this;
                    segmentView.on("moved", function(){                            
                        _this.relocate(this);
                    });
                    segmentView.on("resized", function(){
                        _this.measureDisplay.draw(_this);
                    });
                    segmentView.on("delete", function(){  
                        _this.remove(this, true);
                    });
                    segmentView.pixelRatio = this.pixelRatio;
                    this.length++;
                    this.measureDisplay.draw(this);
                };

                this.remove = function(segmentView, doDelete){
                    //bend pointers                    
                    segmentView.off("moved");
                    segmentView.off("delete");
                    segmentView.off("resized");
                    var prev = segmentView.prev;
                    var next = segmentView.next;
                    if (prev){
                        prev.next = (next) ? next: null;
                    };
                    if (next){
                        next.prev = (prev) ? prev: null;
                    };
                    if (!prev){
                        this.first = next;
                    };                            
                    segmentView.prev = null;
                    segmentView.next = null;
                    this.length--;
                    this.measureDisplay.draw(this);
                    //ToDo: remove view, segmentView.remove() removes the whole 
                    //editor (most likely because the parent el is the editor)
                    if (doDelete)
                        this.collection.remove(segmentView.segment);
                };

                this.clear = function(){
                    var segmentView = this.first;
                    while(segmentView){ 
                        segmentView.off("delete");                          
                        segmentView.delete();
                        segmentView = segmentView.next;
                    };
                    this.first = null;
                    this.measureDisplay.draw(this);
                };

                //replace a single view to maintain sort order
                this.relocate = function(segmentView){
                    this.remove(segmentView);
                    this.insert(segmentView);  
                    this.measureDisplay.draw(this);                      
                };
                
            },
            
            MeasureDisplay: function(canvas, parent, showRaster){
                this.canvas = canvas;
                this.parent = parent;
                this.marginTop = 30;
                this.marginBottom = 50;
                this.gapTolerance = 2;
                this.showRaster = showRaster || false;
                
                /*
                 * adapt canvas to current parent
                 */
                this.resize = function(){
                    var width = parseInt(this.parent.css('width'));
                    var height = parseInt(this.parent.css('height')) +
                                 this.marginTop + 
                                 this.marginBottom;
                    $(this.canvas).css('top', this.parent.offset().top -
                                        this.marginTop);
                    $(this.canvas).css('width', width);
                    $(this.canvas).css('height', height);  
                    this.canvas.width = width;
                    this.canvas.height = height;
                };
                
                this.draw = function(streetView){  
                    this.drawScalingLine(streetView);
                    this.drawInfoLine(streetView);
                };
                
                this.drawScalingLine = function(streetView){
                    var ratio = streetView.pixelRatio;
                    var ctx = this.canvas.getContext("2d");
                    var w = (this.showRaster) ? this.canvas.height - this.marginBottom : this.marginTop;
                    //clear upper area
                    ctx.clearRect(0, 0, this.canvas.width, w);
                    var firstSegment = streetView.at(0);
                    var lastSegment = streetView.at(streetView.length - 1);
                    var streetStartX = (firstSegment && firstSegment.segment.fixed) ? 
                        firstSegment.left + firstSegment.width: 0; 
                    var streetEndX = (lastSegment && lastSegment.segment.fixed) ?
                        lastSegment.left: this.canvas.width;  
                    //draw the measure line between first and last element
                    /*
                    if (firstSegment) 
                        streetStartX = (firstSegment.segment.fixed) ? 
                            firstSegment.left + firstSegment.width: 
                                    firstSegment.left;                    
                    if (lastSegment)
                        streetEndX = (lastSegment.fixed) ? lastSegment.left: 
                            lastSegment.left + lastSegment.width; 
                            */
                    var width = streetEndX - streetStartX;
                    var size = width / ratio;                        
                    var middle = width / 2 + streetStartX;
                    var y = 12.5;
                    ctx.strokeStyle = 'grey';
                    ctx.setLineDash([0]);
                    //horizontal line
                    ctx.beginPath();
                    ctx.moveTo(streetStartX, y);
                    ctx.lineTo(streetEndX, y); 
                    ctx.lineWidth = 1;
                    ctx.stroke();  

                    //vertical lines and raster                            
                    ctx.font = "8px Arial";                            
                    ctx.fillStyle = 'grey';
                    ctx.textAlign = 'left';
                    var step = ratio / 10;
                    var i = 0;
                    //draw a small line every meter
                    for(var x = streetStartX; x <= streetEndX; x += step){ 
                        var length = 4;
                        var bigStep = (i % 10 === 0) ? true: false;
                        ctx.beginPath();     
                        ctx.strokeStyle = 'grey';
                        ctx.setLineDash([0]);
                        if (bigStep){
                            length = 8;    
                            ctx.fillText((i * step / ratio).toFixed(0), x, y + 13);
                        }
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, y + length); 
                        ctx.stroke();
                        if (this.showRaster) {
                            ctx.beginPath();  
                            if (bigStep){
                                ctx.setLineDash([1,2]);
                            }
                            else {
                                ctx.setLineDash([1,4]);
                                ctx.strokeStyle = 'lightgrey';
                            }
                            ctx.moveTo(x, y);
                            ctx.lineTo(x, this.canvas.height - this.marginBottom); 
                            ctx.stroke();
                        }
                        i++;
                    }; 

                    //small rectangle with display of street size
                    ctx.font = "12px Arial";
                    ctx.fillStyle = 'grey';
                    ctx.textAlign = 'center';
                    ctx.fillText(size.toFixed(2) + ' m', middle, y - 2);
                };
                
                this.drawInfoLine = function(streetView){  
                    var ratio = streetView.pixelRatio;  
                    var originY = this.canvas.height - this.marginBottom;
                    var ctx = this.canvas.getContext("2d");
                    //clear lower area
                    ctx.clearRect(0, originY, 
                                  this.canvas.width, this.marginBottom);
                    var segmentView = {left: 0,
                                       width: 0,
                                       next: streetView.first};
                    while(segmentView){
                        var y = originY + this.marginBottom - 30.5;                        
                        ctx.lineWidth = 1;                        
                        ctx.font = "bold 12px Arial";
                        ctx.strokeStyle = 'black';
                        
                        //horizontal line
                        ctx.beginPath();
                        var segRight = segmentView.left + segmentView.width;
                        ctx.setLineDash([5]);
                        ctx.moveTo(segmentView.left, y);
                        ctx.lineTo(segRight, y); 
                        ctx.stroke();    
                                                
                        //vertical lines
                        ctx.beginPath();
                        ctx.setLineDash([1,2]);
                        ctx.moveTo(segmentView.left, y);
                        ctx.lineTo(segmentView.left, originY); 
                        ctx.moveTo(segRight, y);
                        ctx.lineTo(segRight, originY); 
                        ctx.stroke();                            
                        
                        if (segmentView.width > 0){
                            //small rectangle with display of segmentsize inside
                            //in middle of horizontal line
                            ctx.beginPath();
                            var middle = segmentView.left + segmentView.width / 2;
                            ctx.rect(middle - 25 , y - 10, 50, 20);
                            ctx.fillStyle = 'white';
                            ctx.fill();
                            ctx.setLineDash([0]);
                            ctx.stroke();
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            var size = (segmentView.segment.size) ? segmentView.segment.size.toFixed(2)  + ' m': '-'
                            ctx.fillText(size , middle, y + 3);
                        }
                        
                        var next = segmentView.next
                        //visualize gaps between segments
                        var nextLeft = (next) ? next.left: parseInt(this.parent.css('width'));
                        var gap = nextLeft - segRight;
                        if (gap > this.gapTolerance){     
                            var middle = segRight + gap / 2;
                            ctx.beginPath();
                            ctx.setLineDash([1, 2]);
                            ctx.strokeStyle = 'grey';
                            ctx.moveTo(segRight, y - 10);
                            ctx.lineTo(nextLeft, y - 10); 
                            ctx.moveTo(middle, y - 10);
                            ctx.lineTo(middle, y + 5); 
                            
                            ctx.rect(middle - 25 , y + 5, 50, 20);
                            ctx.fillStyle = 'white';
                            ctx.fill();
                            ctx.stroke();
                            ctx.fillStyle = 'grey';
                            ctx.textAlign = 'center';
                            ctx.fillText(
                                    (gap / ratio).toFixed(2) + ' m', 
                                    middle, y + 18);
                        };
                        segmentView = next;
                    };              
                };
                                
                this.resize();
            },
                
            Placeholder: function(streetView, parent){
                this.parent = parent;
                this.streetView = streetView;
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
                        var gap = this.streetView.doesFit(this.div);
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
                            $(this.div).removeClass('blocked');
                        };                        
                        //take shortest distance to next segment
                        var snap = (gap.left < gap.right) ? -gap.left: gap.right;
                        //shift the placeholder, if distance is shorter 
                        //than the defined snap tolerance
                        if (Math.abs(snap) < this.snapTolerance){
                            this.left += snap;
                            $(this.div).css('left', this.left);
                        };
                    }
                };

                this.setActive = function(active, clone, width){
                    this.active = active;
                    //remove placeholder if deactivated
                    if (!active)
                        $(this.div).remove();
                    //create placeholder on position of given div with offset
                    else if (clone){
                        //update the positions of the other divs
                        this.cid = clone.data('segmentViewID');
                        var left = clone.position().left;
                        var width = (width) ? width: clone.css('width');
                        this.div = $(document.createElement('div'));
                        $(this.div).css('width', width);
                        $(this.div).css('height', parent.css('height'));
                        $(this.div).addClass('placeholder');
                        $(this.div).data('segmentViewID', this.cid);
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
                 this.streetView.clear();
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
                                                      'height': height,
                                                      'fixed': fixed,
                                                      'pixelRatio': _this.pixelRatio()});
                    segmentView.render();
                    _this.streetView.insert(segmentView);
                });
            },
            
            pixelRatio: function(){
                return parseInt($(this.$el[0]).css('width')) / 
                    this.streetSize;
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