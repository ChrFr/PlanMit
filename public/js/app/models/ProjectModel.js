// ProjectModel.js
// --------
define(["jquery", "backbone"],
    /**
    * Represents a single project.
    * 
    * @return  the ProjectModel class
    */   
    function($, Backbone) {

        var ProjectModel = Backbone.Model.extend({
            
            url: 'api/projects/',

            initialize: function() {
            },
        });

        return ProjectModel;

    }

);