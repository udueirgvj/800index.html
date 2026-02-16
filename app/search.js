const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

searchBtn.onclick = () => {
    searchBox.style.display = "block";
    searchInput.focus();
};

function closeSearch(){
    searchBox.style.display = "none";
    results.innerHTML = "";
    searchInput.value = "";
}

/* البحث عند الكتابة */
searchInput.oninput = async () => {

    let username = searchInput.value.trim().toLowerCase();

    if(username.length < 3){
        results.innerHTML = "";
        return;
    }

    // إزالة @ لو كتبها المستخدم
    username = username.replace("@","");

    const snap = await db.ref("usernames/" + username).once("value");

    if(!snap.exists()){
        results.innerHTML = `<div class="userResult">لا يوجد مستخدم</div>`;
        return;
    }

    const uid = snap.val();

    const userSnap = await db.ref("users/" + uid).once("value");
    const user = userSnap.val();

    results.innerHTML = `
        <div class="userResult" onclick="openChat('${uid}','${user.username}')">
        👤 @${user.username}
        </div>
    `;
};
