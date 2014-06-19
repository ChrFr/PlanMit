// SegmentSource.js
// Collection of the edible Segments, represents a Template for the traffic
// planner
// -------------
define(["jquery","backbone","models/SegmentModel"],

  function($, Backbone, SegmentModel) {

    // Creates a new Backbone Collection class object
    var SegmentEdition = Backbone.Collection.extend({

      // Tells the Backbone Collection that all of it's models will be of type Model (listed up top as a dependency)
      model: SegmentModel

    });

    // Returns the Model class
    return SegmentEdition;

  }

);