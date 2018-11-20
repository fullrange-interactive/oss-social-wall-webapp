window.fbAsyncInit = function() {
  FB.init({
    appId      : '1381340082121397',
    xfbml      : true,
    version    : 'v2.4'
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

function login() {

  FB.login(function(response) {
  console.log(JSON.stringify(response));
  }, {scope: 'publish_actions'});  
}

function postToMyself() {

  FB.api('/me/feed','post',{message:"Hello myself"},function(response) {
    console.log(JSON.stringify(response));
  });  
    

}

function postToPage() {

  FB.api('/389610781238315/feed','post',{message:"Hello page"},function(response) {
    console.log(JSON.stringify(response));
  });  
    

}  