// ImageCollection.js
// -------------
define(["jquery","backbone","models/ImageModel"],

    /**
    * A Collection of ImageModels
    * <p>
    * @return   the ImageCollection class
    */ 
    function($, Backbone, ImageModel) {

      var ImageCollection = Backbone.Collection.extend({

          model: ImageModel,
          url: 'api/images/',

          initialize: function(options){
          },

      });

      return ImageCollection;
    }
);