// SegmentView.js
// views a single segment as a 
// -------
define(["jquery", "backbone"],

    function($, Backbone){

        var SegmentView = Backbone.View.extend({

            // View constructor
            initialize: function(segment, parent) {
                
                this.parent = parent;
                this.segment = segment;

                // Calls the view's render method
                this.render();
      /*          
                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});
                
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);
                
                .container > div {
                    background: #AAA;
                    position: absolute;
                    height: 100px;
                    width: 100px;
                    //overflow: hidden;
                }
                
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
            
            // Renders the view's template to the UI
            render: function() {  
                var div = $(document.createElement("div"));
                console.log(div);
                //this.$parent.append(div);
                //this.parentDOM.append('<div>')
                // Maintains chainability
                return this;

            }

        });

        // Returns the View class
        return SegmentView;

    }

);