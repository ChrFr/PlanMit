// SegmentCollection.js
// Collection of the edible Segments, represents a Template for the traffic
// planner
// -------------
define(["jquery","backbone","models/SegmentModel", "collections/RuleCollection"],
    
/**
    * A Collection of SegmentModels.
    * <p>
    * Represents a street profile or the resources, that are available to create 
    * a street profile, depending on the initialisation.
    * <p>
    * If representing a street profile, determines the order of the segments on
    * the street (from left to right). Initiates the validation of the rules.
    * 
    * @param options.project  ProjectModel, the project, the segments are origintaing from
    * @param options.isSource determines if this collection represents the resources(if true) or a street profile (default)
    * @param options.showAll  only influences resources, if true: fetch all available segments, else: only fetch the allowed ones (allowed by the project)
    * @return                 the SegmentCollection class
    */ 
    function($, Backbone, SegmentModel, RuleCollection) {

        // Creates a new Backbone Collection class object
        var SegmentCollection = Backbone.Collection.extend({

            // Tells the Backbone Collection that all of it's models will be of type Model (listed up top as a dependency)
            model: SegmentModel,
            url: '',

            initialize: function(options){
                if (options && options.isSource){
                    this.isSource = true;
                    this.showAll = options.showAll;
                    this.project = options.project;  
                    this.url = 'api/segments/';            
                    if (this.project && !this.showAll){
                        this.url = url || 'api/projects/' + this.project.get('id') + '/segments/';
                    };
                }
                else{       
                    this.isSource = false;         
                    this.count = 1;
                    this.ruleCollection = new RuleCollection();       
                }
            },

            //fetch the segments defined by the given project
            changeProject: function(project){
                this.project = project;
                if (this.isSource){
                    if (this.showAll)
                        this.url = 'api/segments/';  
                    else
                        this.url = 'api/projects/' + project.get('id') + '/segments/';
                }
                //this.url = 'api/projects/' + projectID;
                this.reset();
                this.fetch({reset: true});
            },

            //checks the minimum sizes of the segments, and executes the validation
            //functions for all SegmentModels inside this collection
            //the results including the error messages are set to the segmentmodels
            checkRules: function(){ 
                var NOTCHECKED = -1;
                var TRUE = 1;
                var FALSE = 0;
                var _this = this;
                var streetProfile = this.createStreetProfile();
                _.each(this.models, function(model){
                    var ident = {
                        pos: _this.indexOf(model),
                        left: model.startPos,
                        right: model.startPos + model.size,
                        type: model.get('type')
                    };  
                    var errorMsgs = [];
                    var status = NOTCHECKED;
                    //check the sizes
                    var standardWidth = model.get('standard_width');
                    var maxWidth = model.get('max_width');
                    if (maxWidth){
                        if (model.size > maxWidth){
                            status = FALSE;
                            errorMsgs.push('Das Segment ist viel zu breit! Die Maximalbreite beträgt ' +
                                    maxWidth + ' cm!')
                        }
                        else
                            status = TRUE;
                    }
                    else if (standardWidth) {
                            if (model.size > standardWidth){
                            status = FALSE;
                            errorMsgs.push('Das Segment ist unnötig breit! Empfohlen sind ' +
                                    standardWidth + ' cm!');
                            }
                            else
                                status = TRUE;
                        };

                    //check the rules
                    var ruleIDs = model.get('rules');
                    if (ruleIDs && ruleIDs.length > 0){
                        //check all rules, that are defined for this segment
                        //(linked logically with "and"), different extended logic as in 
                        //FunctionMappper: if one is false, everything is false, "not checked"
                        //doesn't help, "not checked" is stronger than true though, you
                        //only get a true, if all are checked and true
                        _.each(ruleIDs, function(ruleID){
                            var rule = _this.ruleCollection.get(ruleID);
                            var stattmp = rule.validator.start(ident, streetProfile);
                            if (stattmp === FALSE){
                                status = FALSE
                                errorMsgs.push(rule.get('error_msg'));
                            }                        
                            else if (stattmp === NOTCHECKED && status !== FALSE)
                                status = NOTCHECKED;
                            else if (stattmp === TRUE && status !== FALSE)
                                status = TRUE;
                        })  
                    };
                    model.set('errorMsgs', errorMsgs);
                    model.set('status', status);
                });
            },

            //create and return JSON representation of the street profile
            //differs from toJSON() by containing different and less informations
            createStreetProfile: function(){     
                var streetProfile = [];
                this.each(function(segment){
                    streetProfile.push ({
                        left: segment.startPos,
                        right: segment.size + segment.startPos,
                        type: segment.get('type')});
                });
                return streetProfile;
            },

            //order function
            comparator: function(model) {
                return model.startPos;
            },

            //add a segment to this collection
            addSegment: function(segment) { 
                if(this.isSource)
                    this.add(segment);
                //avoid models to have the same id (overwritten otherwise)
                //id is not used elsewhere
                else {
                    segment.id = this.count;
                    this.add(segment);
                    this.count++;            
                };
            },

            //find and return a segment by its database id
            getSegmentByID: function(id) {
                var segment = null;
                this.each(function(seg){
                    if (id === seg.get('id')){
                        segment = seg;
                        return false;
                    }
                });
                return segment;
            },

            //fetch the segments from the server
            fetch: function(options) {           
                if (this.isSource)
                    return Backbone.Collection.prototype.fetch.call(this, options);
                var defaultTemplate = this.project.get('default_template');
                this.fromJSON(defaultTemplate);            
                if (options.success)
                    options.success();
                if (options.reset)
                    this.trigger('reset');
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
                _.each(json, function(dbSegment){
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

            //post the changes on the project to the server
            updateProject: function() {
                var url = '/api/projects/' + this.project.get('id');            
                var _this = this;
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(_this.toJSON()),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                });            
            },  

            //post the created user template to the server
            updateUserTemplate: function() {
                var url = '/api/session/templates/' + this.project.get('id');
                var _this = this;
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(_this.toJSON()),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                });            
            }, 

            //creates a JSON representation of the street profile, as it will be 
            //stored in the database
            //reverse to fromJSON()
            toJSON: function(){
                var edition = [];
                var i = 0;            
                var offset = 0;
                var first = this.at(0);
                if (first && first.fixed)
                    offset = first.startPos;
                this.each(function(segment){
                    edition[i] = {id: segment.attributes.id,
                                  start_pos: segment.startPos - offset,
                                  size: segment.size,
                                  fixed: segment.fixed
                    };
                    i++;
                });
                return {'template': edition};
            },

            //calculate and return the size of the street
            getStreetSize: function(){
                var lastSegment = this.at(this.length - 1);
                var size = (lastSegment) ? lastSegment.size + lastSegment.startPos: null;
                return size;
            }

        });
        return SegmentCollection;
    }
);