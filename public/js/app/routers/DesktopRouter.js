// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "views/navbarView",
    "views/welcomeView", "views/editMainView", "views/adminView",
    "collections/SegmentCollection"],

    function($, Backbone, Navbar, Welcome, Edit, Admin, SegmentCollection) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                //load a project
                this.resources = new SegmentCollection();
                this.edition = new SegmentCollection();
                this.adminResources = new SegmentCollection({showAll: true});
                this.adminEdition = new SegmentCollection();
                //navbar is always seen
                this.navbar = new Navbar();
                // Tells Backbone to start watching for hashchange events
                Backbone.history.start();
            },

            // All of your Backbone Routes (add more)
            routes: {
                // when there is no hash on the url, the welcome page is called
                "": "welcome",
                "edit": "edit",
                "admin": "admin"
            },

            welcome: function() {
                new Welcome();
            },
            
            edit: function() {
                new Edit(this.resources, this.edition);
            },
            
            admin: function() {
                new Admin(this.adminResources, this.adminEdition);
            }

        });

        // Returns the DesktopRouter class
        return DesktopRouter;

    }

);