// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "models/Model", "views/welcomeView", 
    "views/editView", "collections/Collection"],

    function($, Backbone, Model, Welcome, Edit, Collection) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                // Tells Backbone to start watching for hashchange events
                Backbone.history.start();
            },

            // All of your Backbone Routes (add more)
            routes: {
                // When there is no hash on the url, the home method is called
                "": "welcome",
                "edit": "edit"
            },

            welcome: function() {
                // Instantiates a new view which will render the header text to the page
                new Welcome();
            },
            
            edit: function() {
                // Instantiates a new view which will render the header text to the page
                new Edit();
            }

        });

        // Returns the DesktopRouter class
        return DesktopRouter;

    }

);