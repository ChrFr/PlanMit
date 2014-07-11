// SegmentSource.js
// Collection of the edible Segments, represents a Template for the traffic
// planner
// -------------
define(["jquery","backbone","models/SegmentModel"],

  function($, Backbone, SegmentModel) {

    // Creates a new Backbone Collection class object
    var SegmentEdition = Backbone.Collection.extend({

        // Tells the Backbone Collection that all of it's models will be of type Model (listed up top as a dependency)
        model: SegmentModel,
        url: 'db/projects/1',
        
        initialize: function(project_id){
            this.projectID = project_id || 1;   
            this.url = 'db/projects/' + this.projectID;
        },
        
        comparator: function(model) {
            return model.pos;
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
        
        fetch : function(options) {
            var _this = this;
            $.ajax({
                type: 'GET',
                url: this.url,
                success: function(data) {
                    _this.width = data.width;
                    _this.name = data.name;
                    _this.description = data.description;
                    _this.trigger('ready');
                }
            });
        },
    
        
        removeID: function(id) {
            var segment = this.getSegmentByID(id);
            if (segment)
                this.remove(segment);
        },        
        
        updatePositions: function(ids){
            this.each(function(segment){
                segment.pos = ids.indexOf(segment.id);
            });
        },
        
        resizeID: function(id, size) {
            var segment = this.getSegmentByID(id);      
            if (segment)
                segment.size = size;
        },
        
        toJSON: function(){
            console.log(this);
        }
    });

    // Returns the Model class
    return SegmentEdition;

  }

);