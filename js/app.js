// ==================== app.js ====================
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) window.location.href = 'index.html';

const userStatusRef = db.ref(`/status/${currentUser.uid}`);
const connectedRef = db.ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
        userStatusRef.set({ state: 'online', lastSeen: Date.now() });
        userStatusRef.onDisconnect().set({ state: 'offline', lastSeen: Date.now() });
    }
});

const UI = {
    toggleDrawer() { document.getElementById('drawer').classList.toggle('open'); document.getElementById('drawerOverlay').classList.toggle('open'); },
    closeDrawer() { document.getElementById('drawer').classList.remove('open'); document.getElementById('drawerOverlay').classList.remove('open'); },
    toggleSearch() { document.getElementById('searchBar').classList.toggle('show'); },
    openCreateModal() { document.getElementById('createModal').classList.add('open'); },
    closeCreateModal() { document.getElementById('createModal').classList.remove('open'); },
    openCountersMenu() { document.getElementById('countersMenu').classList.add('open'); },
    closeCountersMenu() { document.getElementById('countersMenu').classList.remove('open'); },
    countersAction(action) { alert(`قيد التطوير: ${action}`); this.closeCountersMenu(); },
    showSettings(type) { if (type === 'counters') this.openCountersMenu(); else alert(`إعدادات ${type}`); this.closeDrawer(); },
    updateDrawerInfo() {
        document.getElementById('drawerFullName').innerText = currentUser.fullName;
        document.getElementById('drawerUsername').innerText = '@' + currentUser.username;
        const avatarDiv = document.getElementById('drawerAvatar');
        if (currentUser.photoURL) avatarDiv.innerHTML = `<img src="${currentUser.photoURL}" alt="avatar">`; else avatarDiv.innerHTML = '👤';
    },
    changePhoto() { alert('تغيير الصورة قيد التطوير'); },
    editName() {
        const newName = prompt('الاسم الجديد:', currentUser.fullName);
        if (newName && newName.trim()) { currentUser.fullName = newName.trim(); localStorage.setItem('currentUser', JSON.stringify(currentUser)); db.ref(`users/${currentUser.uid}/fullName`).set(newName.trim()); this.updateDrawerInfo(); }
        this.closeDrawer();
    },
    editUsername() { alert('تغيير اسم المستخدم قيد التطوير'); this.closeDrawer(); },
    toggleDarkMode() { document.body.classList.toggle('dark-mode'); this.closeDrawer(); },
    closeProfile() { document.getElementById('profileModal').classList.remove('open'); },
    closeForwardModal() { document.getElementById('forwardModal').classList.remove('open'); },
    openProfileFromChat() { if (Chat.currentChatType === 'private' && Chat.currentChatUser) this.showProfile(Chat.currentChatUser.uid); },
    async showProfile(uid) { alert('الملف الشخصي قيد التطوير'); }
};

const Auth = {
    logout() {
        userStatusRef.remove();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};

const Search = {
    async handle() {
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        const resultsDiv = document.getElementById('searchResults');
        if (query.length < 2) { resultsDiv.classList.remove('show'); return; }
        let html = '';
        const usersSnap = await db.ref('users').once('value');
        usersSnap.forEach(child => {
            const u = child.val();
            if (u.username && u.username.toLowerCase().includes(query) && u.uid !== currentUser.uid) {
                html += `<div class="search-result-item" onclick="Chat.startPrivate('${u.uid}', '${u.username}', '${u.fullName}')"><div class="chat-avatar">${u.fullName.charAt(0)}</div><div><strong>${u.fullName}</strong><br><span style="color:#666;">@${u.username}</span></div></div>`;
            }
        });
        if ('ttdbot'.includes(query)) html += `<div class="search-result-item" onclick="Chat.startPrivate('ttdbot', 'ttdbot', 'TTDBOT')"><div class="chat-avatar" style="background:#2196f3;">🤖</div><div><strong>TTDBOT</strong><span class="verified-badge">موثق</span><br><span style="color:#666;">@ttdbot</span></div></div>`;
        if ('botmaker'.includes(query)) html += `<div class="search-result-item" onclick="Chat.startPrivate('botmaker', 'botmaker', 'BotMaker')"><div class="chat-avatar" style="background:#9c27b0;">🤖</div><div><strong>BotMaker</strong><span style="background:#9c27b0; color:white; padding:2px 6px; border-radius:12px;">صانع البوتات</span><br><span style="color:#666;">@botmaker</span></div></div>`;
        if ('volunteer support'.includes(query)) html += `<div class="search-result-item" onclick="Support.startSupportChat()"><div class="chat-avatar" style="background:#4caf50;">🎧</div><div><strong>فريق الدعم</strong><span class="support-badge">دعم</span><br><span style="color:#666;">@volunteer support</span></div></div>`;
        resultsDiv.innerHTML = html || '<div style="padding:12px; color:#999;">لا توجد نتائج</div>';
        resultsDiv.classList.add('show');
    }
};
document.getElementById('searchInput').addEventListener('keyup', Search.handle);

const Channel = { open() { alert('قناة المطور: سيتم فتحها قريباً'); } };

window.addEventListener('load', () => {
    document.querySelectorAll('.modal').forEach(el => el.classList.remove('open'));
    document.getElementById('drawer')?.classList.remove('open');
    document.getElementById('drawerOverlay')?.classList.remove('open');
    document.getElementById('searchBar')?.classList.remove('show');
    UI.updateDrawerInfo();
    loadChatList();
});
