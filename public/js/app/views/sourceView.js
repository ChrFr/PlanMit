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
                    segment.loadImage();
                    segment.on("image:loaded", function(){
                        $(div).attr('background-image', "200")});
                    console.log($('#resources'));
                    console.log(div);
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