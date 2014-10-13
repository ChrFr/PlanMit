// SegmentModel.js
// the model of a single segment
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var SegmentModel = Backbone.Model.extend({
            
            url: 'api/segments/',

            initialize: function(dbID) {
                this.url += dbID || 1;
                this.startPos = 0;
                this.set('valid', true);
            },

            checkRules: function(ident, streetProfile) {
                var rules = this.get('ruleModels');
                var position = this.startPos;
                var size = this.size;
                var valid = true;
                var errorMessages = [];
                var _this = this;
                if (rules)
                    //the rules are logically connected with "and"
                    _.each(rules, function(rule){     
                        var ret = rule.validate(ident, streetProfile);
                        /*
                        if (!ret[0]){
                            errorMessages.push(ret[1]);
                            valid=false;
                        }      */                      
                    });
            }
        });

        return SegmentModel;

    }

);