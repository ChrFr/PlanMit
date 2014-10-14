// RuleCollection.js
// -------------
define(["jquery","backbone","models/RuleModel"],

  function($, Backbone, ImageModel) {

    // Creates a new Backbone Collection class object
    var SegmentSource = Backbone.Collection.extend({
        
        model: ImageModel,
        url: 'api/rules/',
        
        initialize: function(options){
            this.bind('reset', this.createFunctions, this);
            this.fetch({reset: true});
        },
        
        createFunctions: function(){
            var _this = this;
            this.each(function(rule){                
                var ruleJSON = $.parseJSON(rule.get('rule')); 
                var validator = _this.functionMappper.createValidationFunction(ruleJSON);
                rule.validator = validator;
            });
        },
        
        functionMappper: {

            mapKeyword: function(key){
                var map = { 
                    //functions
                    'neighbour': this.neighbour,
                    'or': this.or,
                    'and': this.and,
                    'not': this.not,
                    'alterMinWidth': this.alterMinWidth
                }
                return map[key];
            },

            FunctionWrapper: function(func, attrs, args){

                //status flags
                this.NOTCHECKED = -1,
                this.TRUE = 1,
                this.FALSE = 0,
                //5cm tolerance for gaps between segments
                this.TOLERANCE = 5,
                this.func = func;
                this.args = args || [];                                     
                //environment variables, that are needed as closure for the 
                //functions to work with
                this.attrs = attrs || {};    
                this.streetProfile = [];
                this.ident = {};

                this.start = function(ident, streetProfile){
                    var _this = this;
                    this.streetProfile = streetProfile;
                    this.ident = ident;
                    var computedArgs = [];
                    _.each(this.args, function(arg){
                        if(arg instanceof _this.constructor)
                            computedArgs.push(arg.start(_this.ident, _this.streetProfile));
                        else
                            computedArgs.push(arg);
                    });
                    return this.func(computedArgs);
                };
            },

            neighbour: function(){     
                var type = this.attrs.type;
                var distance = this.attrs.distance || 1;
                var direction = this.attrs.direction || 'both';
                var pos = this.ident.pos;
                var streetProfile = this.streetProfile;
                var _this = this;
                
                var checkLeft = function(){
                    var status = _this.NOTCHECKED; 
                    var posNeighbour = pos - distance; ; 
                    //if not inside street profile -> you can't check it
                    if (posNeighbour < 0)
                        return _this.NOTCHECKED;
                    //iterate towards the neighbour, checking for gaps
                    var prev = _this.ident;
                    var iSeg;
                    for(var i = pos - 1; i >= posNeighbour; i--){
                        iSeg = streetProfile[i];
                        //gap found on the way -> can't check
                        if(iSeg.right < prev.left - _this.TOLERANCE)
                            return _this.NOTCHECKED;
                            
                    };
                    //iterated without finding gaps -> time to check for type
                    if (iSeg.type === type)
                        return _this.TRUE;
                    else
                        return _this.FALSE; 
                    return status;
                }
                
                var checkRight = function(){
                    var status = _this.NOTCHECKED; 
                    var posNeighbour = pos + distance; 
                    //if not inside street profile, you can't check it
                    if (posNeighbour >= streetProfile.length){
                        return _this.NOTCHECKED;
                    }
                    //iterate towards the neighbour, checking for gaps
                    var prev = _this.ident;
                    var iSeg;     
                    for(var i = pos + 1; i <= posNeighbour; i++){
                        iSeg = streetProfile[i];                  
                        //gap found on the way -> not checkable
                        if(iSeg.left > prev.right + _this.TOLERANCE){
                            return _this.NOTCHECKED;
                        }
                        prev = iSeg;
                    };        
                    //iterated without finding gaps -> time to check for type
                    if (iSeg.type === type)
                        return _this.TRUE;                        
                    else     
                        return _this.FALSE;
                    return status;
                }                                    
                if (direction === 'left')
                    return checkLeft();
                if (direction === 'right')
                    return checkRight();
                if (direction === 'both'){
                    var left = checkLeft();
                    var right = checkRight();
                    if (left === this.TRUE || right === this.TRUE)
                        return this.TRUE;
                    //if you couldn't check in one direction, you can't evaluate
                    if (left === this.NOTCHECKED || right === this.NOTCHECKED)
                        return this.NOTCHECKED;  
                    //only false, when not found in both directions
                    return this.FALSE;
                }
                return this.NOTCHECKED;
            },

            alterMinWidth: function(){
                var condition = this.attrs.condition;
                var status = this.TRUE;
                if (condition)
                    status = condition.start(this.ident, this.streetProfile);
                if (status === this.TRUE){
                    var size = this.ident.right - this.ident.left
                    if(size < this.attrs.minWidth){
                        return this.FALSE;
                    }
                    else {
                        return this.TRUE;
                    }
                }
                return this.UNCHECKED;
            },

            or: function(statusArray){
                var status = this.NOTCHECKED; 
                var _this = this;
                _.each(statusArray, function(statusValue){
                    //normal "or" logic: if one is true, everything is true
                    if (statusValue === _this.TRUE)
                        status = _this.TRUE;
                    //extended logic: false is stronger than "not checked"
                    else if ((statusValue === _this.FALSE) && (status !== _this.TRUE))
                        status = _this.FALSE;
                });
                return status;
            },

            and: function(statusArray){
                var _this = this;
                var status = this.TRUE;
                var checkFlag = true;
                _.each(statusArray, function(statusValue){
                    //normal "and" logic: if one is false, everything is false
                    if (statusValue === _this.FALSE)
                        status = _this.FALSE;
                    //extended logic: if one is "not checked", you can't evaluate the rest
                    else if (statusValue === _this.NOTCHECKED)
                        checkFlag = false;
                });
                if (!checkFlag)
                    return this.NOTCHECKED;
                return status;
            },

            not: function(status){
                var status = status[0];
                if (status === this.NOTCHECKED)
                    return this.NOTCHECKED;
                if (status === this.TRUE)
                    return this.FALSE;
                if (status === this.FALSE)
                    return this.TRUE;
            },

            createValidationFunction: function(ruleJSON){  
                var _this = this;
                var functionKey = Object.keys(ruleJSON);
                var func = this.mapKeyword(functionKey);                    
                var value = ruleJSON[functionKey];
                //arrays are arguments, that are functions themselfes
                if (value instanceof Array){
                    var args = [];
                    _.each(value, function(argument){
                        args.push(_this.createValidationFunction(argument));
                    });
                    return new this.FunctionWrapper(func, {}, args);
                };
                //values are arguments as well, but can be normal parameters
                //OR functions (with "condition" keyword)
                var attrs = {};
                _.each(Object.keys(value), function(attr){
                    if (attr === 'condition')
                        attrs[attr] = _this.createValidationFunction(value[attr]);  
                    else
                        attrs[attr] = value[attr];
                });                
                return new this.FunctionWrapper(func, attrs);
            }            
        }     
    });

    // Returns the Model class
    return SegmentSource;

  }

);

