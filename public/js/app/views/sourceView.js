// SourceView.js
// -------
define(["jquery", "backbone", "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, shapeshift){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".source",

            // View constructor
            initialize: function() {
                
                //this.parentDOM = $(parent || this.el);
                //this.resources = resources;

                //if collection changes, view will be rendered
                _.bindAll(this, "render");
                console.log(this.$el);
                this.collection.bind("reset", this.render);
                //console.log(this.collection);
                
                //this.render();
      /*          
                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});
                
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);
                
                $(".clones").shapeshift({
                    dragClone: true,
                    colWidth: 1,
                    gutterX: 0,
                    enableCrossDrop: false
                });
                $(".droparea").shapeshift({
                  colWidth: 1,
                  gutterX: 0,
                  minColumns: 800,
                  editTool: {
                      enabled: true
                  },
                  maxHeight: 200
                }); 
                $(".trash").shapeshift({
                  autoHeight: false,
                  colWidth: 1,
                  enableTrash: true
                });*/

            },            

            // View Event Handlers
            events: {

            },
            
            //add

            // Renders the view's template to the UI
            render: function() {                
                var parent = this.$el;
                _this = this;
                this.collection.each(function(segment){
                    var div = $(document.createElement('div'));
                    $(div).attr('data-ss-colspan', "100");
                    segment.loadImage("front", function(image_data){
                        $(div).html(image_data); 
                        $(div).attr('width', 100);
                        $(div).attr('height', 100);
                        $(div).find('svg')[0].setAttribute("viewBox", "0 0 1000 1000");
                        $(div).find('svg')[0].setAttribute("width", "100%");
                        $(div).find('svg')[0].setAttribute("height", "100%");
                        //$(div).find('svg')[0].setAttribute("preserveAspectRatio","none");
                        $(div).find('svg')[0].setAttribute("preserveAspectRatio","xMidYMax meet");
                    });
                    $('#resources').append(div);
                });
                $("#resources").shapeshift({
                    dragClone: true,
                    colWidth: 1,
                    gutterX: 0,
                    enableCrossDrop: false
                });
                // Maintains chainability
                //console.log(this.resources);
                return this;

            }

        });

        // Returns the View class
        return SourceView;

    }

);