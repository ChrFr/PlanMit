// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "models/Segments", "views/navbarView",
    "views/welcomeView", "views/editView", "collections/Collection"],

    function($, Backbone, Segments, Navbar, Welcome, Edit, Collection) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                //navbar is always seen
                this.navbar = new Navbar();
                // Tells Backbone to start watching for hashchange events
                Backbone.history.start();
            },

            // All of your Backbone Routes (add more)
            routes: {
                // when there is no hash on the url, the welcome page is called
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