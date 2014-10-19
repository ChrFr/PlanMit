// SegmentModel.js
// the model of a single segment
// --------
define(["jquery", "backbone"],
    /**
    * The model of a single segment.
    * 
    * @return  the SegmentModel class
    */   
    function($, Backbone) {

        var SegmentModel = Backbone.Model.extend({
            
            url: 'api/segments/',

            initialize: function(dbID) {
                this.url += dbID || 1;
                this.startPos = 0;
                //this.set('valid', true);
            },
        });
        return SegmentModel;
    }
);