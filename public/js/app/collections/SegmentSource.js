// SegmentSource.js
// -------------
define(["jquery","backbone","models/SegmentModel"],

  function($, Backbone, SegmentModel) {

    // Creates a new Backbone Collection class object
    var SegmentSource = Backbone.Collection.extend({
        
        model: SegmentModel,   
        
        populate: function(project_id){
            _this = this;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange=function(){
                if (xmlhttp.readyState==4 && xmlhttp.status==200){
                    _this.fromJSON(JSON.parse(xmlhttp.responseText));
                }
            }
            xmlhttp.open("GET","db/projects/" + project_id + "/segments", true);
            xmlhttp.send();                  
        },
    
        addSegment: function(segment) {      
            //console.log(json);
            //this.add(segment);
        },
        
        fromJSON: function(json) {   
            _.each(json, function(segment_json){
                var segment = new SegmentModel();
                segment.fromJSON(segment_json);
            });
        }
    });

    // Returns the Model class
    return SegmentSource;

  }

);