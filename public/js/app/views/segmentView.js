// SourceView.js
// -------
define(["jquery", "backbone"],

    function($, Backbone){

        var SegmentView = Backbone.View.extend({

            // View constructor
            initialize: function(options) {
                this.parent = options.parent;
                //this.target = options.target;
                this.cloneable = options.cloneable || false;
                this.segment = options.segment;
                this.left = options.left;
                this.width = options.width || 100;
                this.height = options.height || 100;
                this.offset = options.offset;
                this.div = null;
                //this.render();
            },            

            // View Event Handlers
            events: {

            },
            
            // Renders the view's template to the UI
            render: function() {  
                if (!(this.parent && this.segment)) return this;
                var div = $(document.createElement('div'));
                $(div).css('width', this.width);
                $(div).css('height', this.height);
                $(div).offset(this.offset);
                $(div).addClass('segment');
                if (this.left)
                    $(div).css('left', this.left);
                this.segment.loadImage("front", function(image_data){
                    $(div).html(image_data); 
                    $(div).find('svg')[0].setAttribute("viewBox", "0 0 2000 1050");
                    $(div).find('svg')[0].setAttribute("width", "100%");
                    $(div).find('svg')[0].setAttribute("height", "100%");
                    //$(div).find('svg')[0].setAttribute("preserveAspectRatio","none");
                    $(div).find('svg')[0].setAttribute("preserveAspectRatio","xMidYMid slice");                    
                });

                this.parent.append(div);
                //"connect" the div with its segment
                //this.segment.setUniqueID();
                $(div).attr('id', this.segment.id); 
                this.div = $(div);
                this.makeDraggable();
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
                        }
                    });
            },
               
        });

        // Returns the View class
        return SegmentView;

    }

);