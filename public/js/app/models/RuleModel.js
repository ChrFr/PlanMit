// RuleModel.js
// --------
define(["jquery", "backbone"],
    /**
    * The model of a single rule.
    * 
    * @return  the ProjectModel class
    */   
    function($, Backbone) {

        var RuleModel = Backbone.Model.extend({
            
            url: 'api/rules/',

            initialize: function() {    
                //init with dummy function, will be overwritten by RuleCollection after fetch
                //prevents errors, if not fully loaded
                this.validator = {start: function(){return -1}};
            },                             
        });
        return RuleModel;

    }

);