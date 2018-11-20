/*global pmw*/

pmw.Controllers = pmw.Controllers || {};

(function() {
  'use strict';

  pmw.Controllers.AbstractController = M.Controller.extend({

    // Contains the current headerView
    headerView: null,

    // Contains the current contentView
    contentView: null,

    // Contains the current menuView
    menuView: null,

    // The headline which will be displayed in the headerView
    pageHeadline: '',

    // Called from the router when the application starts
    applicationStart: function(settings) {
      var _layout = M.SwitchHeaderContentLayout.extend({}).create(this, null, true);
      pmw.setLayout(_layout);
      this._initViews(settings);
    },

    // Called from the router everytime the route/url matchs the controller (binding in main.js)
    show: function(settings) {
      this._initViews(settings);
      var _layout = M.SwitchHeaderContentLayout.extend({}).create(this, null, true);
      if (_layout._type === pmw.getLayout()._type) {
        pmw.getLayout().startTransition();
      } else {
        this.applicationStart();
      }
    },

    // Called for every controller when the application is ready. applicationStart is always called before.
    applicationReady: function() {
      //this.registerToMenu(pmw.router.menuController);
    },

    // This method assign the header and content view to the current layout.
    _applyViews: function() {
      /*if(!this.menuView){
          this.menuView = pmw.Views.MenuView.create(pmw.router.menuController, null, true);
      }*/

      /*pmw.getLayout().applyViews({
          header: this.headerView,
          content: this.contentView,
          menuContent: this.menuView
      });*/
      pmw.getLayout().applyViews({
        header: this.headerView,
        content: this.contentView
      });
      //this.toggleMenu();
    },

    _initViews: function() {
      // OVERRIDE ME PLEASE
    }

    /*registerToMenu: function(){
        // OVERRIDE ME PLEASE
    },*/

    /*toggleMenu: function(){
        if(pmw.getLayout().menu){
            pmw.getLayout().menu.toggle();
        }

    }*/
  });

})();
