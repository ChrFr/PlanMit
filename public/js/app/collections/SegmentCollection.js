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
            this.count = 1;
            this.projectID = project_id || 1;   
        },
        
        comparator: function(model) {
            return model.startPos;
        },
    
        addSegment: function(segment) { 
            //avoid models to have the same id (overwritten otherwise)
            //id is not used elsewhere
            segment.id = this.count;
            this.add(segment);   
            this.count++;
        },
                
        getSegmentByID: function(id) {
            var segment = null;
            this.each(function(seg){
                if (id === seg.attributes.id){
                    segment = seg;
                    return false;
                }
            });
            return segment;
        },
        
        fetch: function(options) {            
            this.url = 'db/projects/' + this.projectID;
            var _this = this;
            $.ajax({
                type: 'GET',
                url: _this.url,
                success: function(data) {
                    _this.fromJSON(data[0]);
                    if (options.reset)
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
                segment.startPos = dbSegment.start_pos;
                segment.size = dbSegment.size;
                segment.fixed = dbSegment.fixed;
                deferreds.push(segment.fetch({success: function(){
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
                edition[i] = {id: segment.attributes.id,
                              start_pos: segment.startPos,
                              size: segment.size,
                              fixed: segment.fixed
                };
                i++;
            });
            return JSON.stringify({'template': edition});
        },
        
        getStreetSize: function(){
            var lastSegment = this.at(this.length - 1);
            var size = (lastSegment) ? lastSegment.size + lastSegment.startPos: null;
            return size;
        }
        
    });

    // Returns the Model class
    return SegmentEdition;

  }

);