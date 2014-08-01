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
                this.width = options.width || 100;
                this.height = options.height || 100;
                this.offset = options.offset;
                this.insertSorted = options.insertSorted || false
                //processed attributes
                this.posX = 0;
                this.div = null;
                this.next = null;
                this.prev = null;
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
                $(div).css('width', this.width);
                $(div).css('height', this.height);
                $(div).addClass('segment');
                if (this.leftOffset){
                    $(div).css('left', this.leftOffset);
                    this.posX = this.leftOffset - this.$el.offset().left;
                    this.segment.startPos = this.posX / this.pixelRatio;
                };
                var image = $(div).find('.image');
                this.segment.loadImage("front", function(image_data){
                    image.html(image_data); 
                    image.find('svg')[0].setAttribute("viewBox", "0 0 2000 1050");
                    image.find('svg')[0].setAttribute("width", "100%");
                    image.find('svg')[0].setAttribute("height", "100%");
                    image.find('svg')[0].setAttribute("preserveAspectRatio","xMidYMid slice");   
                });

                //"connect" the div with its segment
                $(div).attr('id', this.segment.id); 
                this.makeDraggable();
                if (!this.cloneable)
                    this.makeResizable();
                return this;

            },
            
            makeDraggable: function(){
                var _this = this;
                if (this.cloneable)
                    $(this.div).draggable({
                        helper: 'clone',
                        cursor: "move", 
                        cursorAt: { top: 0, left: 0 },
                        start: function (e, dragged) {    
                            var clone = $(dragged.helper);
                            clone.addClass('dragged');
                            //class is for css style only
                            //$(div).attr('id', this.segment.id); 
                            //addClass('segment')
                        } 
                    });
                else 
                     $(this.div).draggable({
                        cursor: "move", 
                        cursorAt: { top: 0, left: 0 },
                        drag: function (e, dragged) { 
                            var dragged = $(dragged.helper);
                            dragged.addClass('dragged');
                        },
                        
                        stop: function (e, dragged){
                            var dragged = $(dragged.helper);
                            dragged.removeClass('dragged');
                            _this.posX = dragged.offset().left - _this.$el.offset().left;
                            _this.segment.startPos = _this.posX / _this.pixelRatio;
                            _this.trigger("moved");
                        }
                    });
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
                                var space = _this.posX - (_this.prev.posX + _this.prev.width);                  
                            }   
                            //no segment infront? take the border of the editor
                            else {
                                var space = _this.posX; 
                            }
                            maxWidth = space + _this.width;                 
                        }
                        //max width for resizing to the right
                        else if ($(e.toElement).attr('id') === 'righthandle'){
                            //is there a segment to the right?
                            if (_this.next) {
                                var space = _this.next.posX - (_this.posX + _this.width);
                            }          
                            //no segment behind? take the border of the editor
                            else {
                                var space = parseInt(_this.$el.css('width'))-
                                        (_this.posX + _this.width); 
                            }  
                            maxWidth = space + _this.width;  
                        }
                        $(div).resizable( "option", "maxWidth", maxWidth );
                    },
                    stop: function(e, ui){  
                        _this.width = parseInt($(div).css('width'));
                        _this.posX = $(div).offset().left - _this.$el.offset().left;
                        console.log(maxWidth);
                        console.log(_this.width);
                        //make all other handles visible again (while hovering)
                        $('.ui-resizable-handle').css('visibility', 'visible');
                    }
                }); 
            }                        
               
        });

        // Returns the View class
        return SegmentView;

    }

);