// ProjectCollection.js
// -------------
define(["jquery","backbone","models/ProjectModel"],

  function($, Backbone, ProjectModel) {

    // Creates a new Backbone Collection class object
    var ProjectCollection = Backbone.Collection.extend({

        // Tells the Backbone Collection that all of it's models will be of type Model (listed up top as a dependency)
        model: ProjectModel,
        url: 'api/projects',
        
        initialize: function(){
        },
        
        createProject: function(options){
            var newProject = new ProjectModel({
                name: 'Name',
                location: 'Ort',
                description: 'Hier Beschreibungstext des Projektes einfügen',
                default_template: '[]',
                longitude: 0,
                latitude: 0,
                ignore_segments: []
            });
            newProject.save(null, {success: function(response){
                if (options.success)
                    options.success(response);
            }});
        }
                
    });

    // Returns the Collection
    return ProjectCollection;

  }

);