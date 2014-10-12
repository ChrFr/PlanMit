// RuleModel.js
// the model of a single rule
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var RuleModel = Backbone.Model.extend({
            
            url: 'api/rules/',

            initialize: function() {
            },                

            parseRule: function(ruleJSON) {  
                
            },

        });

        return RuleModel;

    }

);