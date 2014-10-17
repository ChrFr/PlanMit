// editView.js
// edit Window containing view on resources and the editor
// -------
define(["jquery", "backbone", "text!templates/editMain.html", 
    "views/SourceView", "views/EditorView", "collections/SegmentSource"],

    function($, Backbone, template, SourceView,
             EditorView, SegmentSource){

        var EditMainView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: "#mainFrame",

            // View constructor
            initialize: function(options) {  
                var _this = this;
                $(this.$el).appendTo('body');
                var options = options || {};
                this.edition = options.edition;
                this.images = options.images;                  
                this.adminMode = options.adminMode || false;
                this.editorView = null;
                this.session = options.session;  
                var user = this.session.get('user');   
                this.adminMode = (user && user.superuser);                
                if (this.adminMode)
                    this.resources = new SegmentSource({showAll: true});
                else
                    this.resources = new SegmentSource();
                // Calls the view's render method
                this.render(); 
                var delay = (function(){
                    var timer = 0;
                    return function(callback, ms){
                        clearTimeout (timer);
                        timer = setTimeout(callback, ms);
                    };
                })();
                
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

            // View Event Handlers
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
                // Maintains chainability
                                 
                var _this = this;
                   
                var _this = this;
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
                        
            close: function () {
                this.editorView.close(); 
                this.resourcesView.close();
                this.unbind();
                this.remove();
            }

        });

        // Returns the View class
        return EditMainView;

    }

);