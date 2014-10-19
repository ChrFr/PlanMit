// ImageModel.js
// --------
define(["jquery", "backbone"],

    /**
    * holds the png-, svg- images as well as the thumbnails 
    * of a single segment
    * 
    * @return  the ImageModel class
    */ 

    function($, Backbone) {

        var ImageModel = Backbone.Model.extend({
            
            url: 'api/images/',

            initialize: function() {
            },            
            
            //fetch the image data from the server
            //param type determines the type of the image ('svg', 'png' or 'thumb')
            //executes the callback, after successful fetch
            getImage: function(type, callback){
                var img = this.get('type');
                var size = this.get('actual_size');
                if (!img) {
                    var _this = this;
                    var image = $.ajax({
                        url : this.url + this.id + '/' + type,
                        type : 'GET'
                    });
                    image.done(function(response){
                        _this.set('type', response);
                        callback(response, size);
                    });
                }
                else
                    callback(img, size);
            }
        });
        return ImageModel;
    }
);