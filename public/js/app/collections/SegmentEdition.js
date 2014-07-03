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
        
        initialize: function(project_id){
            this.project_id = project_id || 1;    
        },
    
        addSegment: function(segment) {  
            this.add(segment);
        },
        
        getSegmentByID: function(id) {
            this.each(function(segment){
                if (id === segment.id){
                    return segment;
                }
            });
            return null;
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