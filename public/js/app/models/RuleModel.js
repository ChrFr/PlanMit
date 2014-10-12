// RuleModel.js
// the model of a single rule
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var RuleModel = Backbone.Model.extend({
            
            url: 'api/rules/',

            initialize: function() {
            },                
            
            neighbour: function(neighbours, options){
                options = options || {};
                var type = options.type;
                var position = options.position;
                var distance = 0 || options.distance;
                var required = true || options.required;
                var forbidden = true || options.required;
                var alterWidth = options.alterWidth;
                var valid = false;
                
                return valid;
            },
            
            or: function(boolArray){
                var valid = false;
                _.each(boolArray, function(boolValue){
                   if (boolValue)
                       valid = true;
                });
                return valid;
            },
            
            and: function(boolArray){
                var valid = true;
                _.each(boolArray, function(boolValue){
                   if (!boolValue)
                       valid = false;
                });
                return valid;
            },

            validate: function(neighbours) {  
                var valid = false;
                var errorMsg = this.get('error_msg')
                var rule = $.parseJSON(this.get('rule'));
                console.log(Object.keys(rule));
                return [valid, errorMsg];
            },

        });

        return RuleModel;

    }

);