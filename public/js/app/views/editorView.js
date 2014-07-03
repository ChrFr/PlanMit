// SourceView.js
// -------
define(["jquery", "backbone", "views/segmentView",
        "edittool/js/jquery.shapeshift.adapted"],

    function($, Backbone, SegmentView, shapeshift){

        var SourceView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".sink",

            // View constructor
            initialize: function(options) {
                this.resources = options.resources;                
                _.bindAll(this, 'registerShapeshift'); 
                this.setupProject();
                this.render();
            },            

            // View Event Handlers
            events: {

            },
            
            //add

            // Renders the view's template to the UI
            render: function() {   
                var _this = this;  
                           
                this.loadBorder($('#left_border'), 'left');
                this.loadBorder($('#right_border'), 'right');  
                
                if (this.collection.length === 0)
                    this.registerShapeshift();
                var shapeshift = _.after(this.collection.length, this.registerShapeshift);
                this.collection.each(function(segment){
                    var segmentView = new SegmentView({'parent': _this.$el,
                                                       'segment': segment,
                                                       'height': _this.$el.height(),
                                                       'width': segment.size
                                                      }); 
                    segmentView.render(shapeshift);
                });                
                
                var _this = this;                
                var txtarea = $("#log");
                this.$el.on('divAdded', function(event, div){
                    _this.addClone(div);    
                    txtarea.val(txtarea.val() + '\n' + div.id + " added");
                    $('#elementspx').val(_this.childrenTotalWidth());
                });
                this.$el.on('divRemoved', function(event, id){
                    _this.collection.removeID(id);
                    txtarea.val(txtarea.val() + '\n' + id + " removed");
                    $('#elementspx').val(_this.childrenTotalWidth());
                });
                this.$el.on('divResized', function(event, div){
                    _this.collection.resizeID($(div).attr('id'), parseInt($(div).css('width')));
                    txtarea.val(txtarea.val() + '\n' + div.id + " resized");
                    $('#elementspx').val(_this.childrenTotalWidth());
                });
                this.$el.on('divPositionChanged', function(event){
                    _this.updatePositions;
                    txtarea.val(txtarea.val() + '\n positions changed');
                    $('#elementspx').val(_this.childrenTotalWidth());
                });
                
                $('#streetpx').val(parseInt($('#edition').css('width')));
                return this;
            },
            
            registerShapeshift: function(){    
                this.$el.shapeshift({
                    colWidth: 1,
                    gutterX: 0,
                    minColumns: parseInt(this.$el.css('width')),
                    editTool: {
                        enabled: true
                    },
                    autoHeight: false,
                    align: "left",
                    paddingX: 0,
                    paddingY: 0,
                }); 
                
                
                $(".trash").shapeshift({
                  autoHeight: false,
                  colWidth: 1,
                  enableTrash: true
                });
            },
            
            setupProject: function(){   
                var id = this.collection.project_id;
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function(){
                    if (xmlhttp.readyState==4 && xmlhttp.status==200){
                        var projectDetails = JSON.parse(xmlhttp.responseText);
                        var width = projectDetails.width;
                        $('#streetm').val(width);
                    }
                };                
                xmlhttp.open("GET","db/projects/" + id, true);
                xmlhttp.send();
            },
            
            childrenTotalWidth: function(){
                var width = 0;
                _.each(this.$el.find('.ss-active-child'), (function(div){
                    width += parseInt($(div).css('width'));
                }));
                return width;
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            },            
            
            addClone: function(div){
                var id = $(div).attr('id');  
                var _this = this;
                this.resources.each(function(segment){
                    if (id === segment.id){
                        var clone = segment.clone();
                        _this.collection.addSegment(clone);
                        clone.setUniqueID();
                        return $(div).attr('id', clone.id);
                    }
                });
                this.updatePositions();
            },
                        
            updatePositions: function(){
                var ids = [];
                _.each(this.$el.find('.ss-active-child'), (function(div){
                    ids.push($(div).attr('id'));
                }));
                this.collection.updatePositions(ids);
                
                //check order of children of div here, set pos of models in collection by passing ids to collection
            },    
                    
            loadBorder: function(container, side){
                var imageID, aspectRatio;
                switch (side){
                    case "left": 
                        imageID = 1;
                        aspectRatio = "xMidYMax slice";
                        break;
                    case "right": 
                        imageID = 2;
                        aspectRatio = "xMidYMax slice";
                        break;
                    default: 
                        imageID = 1;
                        break;
                }
                    
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function(){
                    if (xmlhttp.readyState==4 && xmlhttp.status==200){
                        var image_data = JSON.parse(xmlhttp.responseText).img_svg;
                        container.html(image_data); 
                        container.attr('width', 100);
                        container.attr('height', 100);
                        container.find('svg')[0].setAttribute("viewBox", "0 0 750 1050");
                        container.find('svg')[0].setAttribute("width", "100%");
                        container.find('svg')[0].setAttribute("height", "100%");
                        container.find('svg')[0].setAttribute("preserveAspectRatio", aspectRatio);
                    }
                };                
                xmlhttp.open("GET","db/images/" + imageID, true);
                xmlhttp.send();
            }

        });

        // Returns the View class
        return SourceView;

    }

);