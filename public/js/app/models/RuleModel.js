// RuleModel.js
// the model of a single rule
// --------
define(["jquery", "backbone"],

    function($, Backbone) {

        var RuleModel = Backbone.Model.extend({
            
            url: 'api/rules/',

            initialize: function() {                
                //5cm tolerance for gaps between segments
                this.tolerance = 5;
            },  
            
            functionMappper: {
                
                mapKeyword: function(key){
                    var map = { 
                        //functions
                        'neighbour': this.neighbour,
                        'or': this.or,
                        'and': this.and,
                        'not': this.not 
                    }
                    return map[key];
                },
                
                FunctionWrapper: function(func, attrs, args){
                    this.func = func;
                    this.args = args || [];
                    this.attrs = attrs || {};
                    //variables, that are computed just before the call
                    //of the function, needed as closure
                    this.environment = [];
                    
                    this.start = function(environment){
                        var _this = this;
                        this.environment = environment;
                        var computedArgs = [];
                        _.each(this.args, function(arg){
                            if(arg instanceof _this.constructor)
                                computedArgs.push(arg.start());
                            else
                                computedArgs.push(arg);
                        });
                        func(this.arguments);
                    };
                },
            
                neighbour: function(){
                    console.log('neighbour');/*
                    options = options || {};
                    var type = options.type;
                    var position = options.position;
                    var valid = false;

                    return valid;
                        _.each(this.attrs, function(attr){
                            if (attr === 'condition')
                                computedArgs.push(_this.attrs[attr].start());
                            else
                                computedArgs.push(_this.attrs);
                        });*/
                },

                or: function(boolArray){
                    console.log('or');/*
                    var valid = false;
                    _.each(boolArray, function(boolValue){
                       if (boolValue)
                           valid = true;
                    });
                    return valid;*/
                },

                and: function(boolArray){
                    console.log('and');/*
                    var valid = true;
                    _.each(boolArray, function(boolValue){
                       if (!boolValue)
                           valid = false;
                    });
                    return valid;*/
                },

                not: function(boolValue){
                    console.log('not');/*
                    return !boolValue;*/
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
                    _.each(value, function(attr){
                        if (attr === 'condition')
                            attrs.push(_this.createValidationFunction(value[attr]))     
                        attrs[attr] = value[attr];
                    });
                    return new this.FunctionWrapper(func, attrs);
                }            
            },                     

            validate: function(position, size, streetProfile) {
                var errorMsg = this.get('error_msg');
                var ruleJSON = $.parseJSON(this.get('rule')); 
                var validFunc = this.functionMappper.createValidationFunction(ruleJSON);
                console.log(validFunc);
                validFunc.start(streetProfile);
                //return [status, errorMsg];
            },

        });

        return RuleModel;

    }

);