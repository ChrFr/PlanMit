// SegmentView.js
// -------
define(["jquery", "backbone", "text!templates/segment.html"],

    /**
    * A View on a single segment (SegmentModel). Renders ground and object Image into
    * a newly created div-container. Registers the div to jQuery UI, making it 
    * resizable and draggable. Translates and passes all manipulations to the segment.
    *
    * @param options.el           the tag of the parent DOM Element, the div-Container with the rendered segment will be appended to
    * @param options.left         the left position of the newly created div (in pixel), relative to the parent container (options.el), default: start position of segment * pixelRatio
    * @param options.segment      the SegmentModel, that will be rendered
    * @param options.images       an ImageCollection with the images of the segments
    * @param options.adminMode    boolean, is a user with extended rights logged in? (if not: fixed elements can't be moved)
    * @param options.pixelRatio   the pixel/cm ratio, default: 1
    * @param options.steps        the accuracy (in cm), the size and position will be saved in the segment
    * @param options.thumb        boolean, shall the image be rendered as a thumbnail? default: false
    * @param options.thumbSize    the size of the thumbnail (in pixel), default: 100
    * @param options.height       the height of the div-Container the segment will be rendered in (in pixel), default: thumbSize
    * @param options.width        the width of the div-Container the segment will be rendered in (in pixel), default: size of segment * pixelRatio
    * @param options.pngPreferred boolean, if true PNG graphics will be rendered, else SVG graphics will be rendered
    * @return                     the SegmentView class
    * @see                        a draggable and resizable segment with rendered object image, ground image and OSD
    */ 
    function($, Backbone, template){

        var SegmentView = Backbone.View.extend({

            // constructor
            initialize: function(options) {
                var _this = this;   
                this.thumb = options.thumb || false;
                this.thumbSize = options.thumbSize || 100;
                this.height = options.height || this.thumbSize;
                this.images = options.images;
                this.segment = options.segment;
                this.pixelRatio = options.pixelRatio || 1;
                this.adminMode = options.adminMode || false;
                this.pngPreferred = options.pngPreferred || false;  
                this.left = options.left || this.segment.startPos * this.pixelRatio;
                this.width = options.width || this.segment.size * this.pixelRatio;
                this.steps = options.steps || 1;         
                                              
                this.isConnector = (this.segment.get('type') === 1) ? true: false; 
                this.div = null;
                this.next = null;
                this.prev = null;
                
                //render the validation status, if it changes
                this.segment.on("change:status", function(){
                    _this.renderStatus()
                });
            },            

            // View Event Handlers
            events: {
		//no events in here, cause div and handles are created dynamic				
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
                //select segment, if clicked
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
            
            //renders the validation information of the segment
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
            
            //shows the error message, as a result of the validation
            showErrormessage: function(){
                var msg = this.segment.get('errorMsgs');
                alert(msg);
            },
            
            //renders an Onscreen Display with the resize and fixing controls
            //shows on hover or if clicked
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
            
            //sets the width (in pixel) of the SegmentModel, translates
            //into cm first
            setWidth: function(width){
                this.width = width;   
                var size = this.width / this.pixelRatio;
                //round to fit steps
                size = Math.round(size / this.steps) * this.steps;
                //cut wrong decimal places caused by float inaccuracy
                this.segment.size = parseInt(size);
            },
            
            //sets the left position (in pixel) of the SegmentModel, translates
            //into cm first
            setLeft: function(left){
                this.left = left;   
                var startPos = this.left / this.pixelRatio;
                //round to fit steps
                startPos = Math.round(startPos / this.steps) * this.steps;
                //cut wrong decimal places caused by float inaccuracy
                this.segment.startPos = parseFloat(startPos.toFixed(2))
            },
            
            //renders the images of ground and object
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
                //isConnector, render image of connecting element
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
                        
            //renders a thumbnail into the given div-container            
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
            
            //loads the image of the given imageModel into the given div
            //with the given pixelRatio
            //if options.stretch: the image is stretched to fit the div
            //if options.adjustHeight: the image is cut at the given options.maxHeight
            //if options.thumb: a thumbnail is rendered instead of big image
            loadImage: function(imageModel, div, pixelRatio, options){
                var options = options || {};
                var r = pixelRatio || 1;  
                //no image model-> break
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
            
            //register the div to jQuery UI, making it draggable
            makeDraggable: function(){
                var _this = this;
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
            
            //delete the view and its container
            delete: function(){                
                $(this.div).remove();
                this.trigger('delete');
            },
                        
            //register the div to jQuery UI, making it resizable
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

        return SegmentView;

    }

);