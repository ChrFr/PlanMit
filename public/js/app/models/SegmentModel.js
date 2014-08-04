// SegmentModel.js
// the model of a single segment
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var SegmentModel = Backbone.Model.extend({
            
            url: 'db/segments/',

            initialize: function(dbID) {
                this.url += dbID || 1;
                this.startPos = 0;
            },
/*
            defaults: {
                id: 0,
                start_width: 0,
                image_id: null,
                max_width: 0,
                min_width: 0,
                image_data: 0,    
                rules: null,
                current_width: 0
            },*/

            validate: function(attrs) {
                console.log('validation');
            },
                        
            loadImage: function(pointOfView, callback){
                var pos = pointOfView || 'front';
                //ToDo: switch top and front img
                var _this = this;
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function(){
                    if (xmlhttp.readyState==4 && xmlhttp.status==200){
                        callback(JSON.parse(xmlhttp.responseText).img_svg);
                    }
                };                
                xmlhttp.open("GET","db/images/" + _this.attributes.image_id, 
                             true);
                xmlhttp.send();                
            }            

        });

        return SegmentModel;

    }

);