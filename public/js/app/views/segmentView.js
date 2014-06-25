// SourceView.js
// -------
define(["jquery", "backbone", "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, shapeshift){

        var SourceView = Backbone.View.extend({

            // View constructor
            initialize: function(options) {
                this.parent = options.parent;
                this.segment = options.segment;
                this.width = options.width || 100;
                this.height = options.height || 100;
                this.render();

            },            

            // View Event Handlers
            events: {

            },
            
            // Renders the view's template to the UI
            render: function() {  
                if (this.parent && this.segment){
                    var _this = this;
                    var div = $(document.createElement('div'));
                    $(div).attr('data-ss-colspan', "100");
                    this.segment.loadImage("front", function(image_data){
                        $(div).html(image_data); 
                        $(div).width(_this.width);
                        $(div).height(_this.height);
                        $(div).find('svg')[0].setAttribute("viewBox", "0 0 2000 1050");
                        $(div).find('svg')[0].setAttribute("width", "100%");
                        $(div).find('svg')[0].setAttribute("height", "100%");
                        //$(div).find('svg')[0].setAttribute("preserveAspectRatio","none");
                        $(div).find('svg')[0].setAttribute("preserveAspectRatio","xMidYMid slice");
                    });
                    this.parent.append(div);
                    //"connect" the div with its segment
                    $(div).attr('id', this.segment.id);                                 
                }
                return this;

            },
               
        });

        // Returns the View class
        return SourceView;

    }

);