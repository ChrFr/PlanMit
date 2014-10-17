// ProjectModel.js
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var ProjectModel = Backbone.Model.extend({
            
            url: 'api/projects/',

            initialize: function() {
            },

        });

        return ProjectModel;

    }

);