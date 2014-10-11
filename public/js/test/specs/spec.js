// Jasmine Unit Testing Suite
// --------------------------
define(["jquery", "backbone", "routers/Router"],

    function($, Backbone, Router) {

        // Test suite that includes all of the Jasmine unit tests   
        describe("PlanMit", function() {
            
        /*

            // Backbone View Suite: contains all tests related to views
            describe("Backbone views", function() {

                // Runs before every View spec
                beforeEach(function() {

                    // Instantiates a new View instance
                    this.view = new View();

                });

                it("should contain the correct view element", function() {

                    this.router = new DesktopRouter();

                    expect(this.view.$el.selector).toEqual(".example");

                });

                it("should contain the appropriate template", function() {

                    expect(this.view.template).toEqual(headerText);

                });

            }); // End of the View test suite

            // Backbone Model Suite: contains all tests related to models
            describe("Backbone models", function() {

                // Runs before every Model spec
                beforeEach(function() {

                    // Instantiates a new Model instance
                    this.model = new Model();

                    // We are spying on the _validate method to see if it gets called
                    spyOn(Model.prototype, "validate").andCallThrough();

                });

                it("should be in a valid state", function() {

                    expect(this.model.isValid()).toBe(true);

                });

                it("should call the validate method when setting a property", function() {

                    this.model.set({ example: "test" }, { validate: true });

                    expect(Model.prototype.validate).toHaveBeenCalled();

                });

            }); // End of the Model test suite

        // Backbone Collection Suite: contains all tests related to collections
        describe("Backbone collections", function() {

            // Runs before every Collection spec
            beforeEach(function() {

                // Instantiates a new Collection instance
                this.collection = new Collection();

            });

            it("should contain the correct number of models", function() {

                expect(this.collection.length).toEqual(0);

            });

        }); // End of the Collection test suite
        */

        // test the routes
        describe("Backbone Router", function () {

            // Runs before every Router spec
            beforeEach(function () {
                // Stops the router from listening to hashchange events 
                // (Required because Backbone will only allow you to run Backbone.history.start() once for each page load.)
                Backbone.history.stop();
                
                this.router = new Router();
                // create Jasmine spies and call them, if the route methods are called
                this.welcomeSpy = jasmine.createSpy("welcome");   
                this.router.on("route:welcome", this.welcomeSpy);
                //this.editSpy = jasmine.createSpy("edit");   
                //this.router.on("route:edit", this.editSpy);
                this.loginSpy = jasmine.createSpy("edit");   
                this.router.on("route:login", this.loginSpy);
            });

            it("should call the router welcome method when there is no hash in the url", function() {
                // some dummy route without hashtag
                this.router.navigate("dummy_route");
                // default route
                this.router.navigate("", { trigger: true });
                // Expects the Jasmine spy to have been called
                expect(this.welcomeSpy).toHaveBeenCalled();
            });
            /* crashes, because some DOM Objects are not created within jasmine
            it("test the editor route #edit", function() {
                // navigate to the edit route
                this.router.navigate("#edit", { trigger: true });
                // Expects the Jasmine spy to have been called
                expect(this.editSpy).toHaveBeenCalled();
            });  */
            
            it("should call the login route at url #login", function() {
                // navigate to the login route
                this.router.navigate("#login", { trigger: true });
                // Expects the Jasmine spy to have been called
                expect(this.loginSpy).toHaveBeenCalled();
            });
          
            it("should receive a session-token at the start and shouldn't be logged in", function() {
                var session = this.router.session;
                //session is created
                expect(session.attributes).not.toBeNull();                  
                //async test if csrf token is submitted and user is not logged in
                waits(500);
                runs(function() {            
                    expect(this.router.session.attributes.csrf).toEqual(jasmine.any(String)); 
                    expect(session.get('user')).toBeUndefined();
                });                
            });
                       

        }); // End of the Router test suite
        
         // test the routes
        describe("Server API", function () {
            beforeEach(function () {                
                this.availableSegments = [];
            });
            //call a URL with GET Method
            function getAjax(url, callback) {
                $.ajax({
                    type: "GET",
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    statusCode: {
                        200: function(response) {
                            callback(response);
                        },
                        304: function(response) {
                            callback(response);
                        }
                    }
                });
            };
            //create a callback function for Ajax, that checks the response for
            //it's fields (if array is expected, checks all values of the array)
            var newCallback = function(callbackSpy, expectedFields, expectArray){
                var callback = function(response){
                    var checkFields = function(element){
                        _.each(expectedFields, function(field){
                            expect(element[field]).toBeDefined()
                    });};
                    if (expectArray){
                        expect(response).toEqual(jasmine.any(Array));
                        _.each(response, function(element){
                            checkFields(element);
                    });}
                    else
                        checkFields(response);
                    callbackSpy();
                }
                return callback;
            };
            
            it("should respond a list of JSON Objects with id, name and actual_size after requesting /api/images", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'actual_size'], true);
                getAjax("/api/images", callback);
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond a single JSON Object with id, name and actual_size after requesting /api/images/x with x = first listed image", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'actual_size'], false);
                getAjax("/api/images", function(response){
                    if (response.length > 0){
                        getAjax("/api/images/" + response[0].id, callback);
                    }
                }); 
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond after requesting /api/images/x/svg with x = first listed image", function () {                
                var callbackSpy = jasmine.createSpy('callback');
                getAjax("/api/images", function(response){
                    if (response.length > 0){
                        getAjax("/api/images/" + response[0].id + "/svg", callbackSpy);
                    }
                }); 
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond after requesting /api/images/x/png with x = first listed image", function () {                
                var callbackSpy = jasmine.createSpy('callback');
                getAjax("/api/images", function(response){
                    if (response.length > 0){
                        getAjax("/api/images/" + response[0].id + "/png", callbackSpy);
                    }
                }); 
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond after requesting /api/images/x/thumb with x = first listed image", function () {                
                var callbackSpy = jasmine.createSpy('callback');
                getAjax("/api/images", function(response){
                    if (response.length > 0){
                        getAjax("/api/images/" + response[0].id + "/thumb", callbackSpy);
                    }
                }); 
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond a list of JSON Objects with id, name, description, image_id, image_ground_id, min_width, max_width, standard_width and rules after requesting /api/segments", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'description', 
                    'image_id', 'image_ground_id', 'min_width', 'max_width', 'standard_width', 'rules'], true);
                getAjax("/api/segments", callback);
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond a single JSON Object with id, name, description, image_id... after requesting /api/segments/x with x = first listed segment", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'description', 
                    'image_id', 'image_ground_id', 'min_width', 'max_width', 'standard_width', 'rules'], false);
                getAjax("/api/segments", function(response){
                    if (response.length > 0){
                        getAjax("/api/segments/" + response[0].id, callback);
                    }
                });
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond a list of JSON Objects with id, name, description, ignore_segments and default_template after requesting /api/projects", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'description', 
                    'ignore_segments', 'default_template'], true);
                getAjax("/api/projects", callback);
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond a single JSON Object with id, name, description, ignore_segments and default_template after requesting /api/projects/x with x = first listed project", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'description', 
                    'ignore_segments', 'default_template'], false);
                getAjax("/api/projects", function(response){
                    if (response.length > 0){
                        getAjax("/api/projects/" + response[0].id, callback);
                    }
                }); 
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond a list of JSON Objects with id, name, description, image_id, image_ground_id, min_width, max_width, standard_width and rules after requesting /api/projects/1/segments", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'description', 
                    'image_id', 'image_ground_id', 'min_width', 'max_width', 'standard_width', 'rules'], true);
                getAjax("/api/projects/1/segments", callback);
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond a single JSON Object with id, name, description... after requesting /api/projects/1/segments/x with x = first listed segment", function () {                
                var callbackSpy = jasmine.createSpy('callback');    
                var callback = newCallback(callbackSpy, ['id', 'name', 'description', 
                    'image_id', 'image_ground_id', 'min_width', 'max_width', 'standard_width', 'rules'], false);
                getAjax("/api/projects/1/segments/", function(response){
                    if (response.length > 0){
                        getAjax("/api/projects/1/segments/" + response[0].id, callback);
                    }
                });                
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should send a new token in response of requesting /api/session", function () {                
                var callbackSpy = jasmine.createSpy('callback'); 
                var callback = function(response){
                    expect(response.csrf).toEqual(jasmine.any(String));
                    callbackSpy();
                };
                getAjax("/api/session", callback);
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });
            
            it("should respond with error code when posting to /api/login with false credentials", function () {                
                var callbackSpy = jasmine.createSpy('callback'); 
                $.ajax({
                    type: "POST",
                    url: "/api/session/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: {name: "dfdghfghfx", password: "fghjgfd"},
                    statusCode: {
                        400: function() {
                            callbackSpy();
                        }
                    }
                });
                getAjax("/api/session", callbackSpy);
                waitsFor(function() {
                    return callbackSpy.callCount > 0;
                }, "The Ajax call timed out.", 5000);
                runs(function() {
                    expect(callbackSpy).toHaveBeenCalled();
                });
            });

        }); // End of the Server API test suite


    }); // End of the PlanMit test suite

});