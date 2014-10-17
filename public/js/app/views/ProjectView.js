// ProjectView.js
// -------
define(["jquery", "backbone", "text!templates/project.html"],

    function($, Backbone, template){
        var ProjectView = Backbone.View.extend({
            // The DOM Element associated with this view
            el: "#mainFrame",
            // View constructor
            initialize: function(options) {         
                // Calls the view's render method
                this.edition = options.edition;
                this.templateList = [];
                this.session = options.session;
                this.render(); 
            },

            // View Event Handlers
            events: {
                'click .chooseProjectButton': 'changeProject'
            },

            // Renders the view's template to the UI
            render: function() {
                var _this = this;
                if(this.session.get('user') && this.session.get('user').superuser){
                    var btn = $('<button/>').text('Neues Projekt erstellen')
                    btn.attr('id', 'newProjectButton'); 
                    btn.click(function(){_this.newProject()});
                    $(this.el).append(btn);
                }
                this.templateList = [];
                var projtmpl = _.template(template);
                var activeProject = this.collection.active;
                // Setting the view's template property using the Underscore template method
                // Dynamically updates the UI with the view's template
                this.collection.each(function(project){
                    _this.templateList.push(projtmpl);
                    var div = $(projtmpl({
                        name: project.get('name'),
                        location: project.get('location'),
                        description: project.get('description'),
                        id: project.id
                    }));
                    $(_this.el).append(div);
                    if (activeProject && activeProject.id === project.id){
                        div.addClass('selectedProject');                         
                        var button = div.find('.chooseProjectButton');
                        button.prop('disabled', true);
                        button.text('Ausgewählt');
                    }
                });
                // Maintains chainability
                return this;
            },
            
            changeProject: function(event){
                //reset layout of the list of projects, not nice to work with
                //jquery that lot, but time pressures
                var allButtons = $('.chooseProjectButton');
                allButtons.prop('disabled',false);                
                $('.textBar').removeClass('selectedProject');
                allButtons.text('Auswählen');
                //select the project
                var button = $(event.target);
                button.prop('disabled', true);
                button.text('Ausgewählt');
                button.parent().addClass('selectedProject');
                var projectID = JSON.parse(button.attr('data-button')).id;
                var project = this.collection.get(projectID);
                this.collection.active = project;
                this.edition.changeProject(project);
            },
            
            newProject: function(){
                var _this = this;            
                this.collection.createProject({success: function(response){ 
                    _this.collection.fetch({success: function(){
                        while (_this.$el[0].firstChild) {
                            _this.$el[0].removeChild(_this.$el[0].firstChild);
                        }
                        _this.render()
                    }});  
                }});
            },
            
            close: function () {
                this.unbind(); // Unbind all local event bindings
                this.remove(); // Remove view from DOM
            }
            
            

        });

        // Returns the View class
        return ProjectView;

    }

);