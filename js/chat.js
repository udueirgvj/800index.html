// ========== وظائف الدردشة المتطورة (مثل تليجرام) ==========
const Chat = {
    currentChatUser: null,
    currentChatId: null,
    currentChatType: 'private', // private, group, channel
    messagesListener: null,
    chatListListener: null,

    // تحميل قائمة المحادثات (دردشات خاصة + مجموعات + قنوات)
    loadChatList() {
        if (!Auth.currentUser) return;
        const conversations = new Map();
        const uid = Auth.currentUser.uid;

        // 1. المحادثات الخاصة
        db.ref('messages').once('value', (snapshot) => {
            snapshot.forEach(chatSnapshot => {
                const chatId = chatSnapshot.key;
                const messages = chatSnapshot.val();
                Object.values(messages).forEach(msg => {
                    if (msg.senderId === uid || msg.receiverId === uid) {
                        const otherId = msg.senderId === uid ? msg.receiverId : msg.senderId;
                        if (!conversations.has(otherId) || conversations.get(otherId).timestamp < msg.timestamp) {
                            conversations.set(otherId, {
                                id: otherId,
                                type: 'private',
                                name: '',
                                lastMessage: msg.text,
                                timestamp: msg.timestamp,
                                unread: false
                            });
                        }
                    }
                });
            });

            // 2. المجموعات والقنوات التي هو عضو فيها
            db.ref('groupMembers').orderByChild('uid').equalTo(uid).once('value', (memberSnapshot) => {
                memberSnapshot.forEach(member => {
                    const groupId = member.key;
                    db.ref(`groups/${groupId}`).once('value', (groupSnap) => {
                        const group = groupSnap.val();
                        if (group) {
                            // آخر رسالة في المجموعة
                            db.ref(`groupMessages/${groupId}`).orderByChild('timestamp').limitToLast(1).once('value', (msgSnap) => {
                                let lastMsg = 'أنشئت حديثاً';
                                let lastTime = group.createdAt;
                                msgSnap.forEach(m => {
                                    lastMsg = m.val().text;
                                    lastTime = m.val().timestamp;
                                });
                                conversations.set(`group_${groupId}`, {
                                    id: groupId,
                                    type: group.type,
                                    name: group.name,
                                    lastMessage: lastMsg,
                                    timestamp: lastTime,
                                    unread: false,
                                    memberCount: group.memberCount || 1
                                });
                                this.renderChatList(Array.from(conversations.values()));
                            });
                        }
                    });
                });
            });
        });
    },

    // عرض قائمة المحادثات
    async renderChatList(chatList) {
        const container = document.getElementById('chatListContainer');
        container.innerHTML = '';

        // ترتيب حسب الأحدث
        chatList.sort((a, b) => b.timestamp - a.timestamp);

        for (let item of chatList) {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-list-item';

            let avatar, name, subtitle;

            if (item.type === 'private') {
                // مستخدم عادي
                const userSnap = await db.ref('users').orderByChild('uid').equalTo(item.id).once('value');
                if (!userSnap.exists()) continue;
                let userData;
                userSnap.forEach(u => userData = u.val());
                name = userData.fullName;
                subtitle = `@${userData.username}`;
                avatar = `<div class="chat-avatar">${userData.fullName.charAt(0)}</div>`;
                chatItem.onclick = () => this.openChat(userData);
            } else {
                // مجموعة أو قناة
                const groupSnap = await db.ref(`groups/${item.id}`).once('value');
                const group = groupSnap.val();
                if (!group) continue;
                name = group.name;
                subtitle = `${group.type === 'channel' ? 'قناة' : 'مجموعة'} · ${item.memberCount || 0} عضو`;
                avatar = `<div class="chat-avatar" style="border-radius: ${group.type === 'channel' ? '12px' : '50%'};">${group.type === 'channel' ? '📢' : '👥'}</div>`;
                chatItem.onclick = () => this.openGroupChat(group);
            }

            const time = new Date(item.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });

            chatItem.innerHTML = `
                ${avatar}
                <div class="chat-info">
                    <div class="chat-name">
                        <span>${name}</span>
                        <span class="chat-time">${time}</span>
                    </div>
                    <div class="chat-last-msg">${item.lastMessage || ''}</div>
                    <div style="font-size: 11px; color: #666;">${subtitle}</div>
                </div>
            `;
            container.appendChild(chatItem);
        }

        if (chatList.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 30px; color: #999;">لا توجد محادثات بعد</div>';
        }
    },

    // فتح دردشة خاصة
    openChat(user) {
        this.currentChatType = 'private';
        this.currentChatUser = {
            uid: user.uid,
            username: user.username,
            fullName: user.fullName,
            photoURL: user.photoURL
        };
        const ids = [Auth.currentUser.uid, user.uid].sort();
        this.currentChatId = `chat_${ids[0]}_${ids[1]}`;
        this._openChatUI(user.fullName, user.photoURL);
        this.loadMessages();
    },

    // فتح مجموعة/قناة
    openGroupChat(group) {
        this.currentChatType = group.type;
        this.currentChatId = `group_${group.id}`;
        this.currentChatGroup = group;
        this._openChatUI(group.name, null, `${group.type === 'channel' ? 'قناة' : 'مجموعة'} · ${group.memberCount || 0} عضو`);
        document.getElementById('memberCountDisplay').innerText = `${group.memberCount || 0} عضو`;
        this.loadGroupMessages(group.id);
    },

    _openChatUI(name, photoURL, status = '') {
        document.getElementById('chatName').innerText = name;
        if (photoURL) {
            document.getElementById('chatAvatar').innerHTML = `<img src="${photoURL}" style="width:100%;height:100%;border-radius:50%;">`;
        } else {
            document.getElementById('chatAvatar').innerHTML = name.charAt(0);
        }
        document.getElementById('chatStatus').innerHTML = status || 'آخر ظهور منذ لحظات';
        document.getElementById('chatRoom').classList.add('open');
    },

    // تحميل رسائل خاصة
    loadMessages() {
        const messagesRef = db.ref(`messages/${this.currentChatId}`);
        this.messagesListener = messagesRef.orderByChild('timestamp').on('value', (snapshot) => {
            this._displayMessages(snapshot);
        });
    },

    // تحميل رسائل مجموعة
    loadGroupMessages(groupId) {
        const messagesRef = db.ref(`groupMessages/${groupId}`);
        this.messagesListener = messagesRef.orderByChild('timestamp').on('value', (snapshot) => {
            this._displayMessages(snapshot, true);
        });
    },

    _displayMessages(snapshot, isGroup = false) {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';

        if (!snapshot.exists()) {
            container.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">أرسل أول رسالة 👋</div>';
            return;
        }

        const messages = [];
        snapshot.forEach(child => messages.push(child.val()));
        messages.sort((a, b) => a.timestamp - b.timestamp);

        messages.forEach(async msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${msg.senderId === Auth.currentUser.uid ? 'sent' : 'received'}`;

            let senderName = '';
            if (isGroup && msg.senderId !== Auth.currentUser.uid) {
                // جلب اسم المرسل
                const userSnap = await db.ref(`users/${msg.senderId}`).once('value');
                const user = userSnap.val();
                senderName = `<div style="font-size: 11px; color: #666; margin-bottom: 4px;">${user?.fullName || 'مستخدم'}</div>`;
            }

            msgDiv.innerHTML = `
                ${senderName}
                <div>${msg.text}</div>
                <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            container.appendChild(msgDiv);
        });

        container.scrollTop = container.scrollHeight;
    },

    // إرسال رسالة (خاصة أو جماعية)
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (!text || !this.currentChatId) return;

        if (this.currentChatType === 'private') {
            // رسالة خاصة
            const messageData = {
                messageId: db.ref().push().key,
                senderId: Auth.currentUser.uid,
                receiverId: this.currentChatUser.uid,
                text,
                timestamp: Date.now()
            };
            await db.ref(`messages/${this.currentChatId}/${messageData.messageId}`).set(messageData);
        } else {
            // رسالة جماعية
            const messageData = {
                messageId: db.ref().push().key,
                senderId: Auth.currentUser.uid,
                groupId: this.currentChatId.replace('group_', ''),
                text,
                timestamp: Date.now()
            };
            await db.ref(`groupMessages/${this.currentChatId.replace('group_', '')}/${messageData.messageId}`).set(messageData);
        }

        input.value = '';
    },

    // إغلاق الدردشة
    closeChat() {
        document.getElementById('chatRoom').classList.remove('open');
        if (this.messagesListener) {
            this.messagesListener.off();
            this.messagesListener = null;
        }
        this.currentChatUser = null;
        this.currentChatId = null;
        this.currentChatGroup = null;
    },

    // إنشاء مجموعة/قناة
    openCreateGroup() {
        document.getElementById('createGroupModal').classList.add('open');
        UI.closeDrawer();
    },

    closeCreateGroup() {
        document.getElementById('createGroupModal').classList.remove('open');
    },

    async createGroup() {
        const name = document.getElementById('groupName').value.trim();
        const type = document.getElementById('groupType').value;
        if (!name) return alert('الرجاء إدخال الاسم');

        const groupId = db.ref().push().key;
        const groupData = {
            id: groupId,
            name,
            type,
            createdBy: Auth.currentUser.uid,
            createdAt: Date.now(),
            memberCount: 1,
            link: `https://t.me/joinchat/${groupId}` // رابط وهمي
        };

        await db.ref(`groups/${groupId}`).set(groupData);
        // إضافة المالك كعضو
        await db.ref(`groupMembers/${groupId}/${Auth.currentUser.uid}`).set({
            uid: Auth.currentUser.uid,
            role: 'owner',
            joinedAt: Date.now()
        });

        this.closeCreateGroup();
        this.openGroupChat(groupData);
    },

    // البحث الشامل (مستخدمين + مجموعات)
    async searchAll() {
        const query = document.getElementById('searchInput').value.trim();
        const resultsDiv = document.getElementById('searchResults');
        if (query.length < 2) {
            resultsDiv.classList.remove('show');
            return;
        }

        let html = '';

        // 1. البحث عن مستخدمين
        const usersSnap = await db.ref('users').once('value');
        usersSnap.forEach(child => {
            const user = child.val();
            if (user.username && user.username.includes(query) && user.uid !== Auth.currentUser.uid) {
                html += `
                    <div class="search-result-item" onclick="Chat.startChatFromSearch('${user.uid}', '${user.username}', '${user.fullName}')">
                        <div class="chat-avatar" style="width: 40px; height: 40px;">${user.fullName.charAt(0)}</div>
                        <div>
                            <div><strong>${user.fullName}</strong></div>
                            <div style="color: #666;">@${user.username}</div>
                        </div>
                    </div>
                `;
            }
        });

        // 2. البحث عن مجموعات/قنوات
        const groupsSnap = await db.ref('groups').once('value');
        groupsSnap.forEach(child => {
            const group = child.val();
            if (group.name.includes(query)) {
                html += `
                    <div class="search-result-item" onclick="Chat.joinGroupFromSearch('${group.id}')">
                        <div class="chat-avatar" style="width: 40px; height: 40px; border-radius: ${group.type === 'channel' ? '8px' : '50%'};">
                            ${group.type === 'channel' ? '📢' : '👥'}
                        </div>
                        <div>
                            <div><strong>${group.name}</strong></div>
                            <div style="color: #666;">${group.type === 'channel' ? 'قناة' : 'مجموعة'} · ${group.memberCount || 0} عضو</div>
                        </div>
                    </div>
                `;
            }
        });

        if (html === '') {
            resultsDiv.innerHTML = '<div style="padding: 12px; color: #999;">لا توجد نتائج</div>';
        } else {
            resultsDiv.innerHTML = html;
        }
        resultsDiv.classList.add('show');
    },

    // بدء محادثة من البحث
    startChatFromSearch(uid, username, fullName) {
        UI.closeSearch();
        this.openChat({ uid, username, fullName, photoURL: '' });
    },

    // الانضمام إلى مجموعة من البحث
    async joinGroupFromSearch(groupId) {
        UI.closeSearch();
        const groupSnap = await db.ref(`groups/${groupId}`).once('value');
        const group = groupSnap.val();
        if (!group) return;

        // التحقق إذا كان عضواً بالفعل
        const memberSnap = await db.ref(`groupMembers/${groupId}/${Auth.currentUser.uid}`).once('value');
        if (!memberSnap.exists()) {
            // إضافة العضو
            await db.ref(`groupMembers/${groupId}/${Auth.currentUser.uid}`).set({
                uid: Auth.currentUser.uid,
                role: 'member',
                joinedAt: Date.now()
            });
            await db.ref(`groups/${groupId}/memberCount`).transaction(current => (current || 0) + 1);
        }

        this.openGroupChat(group);
    },

    // فتح الرسائل المحفوظة
    openSavedMessages() {
        this.openChat({
            uid: Auth.currentUser.uid,
            username: Auth.currentUser.username,
            fullName: 'رسائلي المحفوظة',
            photoURL: Auth.currentUser.photoURL
        });
    }
};

window.Chat = Chat;
