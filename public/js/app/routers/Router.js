// DesktopRouter.js
// ----------------
define(["jquery", "backbone", "views/NavbarView",
    "views/WelcomeView", "views/EditMainView",
    "views/LoginView", "views/ProjectView", "models/LoginModel",
    "collections/SegmentCollection", "collections/ImageCollection",
    "collections/ProjectCollection"],

    function($, Backbone, Navbar, Welcome, Edit, Login, Projects,
             LoginModel, SegmentCollection, ImageCollection, ProjectCollection) {

        var DesktopRouter = Backbone.Router.extend({
            
            initialize: function() {
                //router keeps track of session and edition, so they 
                //stay the same, if you switch Views
                this.session = new LoginModel();
                this.edition = new SegmentCollection();                
                this.projects = null;
                
                //images are kept here, so they don't need to be reloaded on view-change
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
                "login": "login",
                "projects": "chooseProject"
            },

            welcome: function() {                
                this.cleanUp();
                this.view = new Welcome({el: '#mainFrame'});
            },
            
            edit: function() {   
                if(!this.edition.project){
                    alert('Sie müssen zuerst ein Projekt auswählen!');
                    this.navigate("#projects", {trigger: true});
                }
                else{
                    //show editor with edition currently worked on
                    this.cleanUp();       
                    this.view = new Edit({
                        el: '#mainFrame',
                        edition: this.edition,
                        images: this.images,
                        session: this.session
                    });
                }
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
                this.view = new Login({
                    el: '#mainFrame',
                    session: this.session});   
            },
            
            chooseProject: function() {                    
                var _this = this;
                //no projects loaded yet -> load projects and show project view
                //AFTER the projects finished loading
                if(!this.projects){
                    this.blocked = true;
                    this.projects = new ProjectCollection();
                    this.projects.fetch({success: function(){ 
                        _this.blocked = false;  
                        _this.showProjects();
                    }});
                }
                //show editor with edition currently worked on
                else if (!this.blocked)
                    this.showProjects();
            },
            
            showProjects: function(){
                this.cleanUp();  
                this.view = new Projects({
                    el: '#mainFrame',
                    collection: this.projects,
                    edition: this.edition
                });   
            },
            
                        
            cleanUp: function(){
		if (this.view) {
                    this.view.close();
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