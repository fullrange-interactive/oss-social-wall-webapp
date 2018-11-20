pmw.Modules = pmw.Modules || {};

(function(global) {
  'use strict';

  var Styler = function Styler(event, callback) {
    this.setDisplayParameters(event.displayParameters);

    $(".toolbarview .center").text(event.name);
    document.title = event.name;
  };

  Styler.prototype.setDisplayParameters = function(displayParameters) {

    var keysAction = {
      'logo': [{
        elem: '.header .toolbarview .center:before',
        prop: 'backgroundImage',
        trans: function(v) {
          return 'url("' + pmw.options.serverUrl + v + '")';
        }
      }],
      'backgroundImage': [{
        elem: 'body',
        prop: 'backgroundImage',
        trans: function(v) {
          return 'url("' + pmw.options.serverUrl + v + '")';
        }
      }],
      'colors': {
        'text': [
          {
            elem: 'body, .textview',
            prop: 'color'
          }
        ],
        'background': [
          {
            elem: '.item header .source',
            prop: 'color'
          }, {
            elem: '#selected',
            prop: 'backgroundColor'
          }, {
            elem: '.item .pinned',
            prop: 'color'
          }, {
            elem: '.item header .author .author_photo',
            prop: 'color'
          }, {
            elem: 'body',
            'prop': 'backgroundColor'
          }, {
            elem: '.button, .buttonview.active .button, .btn-inverse, .buttonview.disabled .button',
            prop: 'backgroundColor'
          }, {
            elem: '.button, .buttonview.disabled .button',
            prop: 'borderColor'
          }
        ],
        'border': [
          {
            elem: '.item .content-inner',
            prop: 'borderColor'
          }
        ],
        'content': [{
            elem: '.post-block, .view .modal-alert-window',
            prop: 'backgroundColor'
          }, {
            elem: '.button, .buttonview.active .button, .btn-inverse, .buttonview.disabled .button',
            prop: 'color'
          }
        ],
        'titleBackground': [{
          elem: '.header, .toolbarview',
          prop: 'backgroundColor'
        }],
        'titleText': [{
          elem: '.toolbarview .center',
          prop: 'color'
        }]
      }
    };

    var setStyle = function(prefix, array) {

      for (var i in array) {
        if (typeof(array[i]) == 'object') {
          setStyle(prefix.concat([i]), array[i]);
        } else {
          var keysIndex = keysAction;
          var value = array[i];

          for (var j = 0; j < prefix.length; j++)
            keysIndex = keysIndex[prefix[j]];

          var params = keysIndex[i];


          for (var i in params) {
            var valueTrans = value;
            if (params[i].hasOwnProperty('trans'))
              valueTrans = params[i].trans(value);

            if (params[i].hasOwnProperty('prop')) {
              var prop = {};

              prop[params[i].prop] = valueTrans;
              jss.set(params[i].elem, prop);
            }
          }
        }
      }
    }

    jss.remove();

    setStyle([], displayParameters);
  };

  global.pmw.Modules.Styler = Styler;
})(this);
