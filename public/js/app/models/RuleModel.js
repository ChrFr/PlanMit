// RuleModel.js
// the model of a single rule
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var RuleModel = Backbone.Model.extend({
            
            url: 'api/rules/',

            initialize: function() {                
            },  
            
            functionMappper: {
                
                mapKeyword: function(key){
                    var map = { 
                        //functions
                        'neighbour': this.neighbour,
                        'or': this.or,
                        'and': this.and,
                        'not': this.not,
                        'alterWidth': this.alterWidth
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
                    var status = this.NOTCHECKED; 
                    var type = this.attrs.type;
                    var pos = this.ident.pos;
                    var posNeighbour = this.attrs.position + pos; 
                    var streetProfile = this.streetProfile;
                    //check to the right
                    if (posNeighbour > pos){
                        //if not inside street profile, you can't check it
                        if (posNeighbour >= streetProfile.length){
                            return this.NOTCHECKED;
                        }
                        //iterate towards the neighbour, checking for gaps
                        var prev = this.ident;
                        var iSeg;      
                        for(var i = pos + 1; i <= posNeighbour; i++){
                            iSeg = streetProfile[i];                            
                            //gap found on the way -> not checkable
                            if(iSeg.left > prev.right + this.TOLERANCE){
                                console.log('not')
                                return this.NOTCHECKED;
                            }
                            prev = iSeg;
                        };                  
                        //iterated without finding gaps -> time to check for type
                        if (iSeg.type === type)
                            return this.TRUE;                        
                        else     
                            return this.FALSE;
                    }
                    //check to the left
                    if (posNeighbour < pos){
                        //if not inside street profile, you can't check it
                        if (posNeighbour < 0)
                            return this.NOTCHECKED;
                        //iterate towards the neighbour, checking for gaps
                        var prev = this.ident;
                        var iSeg;
                        for(var i = pos - 1; i >= posNeighbour; i--){
                            iSeg = streetProfile[i];
                            //gap found on the way -> not checkable
                            if(iSeg.right < prev.left - this.TOLERANCE)
                                return this.NOTCHECKED;
                        };
                        //iterated without finding gaps -> time to check for type
                        if (iSeg.type === type)
                            return this.TRUE;
                        else
                            return this.FALSE;
                    }
                    return status;
                },
                
                alterWidth: function(){
                  /*
                    return valid;
                        _.each(this.attrs, function(attr){
                            if (attr === 'condition')
                                computedArgs.push(_this.attrs[attr].start());
                            else
                                computedArgs.push(_this.attrs);
                        });  */
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

                not: function(statusArray){
                    if (statusArray === this.NOTCHECKED)
                        return this.NOTCHECKED;
                    if (statusArray === this.TRUE)
                        return this.FALSE;
                    if (statusArray === this.FALSE)
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
                            attrs.push(_this.createValidationFunction(value[attr]))     
                        attrs[attr] = value[attr];
                    });
                    return new this.FunctionWrapper(func, attrs);
                }            
            },                     

            validate: function(ident, streetProfile) {
                var errorMsg = this.get('error_msg');
                var ruleJSON = $.parseJSON(this.get('rule')); 
                var validFunc = this.functionMappper.createValidationFunction(ruleJSON);
                var status = validFunc.start(ident, streetProfile);
                console.log(status);
                //return [status, errorMsg];
            },

        });

        return RuleModel;

    }

);