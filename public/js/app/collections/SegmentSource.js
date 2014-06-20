// SegmentSource.js
// -------------
define(["jquery","backbone","models/SegmentModel"],

  function($, Backbone, SegmentModel) {

    // Creates a new Backbone Collection class object
    var SegmentSource = Backbone.Collection.extend({
        
        model: SegmentModel,
        url: 'db/projects/1/segments/',
        
        initialize: function(project_id){
            this.project_id = project_id || 1;    
        },
        /*
        sync: function(method, model, options) {
            console.log('bla');
        },
              
        //asynchronous function, ToDO: ready state for view
        fromDB: function(project_id){
            _this = this;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange=function(){
                if (xmlhttp.readyState==4 && xmlhttp.status==200){
                    _this.fromJSON(JSON.parse(xmlhttp.responseText));
                }
            }
            xmlhttp.open("GET","db/projects/" + project_id + "/segments", 
                         true);
            xmlhttp.send();                  
        },*/
    
        addSegment: function(segment) {  
            this.add(segment);
        },
        /*
        fromJSON: function(json) {
            _this = this;
            _.each(json, function(segment_json){
                var segment = new SegmentModel();
                segment.fromJSON(segment_json);  
                _this.addSegment(segment);
            });
        },*/
                
    });

    // Returns the Model class
    return SegmentSource;

  }

);