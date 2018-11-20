/*global pmw*/

pmw.Views = pmw.Views || {};

(function() {
  'use strict';

  pmw.Views.PostView = M.View.extend({
    cssClass: 'page-post',
    template: '<div id="fb-root"></div>'
  }, {

    // The childViews as object
    area: M.View.extend({
      cssClass: 'post-block container-fluid'
    }, {
      helpText: M.TextView.extend({
        value: "Publiez instantanément un message sur le mur. Nos modérateurs devront le valider."
      }),
      username: M.TextfieldView.extend({
        label: 'Votre nom:',
        type: 'text',
        required: true,
        id: 'username',
        cssClass: 'required',
        regexp: /(.{2,})/,
        events: {
          keyup: 'checkField'
        }
      }),
      company: M.TextfieldView.extend({
        label: 'Entreprise:',
        type: 'text',
        regexp: /(.+)/,
        required: false,
        id: 'company'
      }),
      text: M.TextareaView.extend({
        label: 'Message:',
        cssClass: 'text-box',
        id: 'text',
        cssClass: 'required',
        regexp: /(.{2,})/,
        events: {
          keyup: 'checkField'
        }
      }),
      imagePreview: M.View.extend({
        useElement: YES,
        template: '<div class="image-preview"><button class="btn btn-md btn-inverse" id="remove-photo">X</button></div>'
      }),
      imageUpload: M.ButtonView.extend({
        icon: "icon-camera",
        cssClass: "add-image",
        value: "Ajouter une photo"
      }),
      submit: M.ButtonView.extend({
        value: 'Envoyer',
        events: {
          tap: 'sendPost'
        }
      }),
      scratchCanvas: M.View.extend({
          useElement: YES,
          template: '<canvas id="scratch-canvas"></canvas>'
      }),
    }),
    modalContainer: M.View.extend({
        cssClass: 'modal-alert-container'
    }, {
        modalWindow: M.View.extend({
            cssClass: 'modal-alert-window'
        }, {
            text: M.View.extend({
                cssClass: 'modal-alert-text'
            }),
            okButton: M.ButtonView.extend({
                value: 'OK',
                cssClass: 'ok-button',
                events: {
                    tap: "closeModalAlert"
                }
            })
        })
    }), 
  });

})();
