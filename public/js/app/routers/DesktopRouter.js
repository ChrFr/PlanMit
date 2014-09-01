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
                this.cleanUp();
                this.view = new Welcome({el: '#mainFrame'});
            },
            
            edit: function() {
                this.cleanUp();
                this.view = new Edit({el: '#mainFrame',
                                    resources: this.resources, 
                                    edition: this.edition,
                                    images: this.images});
            },
            
            admin: function() {
                var user = this.session.get('user');
                if(user && user.superuser){
                    this.resetView();
                    this.view = new Admin({el: '#mainFrame',
                               resources: this.adminResources, 
                               edition: this.adminEdition,
                               images: this.images});
                    }
            },
            
            login: function() {
                this.cleanUp();
                this.view = new Login({el: '#mainFrame',
                                       session: this.session});   
            },
            
            cleanUp: function(view){
		if (this.view) {
                    this.view.unbind();
                    this.view.remove();
                    $(window).off("resize");
                }
                if ($('#mainFrame').length === 0){
                    $(document.createElement('div')).attr('id', 'mainFrame').appendTo('body');
                }
            }

        });

        // Returns the DesktopRouter class
        return DesktopRouter;

    }

);