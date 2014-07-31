// SourceView.js
// -------
define(["jquery", "backbone", "text!templates/segment.html"],

    function($, Backbone, template){

        var SegmentView = Backbone.View.extend({

            // View constructor
            initialize: function(options) {
                this.cloneable = options.cloneable || false;
                this.segment = options.segment;
                this.left = options.left;
                this.width = options.width || 100;
                this.height = options.height || 100;
                this.offset = options.offset;
                this.div = null;
                this.insertSorted = options.insertSorted || false
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
                $(div).offset(this.offset);
                $(div).addClass('segment');
                if (this.left)
                    $(div).css('left', this.left);
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
                        }
                    });
            },
            
            makeResizable: function(){
                var _this = this;
                var div = this.div;
                $(div).resizable({
                    autoHide: true,
                    handles: {
                      'w': '#lefthandle',
                      'e': '#righthandle'
                    },
                    start: function(e, ui){
                        var maxWidth = 0;
                        //prevent showing the handles of neighbours while resizing
                        $('.ui-resizable-handle').css('visibility', 'hidden');
                        $(div).find('.ui-resizable-handle').css('visibility', 'visible');
                        //max width for resizing to the left
                        console.log(_this.$el.children())
                        if ($(e.toElement).attr('id') === 'lefthandle'){
                            var leftNeighbour = $(div).prev();
                            //is there a segment to the left?
                            if (leftNeighbour.length > 0) {
                                var space = $(div).offset().left - 
                                        (leftNeighbour.offset().left + 
                                        parseInt(leftNeighbour.css('width')));                  
                            }   
                            //no segment infront? take the border of the editor
                            else {
                                var space = $(div).offset().left - 
                                        _this.$el.offset().left; 
                            }
                            maxWidth = space + parseInt($(div).css('width'));                 
                        }
                        //max width for resizing to the right
                        else if ($(e.toElement).attr('id') === 'righthandle'){
                            var rightNeighbour = $(div).next();
                            //is there a segment to the left?
                            if (rightNeighbour.length > 0) {
                                var space = rightNeighbour.offset().left -
                                        ($(div).offset().left +
                                        parseInt($(div).css('width')));
                            }          
                            //no segment behind? take the border of the editor
                            else {
                                var space = (_this.$el.offset().left + 
                                        parseInt(_this.$el.css('width'))) -
                                        ($(div).offset().left +
                                        parseInt($(div).css('width'))); 
                            }  
                            maxWidth = space + parseInt($(div).css('width'));  
                        }
                        $(div).resizable( "option", "maxWidth", maxWidth );
                    },
                    stop: function(e, ui){  
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