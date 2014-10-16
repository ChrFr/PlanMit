// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "views/navbarView",
    "views/welcomeView", "views/editMainView",
    "views/loginView", "models/LoginModel",
    "collections/SegmentCollection",
    "collections/ImageCollection"],

    function($, Backbone, Navbar, Welcome, Edit, Login,
             LoginModel, SegmentCollection, ImageCollection) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                //router keeps track of session, project and edition, so they 
                //stay the same, if you switch Views
                this.session = new LoginModel();
                this.edition = null;
                this.images = new ImageCollection();
                this.images.fetch();
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
                "login": "login"
            },

            welcome: function() {                
                this.cleanUp();
                this.view = new Welcome({el: '#mainFrame'});
            },
            
            edit: function() {     
                var _this = this;
                //no edition loaded yet -> load default project and show editor
                //AFTER the default finished loading
                if(!this.edition){
                    this.blocked = true;
                    this.edition = new SegmentCollection();
                    this.edition.fetch({success: function(){ 
                        _this.blocked = false;  
                        _this.showEditMain();
                    }});
                }
                //show editor with edition currently worked on
                else if (!this.blocked)
                    this.showEditMain();
            },
            
            showEditMain: function(){ 
                this.cleanUp();       
                this.view = new Edit({
                    el: '#mainFrame',
                    edition: this.edition,
                    images: this.images,
                    session: this.session
                });
            },
            
            login: function() {
                this.cleanUp();                
                this.view = new Login({el: '#mainFrame',
                                       session: this.session});   
            },
            
            cleanUp: function(){
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