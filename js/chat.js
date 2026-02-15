// ==================== chat.js ====================
let chatListListener = null;

const Chat = {
    currentChatType: null,
    currentChatId: null,
    currentChatUser: null,
    currentChatGroup: null,
    messagesListener: null,
    presenceListeners: {},
    replyToMessage: null,
    forwardMessage: null,

    openChatUI(name, avatarChar, status) {
        document.getElementById('chatName').innerText = name;
        document.getElementById('chatAvatar').innerText = avatarChar;
        document.getElementById('chatStatus').innerText = status;
        document.getElementById('chatRoom').classList.add('open');
    },

    close() {
        document.getElementById('chatRoom').classList.remove('open');
        if (this.messagesListener) this.messagesListener.off();
        Object.values(this.presenceListeners).forEach(listener => listener.off());
        this.presenceListeners = {};
        this.messagesListener = null;
    },

    async startPrivate(uid, username, fullName) {
        if (uid === 'ttdbot') { await TTDBOT.startConversation(this, currentUser, this.sendBotMessage.bind(this)); return; }
        if (uid === 'botmaker') { await BotMaker.startConversation(this, currentUser, this.sendBotMessage.bind(this)); return; }

        this.currentChatType = 'private';
        this.currentChatUser = { uid, username, fullName };
        const ids = [currentUser.uid, uid].sort();
        this.currentChatId = `private_${ids[0]}_${ids[1]}`;
        const statusSnap = await db.ref(`status/${uid}`).once('value');
        const status = statusSnap.val();
        let statusText = (status && status.state === 'online') ? '🟢 متصل' : (status ? `آخر ظهور ${this.timeAgo(status.lastSeen)}` : 'آخر ظهور غير معروف');
        this.openChatUI(fullName, fullName.charAt(0), statusText);
        this.loadPrivateMessages(uid);
        this.presenceListeners[uid] = db.ref(`status/${uid}`).on('value', snap => {
            const s = snap.val();
            document.getElementById('chatStatus').innerText = (s && s.state === 'online') ? '🟢 متصل' : (s ? `آخر ظهور ${this.timeAgo(s.lastSeen)}` : 'آخر ظهور غير معروف');
        });
    },

    timeAgo(timestamp) { /* اختصار */ const seconds = Math.floor((Date.now() - timestamp) / 1000); if (seconds < 60) return 'منذ لحظات'; const minutes = Math.floor(seconds / 60); if (minutes < 60) return `منذ ${minutes} دقيقة`; const hours = Math.floor(minutes / 60); if (hours < 24) return `منذ ${hours} ساعة`; const days = Math.floor(hours / 24); return `منذ ${days} يوم`; },

    loadPrivateMessages() {
        const messagesRef = db.ref(`messages/${this.currentChatId}`);
        this.messagesListener = messagesRef.orderByChild('timestamp').on('value', snap => this.displayMessages(snap));
    },

    loadGroupMessages(groupId) {
        const messagesRef = db.ref(`groupMessages/${groupId}`);
        this.messagesListener = messagesRef.orderByChild('timestamp').on('value', snap => this.displayMessages(snap, true));
    },

    async displayMessages(snapshot, isGroup = false) {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        if (!snapshot.exists()) {
            let userName = this.currentChatUser?.fullName || 'المستخدم';
            let userStatus = document.getElementById('chatStatus')?.innerText || 'آخر ظهور';
            let avatarChar = this.currentChatUser?.fullName?.charAt(0) || '👤';
            this.showEmptyChat(container, userName, userStatus, avatarChar);
            return;
        }
        const messages = [];
        snapshot.forEach(child => messages.push(child.val()));
        messages.sort((a, b) => a.timestamp - b.timestamp);
        for (let msg of messages) {
            const div = document.createElement('div');
            div.className = `message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`;
            div.innerHTML = `<div>${msg.text}</div><div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>`;
            container.appendChild(div);
        }
        container.scrollTop = container.scrollHeight;
    },

    showEmptyChat(container, userName, userStatus, avatarChar) {
        container.innerHTML = `
            <div class="empty-chat-container">
                <div class="empty-chat-avatar">${avatarChar}</div>
                <div class="empty-chat-name">${userName}</div>
                <div class="empty-chat-status">${userStatus}</div>
                <div class="empty-chat-message">ما من رسائل هنا بعد...<br>يمكنك كتابة رسالة.<small>✋ اضغط على أي رسالة للرد</small></div>
            </div>
        `;
    },

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (!text || !this.currentChatId) return;

        if (this.currentChatType === 'bot') { await TTDBOT.handleMessage(text, currentUser, this.sendBotMessage.bind(this)); input.value = ''; return; }
        if (this.currentChatType === 'botmaker') { await BotMaker.handleMessage(text, currentUser, this.sendBotMessage.bind(this)); input.value = ''; return; }
        if (this.currentChatType === 'support' || this.currentChatType === 'support_staff') {
            const supportId = this.currentChatId.replace('support_', '');
            const msg = { messageId: db.ref().push().key, senderId: currentUser.uid, text, timestamp: Date.now() };
            await db.ref(`support/${supportId}/messages/${msg.messageId}`).set(msg);
            input.value = ''; return;
        }
        if (this.currentChatType === 'private') {
            const msg = { messageId: db.ref().push().key, senderId: currentUser.uid, receiverId: this.currentChatUser.uid, text, timestamp: Date.now() };
            await db.ref(`messages/${this.currentChatId}/${msg.messageId}`).set(msg);
        } else {
            const groupId = this.currentChatId.replace('group_', '');
            const groupSnap = await db.ref(`groups/${groupId}`).once('value');
            const group = groupSnap.val();
            if (group.type === 'channel' && group.createdBy !== currentUser.uid) { alert('فقط المالك يمكنه النشر في القناة'); input.value = ''; return; }
            const msg = { messageId: db.ref().push().key, senderId: currentUser.uid, groupId, text, timestamp: Date.now() };
            await db.ref(`groupMessages/${groupId}/${msg.messageId}`).set(msg);
        }
        input.value = '';
    },

    async sendBotMessage(senderId, text) {
        const botMsg = { messageId: db.ref().push().key, senderId, receiverId: currentUser.uid, text, timestamp: Date.now() };
        const path = senderId === 'ttdbot' ? `bot_${currentUser.uid}` : `botmaker_${currentUser.uid}`;
        await db.ref(`messages/${path}/${botMsg.messageId}`).set(botMsg);
        const container = document.getElementById('messagesContainer');
        const div = document.createElement('div');
        div.className = 'message received bot-message';
        div.innerHTML = `<div>${text}</div><div class="message-time">${new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
};

function loadChatList() {
    if (chatListListener) chatListListener.off();
    const uid = currentUser.uid;
    const conversations = new Map();

    chatListListener = db.ref('messages').on('value', (snapshot) => {
        conversations.clear();
        snapshot.forEach(chatSnap => {
            const msgs = chatSnap.val();
            if (msgs && typeof msgs === 'object') {
                Object.values(msgs).forEach(msg => {
                    if (msg.senderId === uid || msg.receiverId === uid) {
                        const otherId = msg.senderId === uid ? msg.receiverId : msg.senderId;
                        if (!conversations.has(otherId) || conversations.get(otherId).timestamp < msg.timestamp) {
                            conversations.set(otherId, { id: otherId, type: 'user', lastMessage: msg.text, timestamp: msg.timestamp });
                        }
                    }
                });
            }
        });
        renderChatList(Array.from(conversations.values()));
    });
}

async function renderChatList(list) {
    const container = document.getElementById('chatListContainer');
    container.innerHTML = '';
    list.sort((a, b) => b.timestamp - a.timestamp);
    for (let item of list) {
        const userSnap = await db.ref('users').orderByChild('uid').equalTo(item.id).once('value');
        if (!userSnap.exists()) continue;
        let user; userSnap.forEach(u => user = u.val());
        const statusSnap = await db.ref(`status/${user.uid}`).once('value');
        const status = statusSnap.val();
        const isOnline = status && status.state === 'online';
        const div = document.createElement('div');
        div.className = 'chat-list-item';
        div.innerHTML = `<div class="chat-avatar" style="position:relative;">${user.photoURL ? `<img src="${user.photoURL}">` : user.fullName.charAt(0)}<span class="${isOnline ? 'online-indicator' : 'offline-indicator'}"></span></div><div class="chat-info"><div class="chat-name"><span>${user.fullName}</span><span class="chat-time">${new Date(item.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span></div><div class="chat-last-msg">${item.lastMessage}</div></div>`;
        div.onclick = () => Chat.startPrivate(user.uid, user.username, user.fullName);
        container.appendChild(div);
    }
    if (list.length === 0) container.innerHTML = '<div style="text-align:center;padding:30px;color:#999;">لا توجد محادثات بعد</div>';
}

window.Chat = Chat;
window.loadChatList = loadChatList;
