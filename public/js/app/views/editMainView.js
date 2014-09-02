// editView.js
// edit Window containing view on resources and the editor
// -------
define(["jquery", "backbone", "text!templates/editMain.html", 
    "views/sourceView", "views/editorView"],

    function($, Backbone, template, SourceView,
             EditorView){

        var EditMainView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: "#mainFrame",

            // View constructor
            initialize: function(options) {  
                var _this = this;
                $(this.$el).appendTo('body');
                var options = options || {};
                this.resources = options.resources;  
                this.edition = options.edition;
                this.images = options.images;  
                this.resourcesView = null;
                this.editorView = null;
                // Calls the view's render method
                this.render();    
                this.resources.fetch({reset: true});  
                
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
                            _this.resourcesView.render();
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
                                                  wrapper: "#editorWrapper",
                                                  images: this.images,
                                                  thumbSize: sourceHeight});
                // Maintains chainability
                return this;

            },            

        });

        // Returns the View class
        return EditMainView;

    }

);