// ImageCollection.js
// -------------
define(["jquery","backbone","models/ImageModel"],

  function($, Backbone, ImageModel) {

    // Creates a new Backbone Collection class object
    var SegmentSource = Backbone.Collection.extend({
        
        model: ImageModel,
        url: 'api/images/',
        
        initialize: function(options){
        },
                        
    });

    // Returns the Model class
    return SegmentSource;

  }

);