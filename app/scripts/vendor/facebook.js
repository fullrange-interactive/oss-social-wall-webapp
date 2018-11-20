/*
  @author  : Michaël Berthouzoz
  @date    : 2014-05-08
  @version : 1.0
*/

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1381340082121397',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.0' // use version 2.0
  });
};

// Load javascript sdk
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);

}(document, 'script', 'facebook-jssdk'));

// Post to the wall
function postToWall() {
    console.log('Post img to wall');
    var current = this;
    var blob;
    var imageData = canvas.toDataURL("image/png");
    try{
        blob = dataURItoBlob(imageData);
    }catch(e){  
        console.log(e);
    }
    FB.login(function(response) {
      if (response.status === 'connected') {
        var authToken = FB.getAuthResponse()['accessToken'];
        var fd = new FormData();
        fd.append("access_token", authToken);
        fd.append("source", blob);
        fd.append("message","Mon dessin sur Pimp My Wall #Baleinev");
        try{
            $.ajax({
                url:"https://graph.facebook.com/me/photos?access_token=" + authToken,
                type:"POST",
                data:fd,
                processData:false,
                contentType:false,
                cache:false,
                success:function(data){
                    console.log("success " + data);
                    FB.api('/me', function(response) {
                        $.ajax({
                            url:"http://baleinev.ch:8000/facebook",
                              type:"POST",
                            data: response,
                            done: function(data) {
                              console.log(data);
                            }
                      });
                    });
                },
                error:function(shr,status,data){
                    console.log("error " + data + " Status " + shr.status);
                }
            });

        }catch(e){console.log(e);}
      } else {
        console.log('ERROR: getLoginStatus');
      }
    }, {scope: "public_profile,publish_actions,offline_access,user_status,publish_stream,user_photos,photo_upload"});

    //$('#messageBoxSocial').dialog('close');
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' })
};