const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

/* البحث عند الكتابة */
searchInput.oninput = function(){

let value = searchInput.value.toLowerCase();

results.innerHTML="";

if(value.length < 2) return;

db.ref("users").once("value",snap=>{

snap.forEach(child=>{

let username = child.key;

if(username.includes(value) && username !== currentUser){

let div=document.createElement("div");

div.style.padding="12px";
div.style.background="#1e293b";
div.style.margin="6px 0";
div.style.borderRadius="10px";
div.style.cursor="pointer";

div.innerHTML="👤 "+username;

/* عند الضغط يبدأ محادثة */
div.onclick=function(){
startChat(username);
};

results.appendChild(div);

}

});

});

};
