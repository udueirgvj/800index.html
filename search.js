import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const input = document.getElementById("searchInput");
const results = document.getElementById("results");

// اسم المستودع (GitHub repo name)
const repo = window.location.pathname.split("/")[1];

input.addEventListener("input", async () => {

    let value = input.value.trim().toLowerCase();
    results.innerHTML = "";

    if(value.length < 1) return;

    const snapshot = await get(ref(db,"users"));

    if(!snapshot.exists()) return;

    snapshot.forEach(child => {

        const user = child.val();
        if(!user.username) return;

        if(user.username.toLowerCase().includes(value)){

            const div = document.createElement("div");
            div.className = "userResult";
            div.innerText = "@" + user.username;

            div.onclick = () => {

                localStorage.setItem("chatWith", user.uid);
                localStorage.setItem("chatWithName", user.username);

                // ⭐ التحويل الصحيح حسب اسم المشروع
                window.location.href = "/" + repo + "/app/index.html";
            };

            results.appendChild(div);
        }

    });

});
