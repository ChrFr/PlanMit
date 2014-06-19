// SegmentModel.js
// the model of a single segment
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var SegmentModel = Backbone.Model.extend({

            initialize: function() {
            },

            defaults: {
                id: 0,
                startWidth: 0,
                imageID: null,
                maxWidth: 0,
                minWidth: 0,
                rules: null
            },

            validate: function(attrs) {
                console.log('validation');
            },
            
            //reads attributes from JSON object and assigns them 
            //(and overwrites)
            fromJSON: function(json){
                this.id = json.id;
                this.startWidth = json.start_width;
                this.imageID = json.image_id;
                this.maxWidth = json.max_width;
                this.minWidth = json.min_width;
                this.rules = json.rules;
            },
            
            image: function(position){
                var pos = position || 'front';
                //switch pos
            }

        });

        return SegmentModel;

    }

);