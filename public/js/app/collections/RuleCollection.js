// RuleCollection.js
// -------------
define(["jquery","backbone","models/RuleModel"],

  function($, Backbone, ImageModel) {

    // Creates a new Backbone Collection class object
    var SegmentSource = Backbone.Collection.extend({
        
        model: ImageModel,
        url: 'api/rules/',
        
        initialize: function(options){
        },
        
        parseFunctionDesc: function(string){
            var func = null;
            console.log(string);
            return func;
        },
        
        parseAll: function(){   
            _.each(this.models, function(model){
                var ruleDescription = model.get('rule');
                console.log(ruleDescription);
            });
        }
        
        
        
                        
    });

    // Returns the Model class
    return SegmentSource;

  }

);

