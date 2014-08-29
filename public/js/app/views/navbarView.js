// navbarView.js
// -------
define(["jquery", "backbone", "text!templates/navbar.html"],

    function($, Backbone, template){

        var NavbarView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: ".navbar.navbar-default",

            // View constructor
            initialize: function(options) {
                var _this = this;
                var options = options || {};
                this.session = options.session;
                // Calls the view's render method
                this.render();                
                //change active item if navbar item is clicked
                $('ul.nav > li').click(function (e) {
                    $('ul.nav > li').removeClass('active');
                    $(this).addClass('active');                
                });     
                if (this.session) 
                    this.session.bind("change:user", function(){_this.displayLogin()});
            },

            // View Event Handlers
            events: {

            },

            // Renders the view's template to the UI
            render: function() {         
                this.template = _.template(template, {});
                this.$el.html(this.template);        
                this.$el.find('#admin').hide();
                return this;

            },
            
            displayLogin: function(){
                if (this.session.get('authenticated')){
                    var user = this.session.get('user');
                    this.$el.find('#login').text('Eingeloggt als ' + user.name);   
                    if (user.superuser)
                        this.$el.find('#admin').show();
                    else
                        this.$el.find('#admin').hide();
                }
                else{
                    this.$el.find('#login').text('Einloggen'); 
                    this.$el.find('#admin').hide();
                }
            }

        });

        // Returns the View class
        return NavbarView;

    }

);