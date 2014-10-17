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
                
    });

    // Returns the Collection
    return ProjectCollection;

  }

);