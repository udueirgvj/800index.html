function openSearch(){
document.getElementById("searchBox").style.display="block";
}

function closeSearch(){
document.getElementById("searchBox").style.display="none";
}

const input = document.getElementById("searchInput");
const results = document.getElementById("results");

input.addEventListener("input", function(){

let name = input.value.trim().toLowerCase();

results.innerHTML="";

if(name.length < 3) return;

// البحث داخل usernames
db.ref("usernames").once("value", snap => {

snap.forEach(child => {

let username = child.key;

if(username.includes(name)){

let div = document.createElement("div");
div.className="userResult";
div.innerHTML="👤 @" + username;

div.onclick = function(){
startChat(username);
};

results.appendChild(div);

}

});

});

});

function startChat(username){

localStorage.setItem("chatWith", username);
document.getElementById("welcome").style.display="none";
document.getElementById("chatPage").style.display="flex";
document.getElementById("chatHeader").innerText="@" + username;

loadMessages(username);
}
