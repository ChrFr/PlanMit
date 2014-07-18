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
        
        fetch: function(options) {
            var _this = this;
            $.ajax({
                type: 'GET',
                url: _this.url,
                success: function(data) {
                    _this.fromJSON(data[0]);
                    _this.trigger('reset');
                }
            });
        },    
        
        //models are load seperately (not as whole collection), because only
        //the ids, positions and sizes are stored in the db (to minimize 
        //amount of data)
        fromJSON: function(json) {  
            var _this = this;
            this.width = json.width;
            this.name = json.name;
            this.description = json.description;
            var deferreds = [];
            _.each(json.default_template, function(dbSegment){
                var segment = new SegmentModel(dbSegment.id);
                segment.pos = dbSegment.pos;
                segment.size = dbSegment.size;
                segment.fixed = dbSegment.fixed;
                deferreds.push(segment.fetch({success: function(){
                        segment.setUniqueID();
                        _this.addSegment(segment);}}));
            });
            $.when.apply($, deferreds).done(function() {
              _this.trigger('reset');  
            });
        },
        
        save: function() {
            var _this = this;
            $.ajax({
                type: 'POST',
                url: _this.url,
                data: _this.toJSON(),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            });
        },  
        
        toJSON: function(){
            var edition = [];
            var i = 0;
            this.each(function(segment){
                var fixed = false;
                console.log(segment)
                if (segment.attributes.category !== 0)
                    fixed = true;
                edition[i] = {id: segment.attributes.id,
                              pos: segment.pos,
                              size: segment.size,
                              fixed: fixed
                };
                i++;
            });
            return JSON.stringify({'template': edition});
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
        
    });

    // Returns the Model class
    return SegmentEdition;

  }

);