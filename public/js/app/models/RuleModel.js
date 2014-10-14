// RuleModel.js
// the model of a single rule
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var RuleModel = Backbone.Model.extend({
            
            url: 'api/rules/',

            initialize: function() {    
                //init with dummy function, will be overwritten by RuleCollection after fetch
                this.validator = {start: function(){return -1}};
            },  
                           
        });

        return RuleModel;

    }

);