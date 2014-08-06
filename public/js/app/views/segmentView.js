// SourceView.js
// -------
define(["jquery", "backbone", "text!templates/segment.html"],

    function($, Backbone, template){

        var SegmentView = Backbone.View.extend({

            // View constructor
            initialize: function(options) {
                //options
                this.cloneable = options.cloneable || false;
                this.segment = options.segment;
                this.leftOffset = options.leftOffset;
                this.pixelRatio = options.pixelRatio || 1;
                this.height = options.height || 100;
                this.offset = options.offset;
                this.insertSorted = options.insertSorted || false;
                this.fixed = options.fixed || false;
                this.svgUnsupported = options.svgUnsupported || false;
                //processed attributes
                this.left = this.leftOffset - this.$el.offset().left;
                this.div = null;
                this.next = null;
                this.prev = null;
                this.width = null;
                //this.render();
            },            

            // View Event Handlers
            events: {

            },
                        
            // Renders the view's template to the UI
            render: function() {  
                if (!(this.segment)) return this;
                this.template = _.template(template, {}); 
                var div = document.createElement("div");   
                this.div = div;
                $(div).html(this.template);                    
                this.$el.append(div);                                             
                this.width = this.segment.size * this.pixelRatio
                $(div).css('width', this.width);         
                $(div).css('height', this.height);
                this.segment
                if (this.leftOffset){
                    $(div).css('left', this.leftOffset);
                    this.left = this.leftOffset - this.$el.offset().left;
                    this.segment.startPos = this.left / this.pixelRatio;
                };

                //give the div information about the segment it is viewing
                $(div).data('segmentID', this.segment.attributes.id); 
                $(div).data('segmentViewID', this.cid); 
                if (!this.fixed) {
                    $(div).addClass('segment');
                    this.makeDraggable();
                    if (!this.cloneable)
                       this.makeResizable();
                };
                
                if (this.cloneable)
                    this.renderThumbnail();
                else
                    this.renderImage();
                return this;

            },
            
            renderImage: function(){
                var imageContainer = $(this.div).find('#imageContainer');                 
                var objectImage = document.createElement("div"); 
                var groundImage = document.createElement("div");
                var attr = this.segment.attributes;
                var height = parseInt($(imageContainer).css('height'));                
                var width = parseInt($(imageContainer).css('height'));
                var groundHeight = height / 8;
                
                //render the ground on the bottom                
                $(groundImage).css('width', '100%');
                $(groundImage).addClass('image');
                $(groundImage).css('height', groundHeight);
                $(groundImage).css('bottom', 0);
                $(imageContainer).append(groundImage);      
                
                //image of the object on top of the ground
                $(objectImage).css('width', attr.base_size * this.pixelRatio);
                $(objectImage).addClass('image');
                $(objectImage).css('bottom', groundHeight);
                $(objectImage).css('left', '0');
                $(objectImage).css('right', '0');
                $(objectImage).css('margin', '0 auto');                
                $(imageContainer).append(objectImage);    
                
                this.loadImage(attr.image_id, objectImage, {adjustHeight: true});
                this.loadImage(attr.image_ground_id, groundImage, {stretch: true});
            },
            
            renderThumbnail: function(){
                var imageContainer = $(this.div).find('#imageContainer');  
                var attr = this.segment.attributes;
                this.loadImage(attr.image_id, imageContainer, {thumb: true});
                $(imageContainer).append(imageContainer);                      
            },
            
            loadImage: function(imageID, div, options){
                var options = options || {};
                if (!this.svgUnsupported){ 
                    this.segment.loadSvg(imageID, function(svg_data){
                        $(div).html(svg_data);
                        var svg = $(div).find('svg')[0]; 
                        var width = (options.stretch) ? parseInt($(div).css('width')): parseInt($(svg).css('width'));
                        var height = (options.stretch) ? parseInt($(div).css('height')): parseInt($(svg).css('height')); 
                        //set viewbox to if (as a precaution, if not set while
                        //creating image)
                        svg.setAttribute("viewBox", "0 0 " + width + " " + height); 
                        svg.setAttribute("width", "100%");      
                        if (options.adjustHeight){
                            var ratio = width / parseInt($(div).css('width'));
                            $(div).css("height", height / ratio);                     
                            svg.setAttribute("height", "100%");
                        };                                        
                        svg.setAttribute("height", "100%");
                        if (options.stretch || options.adjustHeight)
                            svg.setAttribute("preserveAspectRatio", 'none');
                        svg.setAttribute("position", "absolute");
                    });
                };
            },
                        
            makeDraggable: function(){
                var _this = this;
                var outside = true;
                var dragOriginDiv;  
                if (this.cloneable)
                    $(this.div).draggable({
                        helper: 'clone',
                        cursor: "move", 
                        cursorAt: { top: 0, left: 0 },
                        start: function (e, dragged) {    
                            var clone = $(dragged.helper);
                            clone.addClass('dragged');                            
                            clone.data('size', _this.segment.attributes.base_size); 
                        }, 
                    });
                else {
                    $(this.div).draggable({
                        cursor: "move", 
                        revertDuration: 200,
                        cursorAt: { 
                            top: parseInt($(_this.div).css('height'))/2, 
                            left: -20
                        },
                        start: function (e, dragged){
                            dragOriginDiv = dragged.helper.clone();
                            dragOriginDiv.addClass('dragOrigin');                            
                            _this.$el.append(dragOriginDiv);
                            //keep track if div is pulled in or out to delete
                            _this.$el.on("dropout", function(e, ui) {
                                outside = true;
                            });
                            _this.$el.on("drop", function(e, ui) {
                                outside = false;
                            });
                            var drag = $(dragged.helper);
                            drag.addClass('dragged');
                        },
                        
                        stop: function (e, dragged){
                            dragOriginDiv.remove();
                            var dragged = $(dragged.helper);
                            if (outside){
                                _this.delete();
                            }
                            else {
                                dragged.removeClass('dragged');
                                _this.left = dragged.offset().left - _this.$el.offset().left;
                                _this.segment.startPos = _this.left / _this.pixelRatio;
                                _this.trigger("moved");
                            };
                        }
                    });
                };
            },
            
            delete: function(){                
                this.div.remove();
                this.trigger('delete');
            },
            
            makeResizable: function(){
                var _this = this;
                var div = this.div;                
                var maxWidth = 0;
                $(div).resizable({
                    autoHide: true,
                    handles: {
                      'w': '#lefthandle',
                      'e': '#righthandle'
                    },
                    start: function(e, ui){
                        //prevent showing the handles of neighbours while resizing
                        $('.ui-resizable-handle').css('visibility', 'hidden');
                        $(div).find('.ui-resizable-handle').css('visibility', 'visible');
                        //max width for resizing to the left
                        if ($(e.toElement).attr('id') === 'lefthandle'){
                            //is there a segment to the left?
                            if (_this.prev) {
                                var space = _this.left - (_this.prev.left + _this.prev.width);                  
                            }   
                            //no segment infront? take the border of the editor
                            else {
                                var space = _this.left; 
                            }
                            maxWidth = space + _this.width;                 
                        }
                        //max width for resizing to the right
                        else if ($(e.toElement).attr('id') === 'righthandle'){
                            //is there a segment to the right?
                            if (_this.next) {
                                var space = _this.next.left - (_this.left + _this.width);
                            }          
                            //no segment behind? take the border of the editor
                            else {
                                var space = parseInt(_this.$el.css('width'))-
                                        (_this.left + _this.width); 
                            }  
                            maxWidth = space + _this.width;  
                        }
                        var minWidth = _this.segment.attributes.base_size *
                                _this.pixelRatio;
                        $(div).resizable( "option", "maxWidth", maxWidth );
                        $(div).resizable( "option", "minWidth", minWidth );
                    },
                    
                    resize: function(e, ui){   
                        _this.width = parseInt($(div).css('width'));
                        _this.left = $(div).offset().left - _this.$el.offset().left;                        
                        _this.segment.size = _this.width / _this.pixelRatio
                        _this.trigger('resized');
                    },
                    
                    stop: function(e, ui){  
                        //make all other handles visible again (while hovering)
                        $(div).find('.ui-resizable-handle').css('display', 'none');
                        $('.ui-resizable-handle').css('visibility', 'visible');
                    }
                }); 
            }                        
               
        });

        // Returns the View class
        return SegmentView;

    }

);