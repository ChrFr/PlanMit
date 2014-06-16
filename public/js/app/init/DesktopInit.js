// DesktopInit.js
// --------------

// Includes Desktop Specific JavaScript files here (or inside of your Desktop router)
require(["jquery", "backbone", "routers/DesktopRouter",
    "jqueryui", "bootstrap", "backbone.validateAll"],

  function($, Backbone, DesktopRouter) {
    //change active item if navbar item is clicked
    $('ul.nav > li').click(function (e) {
            $('ul.nav > li').removeClass('active');
            $(this).addClass('active');                
    });     
    // Instantiates a new Desktop Router instance
    new DesktopRouter();

  }

);