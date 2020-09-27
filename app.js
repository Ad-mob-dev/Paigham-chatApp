// global variables
var currentUser = "";
var currentUserEmail = "";
var chatkey = "";
var friendKey = "";
var keysforUser = "";
var userRecId = "";
var pass;
var lkey;
var msgKey;
// firebaseConfig Obj
var firebaseConfig = {
  apiKey: "AIzaSyB_8yB39rAtWgjkgWEFEXka1POkQ2-HGuU",
  authDomain: "paigham-70c67.firebaseapp.com",
  databaseURL: "https://paigham-70c67.firebaseio.com",
  projectId: "paigham-70c67",
  storageBucket: "paigham-70c67.appspot.com",
  messagingSenderId: "296660374072",
  appId: "1:296660374072:web:87f6811c895d1c26b9cccd",
  measurementId: "G-2DPJJPLFHX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


function logOut() {
  firebase.auth().signOut().then(function () {
    alert("Sign-out successful");
    window.location.replace("index.html");
  }).catch(function (error) {
    alert(error.message);
  });
}

// login With Google
function logInGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider).then(function (result) {
    var user = {
      'name': result.user.displayName,
      'email': result.user.email,
      'Googleid': result.user.uid,
      'photo': result.user.photoURL,
    }

    var userRef = firebase.database().ref('users');
    userRecId = userRef.child(result.user.uid).set(user);


  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    alert(errorMessage);
  });
}

// auth state change
firebase.auth().onAuthStateChanged(function (user) {
  var loginForm = document.getElementById('loginform');
  var menu = document.getElementById('menu');
  var fchatlistdiv = document.getElementById('fchatlistdiv');

  if (user) {
    currentUser = firebase.auth().currentUser.uid;
    currentUserEmail = user.email;
    loginForm.style.display = "none";
    menu.style.display = "block";
    fchatlistdiv.style.display = "block";
    dispUserInfo(user);
    dispflist();
    alert("welcome");

  } else {

  }
});

// nav open &close 
//  Open when someone clicks on the span element 
var val;
function openNav(e) {
  document.getElementById("myNav").style.width = "100%";
  e.style.display = "none";
  val = e;
}

//  Close when someone clicks on the "x" symbol inside the overlay 
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
  val.style.display = "inline-block";
}

// display userinfo in menu 
var dispUserInfo = (user) => {
  var userimage = document.getElementById('userimage');
  var username = document.getElementById('username');
  var userlogout = document.getElementById('userlogout');

  var img = document.createElement("img");
  var span = document.createElement("span");
  span.innerHTML = `<strong class='text-white' id='stUser'> ${user.displayName} </strong>`;
  img.src = user.photoURL;
  img.id = "img";
  img.title = user.email;
  username.appendChild(span);
  userimage.appendChild(img);
  img.style.borderRadius = "100%";
  img.style.width = "80px";
  img.style.height = "80px";
  img.style.padding = "10px";
  userlogout.innerHTML += `<img onclick= logOut() src='assets/logout.png' title='Log Out' width='40px' height='35px' id='logoutbtn'>`;

}

// friend_list -- Modal 
firebase.database().ref("users").on("value", function (data) {
  document.getElementById('chatbox').style.display = "none";
  data.forEach(function (user) {
    user = user.val();

    if (user.email !== currentUserEmail) {
      var chatlist = document.getElementById('chatlist');
      var li = document.createElement('li');
      var img = document.createElement('img');
      var nam = document.createElement('strong');
      var chatbtn = document.createElement('button');
      li.id = "modallistitem";
      img.id = "modalimg";
      nam.id = "modalnam";
      chatbtn.id = "modalchatbtn";
      li.className = "list-unstyled list-group-item list-group-item-action";
      img.src = user.photo;
      img.className = "img-fluid";
      img.title = user.email;
      img.alt = user.Googleid;
      img.style = 'border-radius:100%';
      nam.innerHTML = user.name;
      chatbtn.className = "btn btn-outline-primary";
      chatbtn.innerText = "Add Friend";
      chatbtn.onclick = function chat(friendKey, friendName, friendPhoto) {
        var fchatlistdiv = document.getElementById('fchatlistdiv').style.display = "block";
        var fphoto = document.getElementById('fphoto');
        var fname = document.getElementById('fname');
        var datadismissmodal = document.getElementsByClassName('close')[0].click();
        closeNav();

        friendKey = user.Googleid;
        friendName = user.name;
        friendPhoto = user.photo;

        fphoto.src = friendPhoto;
        fname.innerHTML = friendName;

        var userKey = firebase.auth().currentUser.uid;
        var friendlist = {
          "fid": friendKey,
          "uid": userKey,
        }

        var flag = false;
        // vice versa add the record to list if false and if already in data then skip - (to avoid redudant data)
        firebase.database().ref("friendlist").on('value', function (friends) {
          friends.forEach(function (data) {
            var user = data.val();
            if ((user.fid === friendlist.fid && user.uid === friendlist.uid) || (user.fid === friendlist.uid && user.uid === friendlist.fid)) {
              flag = true;
              pass = function passKey() {
                return data.key;
              };

            }

          });

          if (flag === false) {
            chatkey = firebase.database().ref("friendlist").push(friendlist).getKey();
            console.log("if" + "---" + chatkey);
          } else if (flag == true) {
            chatbtn.style.display = "none";
            chatkey = pass();
            console.log(chatkey);

          }
        });
      };
      li.appendChild(img);
      li.appendChild(nam);
      li.appendChild(chatbtn);
      chatlist.appendChild(li);
    }

  });

});


function dispflist() {
  var ul = document.getElementById("friendchatlist");
  ul.innerHTML = " ";
  // fetch friendlist by user id = curr user
  firebase.database().ref("friendlist").on("value", function (data) {

    if (data.hasChildren()) {
      var li = `<li class="mb-2"><input type="search" id="searchbox" class="w-100" placeHolder="Search Friend"/> </li>`;
      ul.innerHTML = li;
    }else{
      var li = `<li><p>No Friend Added please go to Users in Menu & add Friends</p></li>`;
      ul.innerHTML = li;
    }
    var fk = "";
    data.forEach(function (list) {
      if (list.val().uid === currentUser) {
        fk = list.val().fid;
        firebase.database().ref("users").child(fk).on('value', function (user) {
          var data = user.val();
          console.log(user);
          var data = user.val();
          li = `<li onclick="sendMsg('${list.key}','${data.name}','${data.photo}')" title="click to see chat" class="p-2 list-group-item-action list-group-item" style=" cursor:pointer display-flex">
          <img src="${data.photo}" width="30px" height="30px" alt="${data.email}" title="${data.name}"><small>${data.name}</small></li>`;
          ul.innerHTML += li;
        });

      }
      else if (list.val().fid === currentUser) {
        fk = list.val().uid;
        firebase.database().ref("users").child(fk).on('value', function (user) {
          var data = user.val();
          li = `<li onclick="sendMsg('${list.key}','${data.name}','${data.photo}')" title="click to see chat" class="p-2 list-group-item-action list-group-item" style=" cursor:pointer display-flex">
          <img src="${data.photo}" width="30px" height="30px" alt="${data.email}" title="${data.name}"><small>${data.name}</small></li>`;
          ul.innerHTML += li;
        });
      }


    });

  });
}
function sendMsg(chatkey, friend, photo) {
  document.getElementById('fchatlistdiv').style.display = "none";
  document.getElementById('chatbox').style.display = "block";
  var sendbtn = document.getElementById('sendbtn');
  var msginp = document.getElementById('msg');
  var fphoto = document.getElementById('fphoto');
  var fname = document.getElementById('fname');
  var msgchatlist = document.getElementById('msgchatlist');
  fname.innerHTML = friend;
  fphoto.src = photo;
  msgchatlist.innerHTML = "";
  dispchat(chatkey, photo);
  sendbtn.onclick = () => {
    var chatMsg = {
      text: msginp.value,
      time: new Date().toLocaleString(),
      userid: currentUser
    }
    if (msginp.value !== "") {
      firebase.database().ref("chatMessages").child(chatkey).push(chatMsg);
      msginp.value = "";
    } else {
      alert("please type something to send");
    }

  }

}

function dispchat(chatkey, photo) {
  firebase.database().ref("chatMessages").child(chatkey).on('child_added', function (data) {
    var msgchatlist = document.getElementById('msgchatlist');
    var key = chatkey;
    var con = data.val();
    var div = document.createElement('div');
    var img = document.createElement("img");
    var p = document.createElement('small');
    var spandiv = document.createElement('div');
    var span = document.createElement('span');
    var del = document.createElement('button');

    if (con.userid === currentUser) {
      div.className = "mb-2 pt-3 pb-1 bg-success col-md-12 sender";
      img.src = firebase.auth().currentUser.photoURL;
      img.style.width = "35px";
      img.style.height = "35px";
      img.style.borderRadius = "100%";
      img.className = "img-fluid ml-2";
      p.innerHTML = con.text;
      p.className = "ml-2";
      spandiv.className = "d-flex justify-content-end mr-3";
      span.innerHTML = con.time;
      span.style.fontSize = "10px";
      span.className = "mt-1 justify-content-end";
      del.innerHTML = '&times';
      del.className = "float-right mr-3 p-2 btn btn-sm text-white delbtn";
      del.title = "Delete Message";
      del.id = "delbutton";
      del.onclick = function ax(e) {
        e = this;
        deleteMsg(e, chatkey);
      };
      div.appendChild(img);
      div.appendChild(p);
      div.appendChild(del);
      spandiv.appendChild(span);
      div.appendChild(spandiv);
    } else if (con.userid !== currentUser) {
      div.className = "mb-2 pt-3 pb-1 bg-dark col-md-12 reciever";
      img.src = photo;
      img.style.width = "35px";
      img.style.height = "35px";
      img.className = "img-fluid ml-2";
      img.style.borderRadius = "100%";
      p.innerHTML = con.text;
      p.className = "ml-2";
      spandiv.className = "d-flex justify-content-end mr-3";
      span.innerHTML = con.time;
      span.style.fontSize = "10px";
      span.className = "mt-1 justify-content-end";
      del.innerHTML = '&times';
      del.className = "float-right mr-3 p-2 btn btn-sm text-white delbtn";
      del.title = "Delete Message";
      del.id = "delbutton";
      del.onclick = function ax(e) {
        e = this;
        deleteMsg(e, chatkey);
      }
      div.appendChild(img);
      div.appendChild(p);
      div.appendChild(del);
      spandiv.appendChild(span);
      div.appendChild(spandiv);
    }
    msgchatlist.appendChild(div);
    scrolldown();

  });
}

function changebtn() {
  var msg = document.getElementById('msg').value;

  if (msg === "") {
    document.getElementById('sendbtn').innerHTML = "Send";
  } else {
    document.getElementById('sendbtn').innerHTML = "<i class='fa fa-send'></i>";
  }

}

function revertbtn(event) {
  if (event.keyCode === 13) {
    document.getElementById('sendbtn').click();
  }
}

function back() {
  document.getElementById("chatbox").style.display = "none";
  document.getElementById("fchatlistdiv").style.display = "block";
}

function scrolldown() {
  let height = document.body.scrollHeight;
  document.documentElement.scrollTop = height;
}
// delete msg
function deleteMsg(e, chatkey) {
  var photo = e.parentNode.childNodes[0].src;
  var ktext = e.parentNode.childNodes[1].innerHTML;
  var msgRef = firebase.database().ref("chatMessages").child(chatkey).orderByChild('text').equalTo(ktext);
  msgRef.once('value', function (data) {
    msgKey = data.node_.children_.root_.key;
  });
  firebase.database().ref("chatMessages").child(chatkey).child(msgKey).remove().then(function () {
    alert("message Deleted");
    document.getElementById("msgchatlist").innerHTML = "";
    dispchat(chatkey,photo);
    scrolldown();
  }).catch(function (error) {
    alert("Error : " + error.message);
  })

}
