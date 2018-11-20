/*global pmw*/

pmw.Controllers = pmw.Controllers || {};

(function(global) {
  'use strict';

  var loader = null;
  var imageUploaded = false;

  var ctx = null;

  function drawImageIOSFix(ctx, img) {
    // $(".share-instagram .user-photo-big img").attr("src", photoUrl);

    var vertSquashRatio = detectVerticalSquash(img)
    var arg_count = arguments.length
    switch (arg_count) {
      case 4:
        ctx.drawImage(img, arguments[2], arguments[3] / vertSquashRatio);
        break
      case 6:
        ctx.drawImage(img, arguments[2], arguments[3], arguments[4], arguments[5] / vertSquashRatio);
        break
      case 8:
        ctx.drawImage(img, arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7] / vertSquashRatio);
        break
      case 10:
        ctx.drawImage(img, arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9] / vertSquashRatio);
        break
    }

    // Detects vertical squash in loaded image.
    // Fixes a bug which squash image vertically while drawing into canvas for some images.
    // This is a bug in iOS6 (and IOS7) devices. This function from https://github.com/stomita/ios-imagefile-megapixel
    function detectVerticalSquash(img) {
      var iw = img.naturalWidth,
        ih = img.naturalHeight
      var canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = ih
      var ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      var data = ctx.getImageData(0, 0, 1, ih).data
        // search image edge pixel position in case it is squashed vertically.
      var sy = 0,
        ey = ih,
        py = ih
      while (py > sy) {
        var alpha = data[(py - 1) * 4 + 3]
        if (alpha === 0) { ey = py } else { sy = py }
        py = (ey + sy) >> 1
      }
      var ratio = (py / ih)
      return (ratio === 0) ? 1 : ratio
    }
  }

  // Detect file input support for choosing a photo or taking a picture
  // Known bad players: 
  //   - Windows Phone 7 and 8.0 (8.1 is okay)
  //   - Some very old android 2 versions
  var isFileInputSupported = function() {
    // Handle devices which falsely report support
    if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
      return false;
    }
    // Create test element
    var el = document.createElement("input");
    el.type = "file";
    return !el.disabled;
  }

  var getOS = function () {
    var info = new MobileDetect(window.navigator.userAgent);
    return info.os();
  }

  // Detect FormData support for uploading files asynchronously
  // Known bad players: 
  //   - Android 2.x
  //   - Windows Phone 7 and 8.0 (no shit?)
  var isFormDataSupported = function() {
    if (typeof(global.FormData) == "undefined") {
      return false;
    }
    return true;
  }

  // Detect 
  var isFileReaderSupported = function() {
    var info = new MobileDetect(window.navigator.userAgent);
    if (info.phone() == "HTC") {
      console.log("HTC piece of shit, disabling file reader.")
      return false;
    }
    if (info.phone() == "Samsung") {
      console.log("Samsung piece of shit, disabling file reader.");
      return false;
    }
    if (typeof(global.FileReader) == "undefined") {
      return false;
    }
    return true;
  }

  var modalAlert = function(text, hideOk, callback) {
    if (hideOk) {
      $(".ok-button").hide();
    } else {
      $(".ok-button").show();
    }
    $(".modal-alert-text").html(text);
    $(".modal-alert-container").addClass("shown");
    if (callback) {
      $(".ok-button .button").bind("tap", function() {
        callback();
        $(".ok-button .button").unbind("tap")
      })
    } else {
      $(".ok-button .button").unbind("tap");
      $(".ok-button .button").bind("tap", function() {
        $(".modal-alert-container").removeClass("shown");
      });
    }
  }


  pmw.Controllers.PostController = pmw.Controllers.AbstractController.extend({

    tmpViews: null,

    /*registerMenuItem: function( menuEntry ){
        this._initMenu();
        console.log(menuEntry);
        this.tmpViews.add(menuEntry);
    },*/

    _initViews: function() {

      //Init the collection
      //this._initMenu();

      // Create the menuView with the controller (this) as scope
      if (!this.contentView) {
        this.contentView = pmw.Views.PostView.create(this, null, true);
      }

      // Create the HeaderView with the controller (this) as scope
      if (!this.headerView) {
        this.headerView = M.ToolbarView.extend({
          grid: 'col-md-12',
          value: 'Chargement...'
        }).create();
      }

      this._applyViews();

      ctx = $("#scratch-canvas").get()[0].getContext("2d");
      ctx.canvas.width = pmw.options.maxImageWidth;
      ctx.canvas.height = pmw.options.maxImageHeight;

      $('.post-block').show();

      $(".page-post .add-image").prepend('<input type="file" capture="camera" accept="image/*" id="add-image-field">');

      $("#add-image-field").on("change", this.uploadImage.bind(this));
      $("#remove-photo").on('click tap', this.removePreviewImage.bind(this));

      this.checkAllFields();
    },

    sendPost: function (e) {
      if (!this.checkAllFields()) {
        return false;
      }

      var sendData = {
        username: this.contentView.childViews.area.childViews.username.getValue(),
        text: this.contentView.childViews.area.childViews.text.getValue()
      }
      var company = this.contentView.childViews.area.childViews.company.getValue();
      if (company.length !== 0) {
        sendData.company = company;
      }

      if (this.image) {
        sendData.media = {
          type: 'image',
          url: this.image
        }
      }

      $.post(global.pmw.options.serverUrl + "/webapp/" + global.pmw.options.eventId,
        sendData,
        function onPostComplete(data) {
          loader.hide();
          modalAlert("Merci!<br>Votre message sera visible sur le mur dès que notre équipe l'aura validé.");
          $("input, textarea").val('');
          this.removePreviewImage();
          if (global.pmw.eventInfo.displayParameters.showWallOnWebappPost) {
            window.location = global.pmw.options.serverUrl + '/wall/wall.html?host=localhost&port=8000&event=' + global.pmw.options.eventId + '&iframe=1';
          }
        }.bind(this)
      ).fail(function(data) {
          if (loader)
            loader.hide();
          if (data.responseText)  {
            alert(data.responseText);
            return;
          }
          alert("Une erreur s'est produite (connexion au serveur impossible), mais ce n'est pas de votre faute! Merci d'essayer plus tard.")
        }
      );
      loader = M.LoaderView.create().render().show();
    },

    checkAllFields: function() {
      var ok = true;
      ok &= this.internalCheckField(this.contentView.childViews.area.childViews.username);
      ok &= this.internalCheckField(this.contentView.childViews.area.childViews.text);
      // ok &= this.internalCheckField(this.contentView.childViews.participateForm.childViews.phone);
      // ok &= this.internalCheckField(this.contentView.childViews.participateForm.childViews.email);
      if (ok) {
        this.contentView.childViews.area.childViews.submit.enable();
        return true;
        // this.contentView.childViews.participateForm.childViews.submitInstagram.enable();
      } else {
        this.contentView.childViews.area.childViews.submit.disable();
        return false;
      }
    },

    checkField: function(event, sender) {
      if (event.which == 13) {
        if (sender.$el.next().find("input").length != 0)
          sender.$el.next().find("input").focus();
        else {
          sender.$el.find("input").blur();
          console.log("blur " + sender.$el.find("input"));
        }
      }
      sender.usedOnce = true;
      this.checkAllFields();
    },

    internalCheckField: function(sender) {
      if (!sender.getValue().trim().match(sender.regexp)) {
        if (sender.usedOnce)
          sender.$el.addClass("wrong");
        return false;
      } else {
        sender.$el.removeClass("wrong");
        return true;
      }
    },

    uploadImageDone: function(controller, e, noExif) {
      console.log("Read photo");
      //Load the photo as an image
      var img = new Image();
      img.onload = function() {
        if (loader != null)
          loader.hide();

        //The photo was successfully loaded
        if (!noExif) {
          EXIF.getData(img, function() {
            var imgWidth = ctx.canvas.width;
            var imgHeight = ctx.canvas.height;

            var orientation = EXIF.getTag(img, "Orientation");
            if (navigator.userAgent.match(/Windows Phone/i)) {
              // Fuck you Windows Phone 8 and your fucked up
              // EXIF rotation
              switch (orientation) {
                case 2:
                  // horizontal flip
                  ctx.translate(imgWidth, 0);
                  ctx.scale(-1, 1);
                  break;
                case 3:
                  // 180° rotate left
                  ctx.translate(imgWidth, imgHeight);
                  ctx.rotate(Math.PI);
                  break;
                case 4:
                  // vertical flip
                  ctx.translate(0, imgHeight);
                  ctx.scale(1, -1);
                  break;
                case 5:
                  // vertical flip + 90 rotate right
                  ctx.rotate(-0.5 * Math.PI);
                  ctx.scale(1, -1);
                  break;
                case 6:
                  // 90° rotate right
                  ctx.rotate(-0.5 * Math.PI);
                  ctx.translate(0, -imgHeight);
                  break;
                case 7:
                  // horizontal flip + 90 rotate right
                  ctx.rotate(-0.5 * Math.PI);
                  ctx.translate(imgWidth, -imgHeight);
                  ctx.scale(-1, 1);
                  break;
                case 8:
                  // 90° rotate left
                  ctx.rotate(0.5 * Math.PI);
                  ctx.translate(-imgWidth, 0);
                  break;
              }
            } else {
              switch (orientation) {
                case 2:
                  // horizontal flip
                  ctx.translate(imgWidth, 0);
                  ctx.scale(-1, 1);
                  break;
                case 3:
                  // 180° rotate left
                  ctx.translate(imgWidth, imgHeight);
                  ctx.rotate(Math.PI);
                  break;
                case 4:
                  // vertical flip
                  ctx.translate(0, imgHeight);
                  ctx.scale(1, -1);
                  break;
                case 5:
                  // vertical flip + 90 rotate right
                  ctx.rotate(0.5 * Math.PI);
                  ctx.scale(1, -1);
                  break;
                case 6:
                  // 90° rotate right
                  ctx.rotate(0.5 * Math.PI);
                  ctx.translate(0, -imgHeight);
                  break;
                case 7:
                  // horizontal flip + 90 rotate right
                  ctx.rotate(0.5 * Math.PI);
                  ctx.translate(imgWidth, -imgHeight);
                  ctx.scale(-1, 1);
                  break;
                case 8:
                  // 90° rotate left
                  ctx.rotate(-0.5 * Math.PI);
                  ctx.translate(-imgWidth, 0);
                  break;
              }
            }
          })
        }

        var w = img.width;
        var h = img.height;
        var r = w / h;
        var ox = 0;
        var oy = 0;
        var ow = img.width;
        var oh = img.height;

        if (w > ctx.canvas.width) {
          w = ctx.canvas.width;
          h = w / r
        }
        if (h > ctx.canvas.height) {
          h = ctx.canvas.height;
          w = h * r;
        }
        console.log("w = " + w + " h = " + h)

        ctx.canvas.width = w;
        ctx.canvas.height = h;

        var os = getOS();
        if (os == "iOS") {
          console.log("ios drawimage")
          drawImageIOSFix(ctx, this, ox, oy, ow, oh, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
          console.log("other drawimage")
          ctx.drawImage(this, ox, oy, ow, oh, 0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        console.log("imageUploaded = " + imageUploaded)
        if (!imageUploaded) {
          controller.sendImage()
        } else {
          this.showPreviewImage();
          return;
        }

      }
      img.src = this.result;
    },

    abort: function() {
      alert("Opération annulée.");
    },

    error: function(e) {
      if (loader != null)
        loader.hide();
      alert("Il y a eu une erreur, merci d'essayer plus tard. Erreur: " + e)
    },

    uploadImage: function(element) {
      console.log('e')
      var imagePicker = element.target;

      if (!imagePicker.files || imagePicker.files.length == 0) {
        alert("Vous devez choisir ou prendre une photo!");
        return;
      }

      if (false) {
        //FileReader available, resize
        var reader = new global.FileReader();
        reader.onabort = this.abort;
        reader.onerror = this.error;
        reader.onload = this.uploadImageDone.bind(reader, this);

        reader.readAsDataURL(imagePicker.files[0]);
        loader = M.LoaderView.create().render();
        this.bindForceClose();
      } else {
        // FileReader not available
        // TODO : Upload the file without resizing
        var fd = new FormData();
        var that = this;

        loader = M.LoaderView.create().render().show();
        this.bindForceClose();
        fd.append("image", imagePicker.files[0]);
        $.ajax({
          url: global.pmw.options.serverUrl + "/webapp/" + global.pmw.options.eventId,
          type: "post",
          data: fd,
          processData: false,
          contentType: false
        }).done(function(data) {
          if (data.error) {
            alert(data.error);
          }
          loader.hide();
          imageUploaded = true;
          that.image = data.url;
          that.showPreviewImage();
          loader.hide(true);

        }).fail(function(data) {
          console.log(data);
          if (loader)
            loader.hide();
          if (data.responseText)  {
            alert(data.responseText);
            return;
          }
          alert("Une erreur s'est produite (connexion au serveur impossible), mais ce n'est pas de votre faute! Merci d'essayer plus tard.")
        });
      }
    },

    sendImage: function() {
      var that = this;
      if (!imageUploaded) {
        var base64Data = ctx.canvas.toDataURL('image/jpeg', 1);
        var format = "jpeg";
        if (base64Data.substring(0, 30).indexOf("image/png") != -1) {
          format = "png";
        }
        loader = M.LoaderView.create().render().show();
        this.bindForceClose();
        $.post(global.pmw.options.serverUrl + "/webapp/" + global.pmw.options.eventId, {
            base64Image: base64Data,
            imageFormat: format
          }, function(data) {
            if (loader != null)
              loader.hide();
            if (data.error) {
              alert(data.error);
              return;
            }
            that.image = data.url;
            that.showPreviewImage();
          })
          .fail(function() {
            if (loader != null)
              loader.hide();
            alert("Une erreur s'est produite ... mais ce n'est pas de votre faute! Veuillez ressayer plus tard.")
          });
        // data:image/png;
      }
    },

    showPreviewImage: function () {
      console.log('HEE');
      console.log('this.image = ' + global.pmw.options.serverUrl + this.image)
      $('.page-post .image-preview').css('backgroundImage', "url('" + global.pmw.options.serverUrl + this.image + "')");
      $('.page-post .image-preview').slideDown(300);
      $('.page-post .add-image .button [data-binding="value"]').text("Changer la photo");
    },

    removePreviewImage: function () {
      $('.page-post .image-preview').slideUp(300);
      $('.page-post .add-image .button [data-binding="value"]').text("Ajouter une photo");
      this.image = null;
      imageUploaded = false;
    },
  
    bindForceClose: function() {
      $(".loaderview .view").on("tap mousedown", function(e) {
        if (loaderTouchStart == null) {
          loaderTouchStart = (new Date()).getTime();
          return false;
        }
        if ((new Date()).getTime() - loaderTouchStart > loaderOffTime) {
          loaderTouchStart = null;
          return;
        }
        console.log("remove")
        this.forceCloseLoader();
      }.bind(this));
    },

    forceCloseLoader: function() {
      console.log(loader);
      if (loader != null) {
        loader.hide();
      }
    },

    closeModalAlert: function(){
        $(".modal-alert-container").removeClass("shown");
    },

  });

})(this);
