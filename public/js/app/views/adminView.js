// editView.js
// edit Window containing view on resources and the editor
// -------
define(["jquery", "backbone", "text!templates/admin.html", 
    "edittool/js/jquery.shapeshift.adapted", "collections/SegmentSource",
    "views/sourceView", "views/editorView"],

    function($, Backbone, template, shapeshift, SegmentSource, SourceView,
             EditorView){

        var AdminView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: "#mainFrame",

            // View constructor
            initialize: function(resources, edition) {
                
                this.resources = resources;  
                this.edition = edition;
                // Calls the view's render method
                this.render();         
                
                this.resourcesView = new SourceView({collection: resources,
                                                     showAll: true,
                                                     el: '#resources'});
                this.editorView = new EditorView({collection: this.edition,
                                                  el: '#edition',
                                                  resources: this.resources});
                this.resources.fetch({reset: true});
                this.edition.fetch();

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
                var _this = this;
                $('#uploadButton').click(function() {
                    _this.edition.save();
                })
                // Maintains chainability
                return this;

            },            

        });

        // Returns the View class
        return AdminView;

    }

);