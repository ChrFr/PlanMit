// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "views/navbarView",
    "views/welcomeView", "views/editMainView", "collections/SegmentSource", "collections/SegmentEdition"],

    function($, Backbone, Navbar, Welcome, Edit, SegmentSource, SegmentEdition) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                //load a project
                this.resources = new SegmentSource();
                this.edition = new SegmentEdition();
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
                new Edit(this.resources, this.edition);
            }

        });

        // Returns the DesktopRouter class
        return DesktopRouter;

    }

);