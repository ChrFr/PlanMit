// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "views/navbarView",
    "views/welcomeView", "views/editMainView", "views/adminView",
    "views/loginView", "models/LoginModel",
    "collections/SegmentCollection", "collections/SegmentSource"],

    function($, Backbone, Navbar, Welcome, Edit, Admin, Login,
             LoginModel, SegmentCollection, SegmentSource) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                //load a project
                this.resources = new SegmentSource();
                this.edition = new SegmentCollection();
                this.adminResources = new SegmentSource({showAll: true});
                this.adminEdition = new SegmentCollection();
                this.session = new LoginModel();
                //navbar is always seen
                this.navbar = new Navbar({session: this.session});
                // Tells Backbone to start watching for hashchange events
                Backbone.history.start();
            },

            // All of your Backbone Routes (add more)
            routes: {
                // when there is no hash on the url, the welcome page is called
                "": "welcome",
                "edit": "edit",
                "admin": "admin",
                "login": "login"
            },

            welcome: function() {
                new Welcome();
            },
            
            edit: function() {
                new Edit(this.resources, this.edition);
            },
            
            admin: function() {
                var user = this.session.get('user');
                if(user && user.superuser)
                    new Admin(this.adminResources, this.adminEdition);
            },
            
            login: function() {
                new Login({session: this.session});
            }

        });

        // Returns the DesktopRouter class
        return DesktopRouter;

    }

);