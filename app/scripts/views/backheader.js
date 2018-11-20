/*global pmw*/

pmw.Views = pmw.Views || {};

(function() {
  'use strict';

  pmw.Views.BackheaderView = M.ToolbarView.extend({
    scopeKey: 'pageHeadline'
  }, {

    first: M.ButtonView.extend({
      icon: 'icon-angle-left',
      events: {
        tap: function() {
          pmw.navigate({
            route: backRoute,
            transition: M.PageTransitions.CONST.MOVE_TO_RIGHT_FROM_LEFT
          });
        }
      }
    }),
  });
  /*M.View.extend({
      // The properties of a view

      // The views grid
      grid: 'col-xs-12'
  }, {
      // The childViews as object
      // e.q. button: M.ButtonView.extend({value: 'Test'})
  });*/

})();
