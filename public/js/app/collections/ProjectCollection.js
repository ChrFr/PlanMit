// ProjectCollection.js
// -------------
define(["jquery","backbone","models/ProjectModel"],

    /**
    * A Collection of ProjectModels, holds all available projects
    * 
    * @return  the ProjectCollection class
    */ 
    function($, Backbone, ProjectModel) {

      // Creates a new Backbone Collection class object
      var ProjectCollection = Backbone.Collection.extend({

            model: ProjectModel,
            url: 'api/projects',

            initialize: function(){
            },

            //create a new project with default values, post it to the server
            createProject: function(options){
                var newProject = new ProjectModel({
                    name: 'Name',
                    location: 'Ort',
                    description: 'Hier Beschreibungstext des Projektes einfügen',
                    default_template: '[]',
                    longitude: 0,
                    latitude: 0
                });
                newProject.save(null, {success: function(response){
                    if (options.success)
                        options.success(response);
                }});
            }
        });
      return ProjectCollection;
    }
);