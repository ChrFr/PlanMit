// SegmentSource.js
// -------------
define(["jquery","backbone","models/SegmentModel"],

  function($, Backbone, SegmentModel) {

    // Creates a new Backbone Collection class object
    var SegmentSource = Backbone.Collection.extend({
        
        model: SegmentModel,
        url: 'db/projects/1/segments/',
        
        initialize: function(options){
            var project_id, url;            
            if (options){
                project_id = options.project_id;   
                if (options.showAll)
                    url = 'db/segments/';
            };
            this.project_id = project_id || 1;
            this.url = url || 'db/projects/' + this.project_id + '/segments/';
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