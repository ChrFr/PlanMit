// EditMainView.js
// -------
define(["jquery", "backbone", "text!templates/editMain.html", 
    "views/SourceView", "views/EditorView", "collections/SegmentCollection"],

    function($, Backbone, template, SourceView,
             EditorView, SegmentCollection){
                 
        /**
        * A View on the Editor and the Resources
        *
        * @param options.el       the tag of the DOM Element, the view will be rendered in
        * @param options.session  a LoginModel with the current login status 
        * @param options.images   an ImageCollection with the images of the segments
        * @param options.edition  a SegmentCollection containing the street profile currently worked on
        * @return                 the EditMainView class
        * @see                    the editor and resources
        */         
        var EditMainView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: "#mainFrame",

            // constructor
            initialize: function(options) {  
                var _this = this;
                $(this.$el).appendTo('body');
                var options = options || {};
                this.edition = options.edition;
                this.images = options.images;     
                this.editorView = null;
                this.session = options.session;  
                var user = this.session.get('user');   
                this.adminMode = (user && user.superuser);                
                if (this.adminMode)
                    this.resources = new SegmentCollection({isSource: true, showAll: true});
                else
                    this.resources = new SegmentCollection({isSource: true});
                // Calls the view's render method
                this.render(); 
                
                var delay = (function(){
                    var timer = 0;
                    return function(callback, ms){
                        clearTimeout (timer);
                        timer = setTimeout(callback, ms);
                    };
                })();
                
                //listen to resize event of the window and rerender, if resized
                $(window).resize(function(e) {  
                    if (e.target === this)
                        delay(function(){
                            if (_this.resourcesView){
                                _this.resourcesView.unbind();
                                _this.resourcesView.remove();
                            };                            
                            if (_this.editorView){
                                _this.editorView.unbind();
                                _this.editorView.remove();
                            };
                            _this.render();
                        }, 500);
                });

            },

            events: {

            },

            // Renders the view's template to the UI
            render: function() {                      
                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);       
                this.resourcesView = new SourceView({collection: this.resources,
                                                     el: '#resources',
                                                     images: this.images});
                var sourceHeight = parseInt($(this.resourcesView.el).css('height'));
                this.editorView = new EditorView({collection: this.edition,
                                                  el: '#editor',
                                                  resources: this.resources,
                                                  adminMode: this.adminMode,
                                                  wrapper: "#editorWrapper",
                                                  images: this.images,
                                                  thumbSize: sourceHeight});
                       
                var _this = this;
                
                //bind the buttons of the context menu
                $('#uploadButton').unbind('click');
                $('#uploadButton').click(function() {
                    var btn = $(this)
                    btn.prop('disabled',true);
                    setTimeout(function(){ 
                        btn.prop('disabled',false);
                    },2000);                     
                    var user = _this.session.get('user');
                    if (!user)
                        alert('Sie können nichts hochladen, da Sie nicht eingeloggt sind!')
                    else if (user.superuser)
                        _this.edition.updateProject();
                    else
                        _this.edition.updateUserTemplate();
                });
                $('#resetButton').unbind('click');
                $('#resetButton').click(function() { 
                    var btn = $(this)
                    btn.prop('disabled',true);
                    setTimeout(function(){ 
                        btn.prop('disabled',false);
                    },2000);      
                    _this.editorView.resetToDefault();
                });
                // Maintains chainability
                return this;
            },       
                        
            //remove the view
            close: function () {
                this.editorView.close(); 
                this.resourcesView.close();
                this.unbind();
                this.remove();
            }

        });

        return EditMainView;
    }
);