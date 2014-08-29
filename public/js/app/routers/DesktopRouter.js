// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "views/navbarView",
    "views/welcomeView", "views/editMainView", "views/adminView",
    "views/loginView", "models/LoginModel",
    "collections/SegmentCollection", "collections/SegmentSource",
    "collections/ImageCollection"],

    function($, Backbone, Navbar, Welcome, Edit, Admin, Login,
             LoginModel, SegmentCollection, SegmentSource, ImageCollection) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                //load a project
                var _this = this;
                this.session = new LoginModel();
                this.resources = new SegmentSource();
                this.edition = new SegmentCollection();
                this.images = new ImageCollection();
                this.images.fetch();
                this.adminResources = new SegmentSource({showAll: true});
                this.adminEdition = new SegmentCollection();
                //navbar is always seen
                this.navbar = new Navbar({session: this.session});
                // Tells Backbone to start watching for hashchange events
                Backbone.history.start();
            },

            // Backbone Routes (call: domain/#route)
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
                new Edit({resources: this.resources, 
                          edition: this.edition,
                          images: this.images});
            },
            
            admin: function() {
                var user = this.session.get('user');
                if(user && user.superuser)
                    new Admin({resources: this.adminResources, 
                               edition: this.adminEdition,
                               images: this.images});
            },
            
            login: function() {
                new Login({session: this.session});
            }

        });

        // Returns the DesktopRouter class
        return DesktopRouter;

    }

);