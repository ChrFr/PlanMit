// SegmentSource.js
// -------------
define(["jquery","backbone","models/SegmentModel"],

  function($, Backbone, SegmentModel) {

    // Creates a new Backbone Collection class object
    var SegmentSource = Backbone.Collection.extend({
        
        model: SegmentModel,
        url: 'api/projects/1/segments/',
        
        initialize: function(options){
            var project_id, url;            
            if (options){
                project_id = options.project_id;   
                if (options.showAll)
                    url = 'api/segments/';
            };
            this.project_id = project_id || 1;
            this.url = url || 'api/projects/' + this.project_id + '/segments/';
        },
    
        addSegment: function(segment) {  
            this.add(segment);
        },
        
        getSegmentByID: function(id) {
            var segment = null;
            this.each(function(seg){
                if (id === seg.id){
                    segment = seg;
                    return false;
                }
            });
            return segment;
        },
                
    });

    // Returns the Model class
    return SegmentSource;

  }

);