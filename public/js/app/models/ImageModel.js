// ImageModel.js
// the model of a single image
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var ImageModel = Backbone.Model.extend({
            
            url: 'api/images/',

            initialize: function() {
            },            
            
            //[svg, png, thumb]
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