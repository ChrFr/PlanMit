// SourceView.js
// -------
define(["jquery", "backbone", "text!templates/segment.html"],

    function($, Backbone, template){

        var SegmentView = Backbone.View.extend({

            // View constructor
            initialize: function(options) {
                var _this = this;
                //options                
                this.thumb = options.thumb || false;
                this.thumbSize = options.thumbSize || 100;
                this.height = options.height || this.thumbSize;
                this.images = options.images;
                this.segment = options.segment;
                this.pixelRatio = options.pixelRatio || 1;
                this.insertSorted = options.insertSorted || false;
                this.adminMode = options.adminMode || false;
                this.pngPreferred = options.pngPreferred || false;                
                this.isConnector = (this.segment.get('type') === 1) ? true: false; 
                //processed attributes
                this.left = options.left || this.segment.startPos * this.pixelRatio;
                this.div = null;
                this.next = null;
                this.prev = null;
                this.width = options.width || this.segment.size * this.pixelRatio;
                this.steps = options.steps || 1;                
                this.segment.on("change:status", function(){
                    _this.renderStatus()
                });
            },            

            // View Event Handlers
            events: {
				//no events in here, cause div is created dynamic				
            },
                        
            // Renders the view's template to the UI
            render: function() {                  
                if (this.div)
                    $(this.div).remove();
                if (!(this.segment)) return this;
                this.template = _.template(template, {}); 
                var div = document.createElement("div");   
                this.div = div;
                $(div).html(this.template);                    
                this.$el.append(div);                                             
                this.width = this.segment.size * this.pixelRatio
                $(div).css('width', this.width);         
                $(div).css('height', this.height);
                $(div).css('left', this.left);

                //give the div information about the segment it is viewing
                $(div).data('segmentID', this.segment.attributes.id); 
                $(div).data('segmentViewID', this.cid);
                $(div).data('isConnector', this.isConnector);                 
                //fix element or make it drag- and resizable
                if (this.segment.fixed && !this.adminMode)
                    $(div).addClass('fixed');
                else {
                    $(div).addClass('segment');
                    this.makeDraggable();
                    if (!this.thumb && !this.isConnector){
                       this.makeResizable();
                   }
                };
				
				$(div).click(function() {
					if ($(div).hasClass('selectedDiv'))
						$(div).removeClass('selectedDiv');
					else {	
						$(".selectedDiv").find(".OSD").hide()
						$(".selectedDiv").removeClass('selectedDiv');
						$(div).addClass('selectedDiv');
					}
				});
                
                if (this.thumb){
                    this.renderThumbnail();
                }
                else
                    this.renderImage();                
                this.OSD.render(this);
                this.renderStatus();
                return this;

            },
            
            renderStatus: function(){ 
                var status = this.segment.get('status');
                $(this.div).find('.statusIcon').hide();
                var warnIcon = $(this.div).find('#statusWarning');
                var okIcon = $(this.div).find('#statusOK');
                warnIcon.hide(); 
                if (status === 0) 
                    warnIcon.show();
                else if (status === 1) 
                    okIcon.show();
                var _this = this;
                warnIcon.unbind('click');
                warnIcon.click(function(){
                    _this.showErrormessage();
                });
            },
            
            showErrormessage: function(){
                var msg = this.segment.get('errorMsgs');
                alert(msg);
            },
            
            OSD: {
                view: null,
        
                render: function(view){
                    this.view = view;
					var osdDiv = $(view.div).find('.OSD');
					//could be moved to css, but gets complicated there
					//because of many cases
                    if (view.thumb || view.isConnector)
                        osdDiv.hide();
                    else
                        $(view.div).hover(
                            function() {
                                osdDiv.show(); 
                            }, 
                            function() {
								if (!$(view.div).hasClass("selectedDiv"))
									osdDiv.hide();
                        });
                        
                    //toggle lock on segments 
                    if (view.segment.fixed){
                        $(view.div).find('#lockedIcon').show();
                        if (!view.adminMode){                        
                            $(view.div).find('#lefthandle').hide();                    
                            $(view.div).find('#righthandle').hide();
                        };
                    }
                    else{  
                        $(view.div).find('#unlockedIcon').show();
                    };
                    //locked clicked -> unlock
                    $(view.div).find('#lockedIcon').click(function(){ 
                        if (view.adminMode){
                            view.segment.fixed = false;     
                            //just telling the measure display to redraw
                            view.trigger('update');
                        }                        
                        //enable resizing and dragging in editing mode
                        else if (!view.segment.fixed){
                            $(view.div).find('#lefthandle').show();                    
                            $(view.div).find('#righthandle').show();
                            $(view.div).draggable({ disabled: false });                            
                        }
                        if (!view.segment.fixed){
                            $(view.div).find('#lockedIcon').hide();
                            $(view.div).find('#unlockedIcon').show(); 
                        }                        
                    });              
                    //unlocked click -> lock
                    $(view.div).find('#unlockedIcon').click(function(){
                        $(view.div).find('#unlockedIcon').hide();
                        $(view.div).find('#lockedIcon').show();
                        //toggle fixed status of segment in creation mode
                        if (view.adminMode){
                            view.segment.fixed = true;        
                            //just telling the measure display to redraw 
                            //no actual resize done 
                            view.trigger('update');    
                        }
                        //disable resizing and dragging in editing mode
                        else{
                            $(view.div).draggable({ disabled: true });
                            $(view.div).find('#lefthandle').hide();                    
                            $(view.div).find('#righthandle').hide();
                        };
                        
                    });
                },    
            },
            
            setWidth: function(width){
                this.width = width;   
                var size = this.width / this.pixelRatio;
                //round to fit steps
                size = Math.round(size / this.steps) * this.steps;
                //cut wrong decimal places caused by float inaccuracy
                this.segment.size = parseInt(size);
            },
            
            setLeft: function(left){
                this.left = left;   
                var startPos = this.left / this.pixelRatio;
                //round to fit steps
                startPos = Math.round(startPos / this.steps) * this.steps;
                //cut wrong decimal places caused by float inaccuracy
                this.segment.startPos = parseFloat(startPos.toFixed(2))
            },
            
            renderImage: function(){                
                $(this.div).removeClass('thumb');  
                var imageContainer = $(this.div).find('#imageContainer');                 
                var objectImage = document.createElement("div"); 
                var groundImage = document.createElement("div");
                var attr = this.segment.attributes;
                var height = parseInt($(imageContainer).css('height')); 
                var groundHeight = height / 5;
                
                if (!this.isConnector){
                    //render the ground on the bottom                
                    $(groundImage).css('width', '100%');
                    $(groundImage).addClass('image');
                    $(groundImage).css('height', groundHeight);
                    $(groundImage).css('bottom', 0);
                    $(imageContainer).append(groundImage);      
                    //image of the object on top of the ground
                    $(objectImage).css('width', '100%');
                    $(objectImage).addClass('image');
                    $(objectImage).css('bottom', groundHeight);
                    $(objectImage).css('left', '0');
                    $(objectImage).css('right', '0');
                    $(objectImage).css('margin', '0 auto');  
                    $(imageContainer).append(objectImage);  
                    var groundModel = this.images.get(attr.image_ground_id);
                    var imageModel = this.images.get(attr.image_id);
                    if(imageModel)
                        this.loadImage(imageModel, objectImage, this.pixelRatio,
                            {adjustHeight: true, maxHeight: height - groundHeight});
                    this.loadImage(groundModel, groundImage, 
                        this.pixelRatio, {stretch: true});
                    
                    $(imageContainer).zIndex(1);
                }
                else {                                 
                    $(objectImage).css('width', '100%');
                    $(objectImage).addClass('image');
                    $(objectImage).css('height', groundHeight);
                    $(objectImage).css('bottom', 0);
                    $(imageContainer).append(objectImage); 
                    var imageModel = this.images.get(attr.image_id);
                    this.loadImage(imageModel, objectImage, this.pixelRatio,
                    {stretch: true});
                    $(imageContainer).zIndex(9000);
                }               
            },
                        
            renderThumbnail: function(div){
                if (!div)
                    div = this.div;
                $(div).addClass('thumb');                    
                $(div).css('width', this.thumbSize);               
                $(div).css('height', this.thumbSize);        
                var imageContainer = $(div).find('#imageContainer');    
                $(div).children().not(imageContainer).remove();
                imageContainer.empty();
                var objectImage = document.createElement("div"); 
                var groundImage = document.createElement("div");
                var height = parseInt($(imageContainer).css('height')); 
                var width = parseInt($(imageContainer).css('width')); 
                var attr = this.segment.attributes;
                var groundModel = this.images.get(attr.image_ground_id);
                if (attr.connector){
                    //render the ground on the bottom  
                    $(groundImage).css('width', width);           
                    $(groundImage).css('height', height);
                    $(groundImage).addClass('image');                    
                    $(imageContainer).append(groundImage);  
                        this.loadImage(groundModel, groundImage);    
                }                
                //image of the object on top of the ground
                $(objectImage).css('width', width);           
                $(objectImage).css('height', height);
                $(objectImage).addClass('image');
                $(imageContainer).append(objectImage);  
                var imageModel = this.images.get(attr.image_id) || groundModel; 
                this.loadImage(imageModel, objectImage, null, {thumb: true});
                $(imageContainer).append(imageContainer);                      
            },
            
            loadImage: function(imageModel, div, pixelRatio, options){
                var options = options || {};
                var r = pixelRatio || 1;  
                if (!imageModel) return;
                if (!this.pngPreferred){
                    imageModel.getImage('svg', function(svg_data, actual_size){  
                        if (actual_size && !options.thumb)
                            $(div).css('width', actual_size * r);
                        $(div).html(svg_data);
                        var svg = $(div).find('svg')[0]; 
                        var divWidth = parseInt($(div).css('width'));
                        var divHeight = parseInt($(div).css('height'));
                        var svgWidth = parseInt($(svg).css('width'));
                        var svgHeight = parseInt($(svg).css('height'));
                        var width = (options.stretch) ? divWidth: svgWidth;
                        var height = (options.stretch) ? divHeight: svgHeight; 
                        //set viewbox to if (as a precaution, if not set while
                        //creating image)
                        svg.setAttribute("viewBox", "0 0 " + width + " " + height); 
                        svg.setAttribute("width", "100%");                                                                                                            
                            svg.setAttribute("height", "100%"); 
                        if (options.adjustHeight){
                            var ratio = width / divWidth;
                            var maxHeight = options.maxHeight;
                            if (maxHeight && divHeight > maxHeight){
                                $(div).css("height", maxHeight);
                                //svg.setAttribute("width", divWidth);
                                svg.setAttribute("height", maxHeight);                                 
                                svg.setAttribute("viewBox", "0 " + (height - maxHeight) + " " + width + " " + options.maxHeight); 
                                svg.setAttribute("preserveAspectRatio", 'xMidYMax');
                            }
                            else{                                                                                              
                                svg.setAttribute("height", "100%");   
                                $(div).css("height", height / ratio);
                            }
                            var parentWidth = parseInt($(div).parent().css('width'))
                            if (divWidth > parentWidth){
                                $(div).css("left", -(divWidth - parentWidth / 2));
                                $(div).css("right", -(divWidth - parentWidth / 2));
                            }   
                        };
                        if (options.stretch)
                            svg.setAttribute("preserveAspectRatio", 'xMinYMax');                             
                    });
                }
                //png preferred
                else {    
                    if (options.thumb)   
                        //WARNING getImage('thumb') THIS DOESN'T WORK RIGHT !!!!!!! 
                        imageModel.getImage('png', function(png_data, actual_size){ 
                            if (actual_size && !options.thumb)
                                $(div).css('width', actual_size * r); 
                            var maxHeight = options.maxHeight;                        
                            $(div).css("height", maxHeight);          
                            $(div).css("background","url('data:image/png;base64,"+ png_data.img_png +"') bottom center no-repeat"); 
                            $(div).css("background-size", "auto 100%"); 
                        });
                    else
                        imageModel.getImage('png', function(png_data, actual_size){ 
                            if (actual_size && !options.thumb)
                                $(div).css('width', actual_size * r); 
                            var maxHeight = options.maxHeight;                        
                            $(div).css("height", maxHeight);          
                            $(div).css("background","url('data:image/png;base64,"+ png_data.img_png +"') bottom center no-repeat"); 
                            $(div).css("background-size","100% auto");                            
                        });
                }                                
            },
                        
            makeDraggable: function(){
                var _this = this;
                var outside = true;
                if (this.thumb)
                    $(this.div).draggable({
                        helper: 'clone',
                        cursor: "move", 
                        appendTo: 'body',
                        containment: 'body',
                        scroll: false,
                        cursorAt: { top: 20, left: 20 },
                        start: function (e, ui) {    
                            var clone = $(ui.helper);
                            clone.addClass('dragged'); 
                            $(this).draggable("option", "cursorAt", {
                                left: Math.floor(clone.width() / 2),
                                top: Math.floor(clone.height() / 2)
                            });   
                            clone.data('size', _this.segment.attributes.min_width); 
                            clone.data('isConnector', _this.isConnector); 
                        }, 
                    });
                else {
                    $(this.div).draggable({
                        helper: 'clone',
                        cursor: "move", 
                        revertDuration: 200, 
                        appendTo: 'body',
                        //containment: 'body',
                        scroll: false,
                        cursorAt: { top: 20, left: 20 },
                        start: function (e, ui){
                            $(this).addClass('dragOrigin'); 
                            var drag = $(ui.helper);
                            drag.addClass('dragged');
                            _this.renderThumbnail(drag);  
                            $(this).draggable("option", "cursorAt", {
                                left: Math.floor(drag.width() / 2),
                                top: Math.floor(drag.height() / 2)
                            }); 
                            drag.data('segmentViewID', _this.cid); 
                            drag.data('size', _this.segment.size); 
                            drag.data('isConnector', _this.isConnector); 
                        },
                        
                        stop: function (e, ui){
                            var dragged = $(ui.helper);
                            if (dragged.hasClass('out')){
                                _this.delete();
                            }
                            else {
                                dragged.removeClass('dragged');                                
                                $(this).removeClass('dragOrigin');     
                            };    
                        }
                    });
                };
            },
            
            delete: function(){                
                $(this.div).remove();
                this.trigger('delete');
            },
            
            makeResizable: function(){
                var _this = this;
                var div = this.div;                
                var maxWidth = 0;
                var startRight = 0;
                var startLeft = 0;
                var prevLeft = 0;
                var space = 0;
                var snapTolerance = 10;
                $(div).resizable({
                    grid: Math.round(_this.steps * _this.pixelRatio),
                    handles: {
                      'w': '#lefthandle',
                      'e': '#righthandle'
                    },
                    start: function(e, ui){
                        //prevent showing the OSD of neighbours while resizing
                        $('.OSD').css('visibility', 'hidden');
                        $(div).find('.OSD').css('visibility', 'visible');
                        //max width for resizing to the left
                        startLeft = _this.left;
                        startRight = startLeft + _this.width;
                        var dir = e.toElement ? e.toElement : e.originalEvent.target;
                        if ($(dir).attr('id') === 'lefthandle'){
                            //connectors are ignored
                            var prev = (_this.prev && _this.prev.isConnector) ? _this.prev.prev: _this.prev;
                            //no segment infront? take the left border of the editor (=0)
                            prevLeft = (prev)? prevLeft = (prev.left + prev.width): 0;
                            space = startLeft - prevLeft;       
                            maxWidth = space + _this.width;                 
                        }
                        //max width for resizing to the right
                        else if ($(dir).attr('id') === 'righthandle'){
                            var next = (_this.next && _this.next.isConnector) ? _this.next.next: _this.next;
                            //is there a segment to the right?
                            if (next) {
                                space = next.left - startRight;
                            }          
                            //no segment behind? take the right border of the editor
                            else {
                                space = parseInt(_this.$el.css('width'))-
                                        startRight; 
                            }  
                            maxWidth = space + _this.width;  
                        };
                        var minWidth = _this.segment.attributes.min_width *
                            _this.pixelRatio;
                        //console.log(maxWidth)
                        $(div).resizable( "option", "maxWidth", maxWidth );
                        $(div).resizable( "option", "minWidth", minWidth );
                    },
                    
                    resize: function(e, ui){        
                        var width = parseInt($(div).css('width'));                         
                        var left = parseInt($(div).css('left'));
                        //snap to neighbour
                        if (maxWidth - width < snapTolerance) {  
                            if ($(div).data('ui-resizable').axis === 'w'){
                                left = prevLeft;                           
                                $(div).css('left', prevLeft);
                            };
                            width = maxWidth;
                            $(div).css('width', width); 
                        }
                            
                        _this.setWidth(width);
                        _this.setLeft(left);                    
                        _this.trigger("resized");
                    },
                    
                    stop: function(e, ui){  
                        //make all other OSDs visible again on hover
                        $('.OSD').css('visibility', 'visible');
                        _this.trigger('update');
                    }
                }); 
            }                        
               
        });

        // Returns the View class
        return SegmentView;

    }

);