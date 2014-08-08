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

            validate: function(attrs) {
                console.log('validation');
            },
                        
            loadSvg: function(id, callback){
                //ToDo: switch top and front img
                var _this = this;
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function(){
                    if (xmlhttp.readyState==4 && xmlhttp.status==200){
                        var res = JSON.parse(xmlhttp.responseText)
                        callback(res.img_svg, res.actual_size);
                    }
                };                
                xmlhttp.open("GET","db/images/" + id, 
                             true);
                xmlhttp.send();                
            }            

        });

        return SegmentModel;

    }

);