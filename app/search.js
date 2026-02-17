import { db, auth } from "./firebase.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const searchInput = document.getElementById("searchInput");
const resultsBox = document.getElementById("results");

searchInput.addEventListener("input", async () => {

    let text = searchInput.value.trim().toLowerCase();
    resultsBox.innerHTML = "";

    if(text.length < 1) return;

    try{

        const snapshot = await get(ref(db,"users"));

        if(!snapshot.exists()) return;

        snapshot.forEach((userSnap)=>{

            const user = userSnap.val();

            if(!user.username) return;

            let username = user.username.toLowerCase();

            if(username.includes(text)){

                const div = document.createElement("div");
                div.className = "userResult";
                div.innerText = "@" + user.username;

                div.onclick = ()=>{

                    // حفظ الشخص الذي سيتم مراسلته
                    localStorage.setItem("chatWith", user.uid);
                    localStorage.setItem("chatWithName", user.username);

                    // ⭐ هذا هو الإصلاح الحقيقي لمشكلة 404
                    window.location.href = "../app/index.html";
                };

                resultsBox.appendChild(div);
            }

        });

    }catch(e){
        console.log(e);
    }

});
