// ========== نسخة ثابتة ومستقرة تماماً - بدون تكرار ==========
const Chat = {
    currentChatUser: null,
    currentChatId: null,
    messagesListener: null,
    chatListListener: null,
    isListenerActive: false, // لمنع تكرار المستمعين

    // ===== تحميل قائمة المحادثات (مرة واحدة فقط) =====
    loadChatList() {
        if (!Auth.currentUser) return;
        
        // إلغاء أي مستمع قديم قبل إنشاء جديد
        if (this.chatListListener) {
            this.chatListListener.off();
            this.chatListListener = null;
        }

        const uid = Auth.currentUser.uid;
        const messagesRef = db.ref('messages');

        this.chatListListener = messagesRef.on('value', (snapshot) => {
            const conversations = new Map();
            
            snapshot.forEach(chatSnapshot => {
                const messages = chatSnapshot.val();
                // التأكد من أن messages هو كائن وليس null
                if (messages && typeof messages === 'object') {
                    Object.values(messages).forEach(msg => {
                        // التأكد من أن msg يحتوي على الحقول المطلوبة
                        if (msg && msg.senderId && msg.receiverId && msg.text && msg.timestamp) {
                            if (msg.senderId === uid || msg.receiverId === uid) {
                                const otherId = msg.senderId === uid ? msg.receiverId : msg.senderId;
                                const existing = conversations.get(otherId);
                                if (!existing || existing.timestamp < msg.timestamp) {
                                    conversations.set(otherId, {
                                        userId: otherId,
                                        lastMessage: msg.text,
                                        timestamp: msg.timestamp,
                                        messageId: msg.messageId // للتأكد من عدم التكرار
                                    });
                                }
                            }
                        }
                    });
                }
            });

            // تحويل الخريطة إلى مصفوفة وترتيبها
            const chatList = Array.from(conversations.values())
                .sort((a, b) => b.timestamp - a.timestamp);
            
            this.renderChatList(chatList);
        });
    },

    // ===== عرض قائمة المحادثات =====
    async renderChatList(chatList) {
        const container = document.getElementById('chatListContainer');
        if (!container) return;
        
        // مسح المحتوى القديم بشكل كامل
        container.innerHTML = '';

        if (chatList.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 30px; color: #999;">لا توجد محادثات بعد</div>';
            return;
        }

        // استخدام Promise.all لجلب جميع بيانات المستخدمين مرة واحدة
        const userPromises = chatList.map(async (item) => {
            const userSnap = await db.ref('users').orderByChild('uid').equalTo(item.userId).once('value');
            if (userSnap.exists()) {
                let userData;
                userSnap.forEach(u => userData = u.val());
                return { item, userData };
            }
            return null;
        });

        const results = await Promise.all(userPromises);
        
        results.forEach(result => {
            if (!result) return;
            const { item, userData } = result;
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-list-item';
            chatItem.onclick = () => this.openChat(userData);

            // الصورة الرمزية
            const avatar = document.createElement('div');
            avatar.className = 'chat-avatar';
            avatar.innerText = userData.fullName.charAt(0).toUpperCase();

            // تنسيق الوقت
            const time = new Date(item.timestamp).toLocaleTimeString('ar', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            // معلومات المحادثة
            const info = document.createElement('div');
            info.className = 'chat-info';
            info.innerHTML = `
                <div class="chat-name">
                    <span>${userData.fullName}</span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-last-msg">${item.lastMessage || '🗣️ أرسل رسالة'}</div>
                <div style="font-size: 11px; color: #666;">@${userData.username}</div>
            `;

            chatItem.appendChild(avatar);
            chatItem.appendChild(info);
            container.appendChild(chatItem);
        });
    },

    // ===== فتح محادثة مع مستخدم =====
    openChat(user) {
        if (!user || !user.uid) return;
        
        this.currentChatUser = {
            uid: user.uid,
            username: user.username,
            fullName: user.fullName,
            photoURL: user.photoURL || ''
        };

        const ids = [Auth.currentUser.uid, user.uid].sort();
        this.currentChatId = `chat_${ids[0]}_${ids[1]}`;

        // تحديث واجهة الدردشة
        document.getElementById('chatName').innerText = user.fullName;
        const avatarEl = document.getElementById('chatAvatar');
        if (user.photoURL) {
            avatarEl.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;">`;
        } else {
            avatarEl.innerText = user.fullName.charAt(0).toUpperCase();
        }
        document.getElementById('chatStatus').innerHTML = 'آخر ظهور منذ لحظات';
        document.getElementById('chatRoom').classList.add('open');
        
        this.loadMessages();
    },

    // ===== إغلاق المحادثة =====
    closeChat() {
        document.getElementById('chatRoom').classList.remove('open');
        if (this.messagesListener) {
            this.messagesListener.off();
            this.messagesListener = null;
        }
        this.currentChatUser = null;
        this.currentChatId = null;
    },

    // ===== تحميل رسائل المحادثة =====
    loadMessages() {
        if (!this.currentChatId) return;
        
        // إلغاء المستمع القديم إن وجد
        if (this.messagesListener) {
            this.messagesListener.off();
            this.messagesListener = null;
        }

        const messagesRef = db.ref(`messages/${this.currentChatId}`);
        
        this.messagesListener = messagesRef.orderByChild('timestamp').on('value', (snapshot) => {
            const container = document.getElementById('messagesContainer');
            if (!container) return;
            
            container.innerHTML = '';

            if (!snapshot.exists()) {
                container.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">أرسل أول رسالة 👋</div>';
                return;
            }

            const messages = [];
            snapshot.forEach(child => {
                const msg = child.val();
                if (msg && msg.text && msg.timestamp) {
                    messages.push(msg);
                }
            });
            
            messages.sort((a, b) => a.timestamp - b.timestamp);

            messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.className = `message ${msg.senderId === Auth.currentUser.uid ? 'sent' : 'received'}`;
                msgDiv.innerHTML = `
                    <div>${msg.text}</div>
                    <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
                `;
                container.appendChild(msgDiv);
            });

            // التمرير لآخر رسالة
            container.scrollTop = container.scrollHeight;
        });
    },

    // ===== إرسال رسالة =====
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (!text || !this.currentChatId || !this.currentChatUser) return;

        const messageData = {
            messageId: db.ref().push().key,
            senderId: Auth.currentUser.uid,
            receiverId: this.currentChatUser.uid,
            text: text,
            timestamp: Date.now()
        };

        try {
            await db.ref(`messages/${this.currentChatId}/${messageData.messageId}`).set(messageData);
            input.value = ''; // تفريغ الحقل
        } catch (error) {
            console.error('فشل الإرسال:', error);
            alert('فشل في إرسال الرسالة');
        }
    },

    // ===== فتح الرسائل المحفوظة =====
    openSavedMessages() {
        this.openChat({
            uid: Auth.currentUser.uid,
            username: Auth.currentUser.username,
            fullName: 'رسائلي المحفوظة',
            photoURL: Auth.currentUser.photoURL
        });
    },

    // ===== البحث عن مستخدمين =====
    async searchUsers() {
        const query = document.getElementById('searchInput').value.trim();
        const resultsDiv = document.getElementById('searchResults');
        
        if (query.length < 2) {
            resultsDiv.classList.remove('show');
            return;
        }

        try {
            const snapshot = await db.ref('users').once('value');
            const users = [];
            
            snapshot.forEach(child => {
                const user = child.val();
                if (user && user.username && user.uid !== Auth.currentUser.uid) {
                    if (user.username.toLowerCase().includes(query.toLowerCase())) {
                        users.push(user);
                    }
                }
            });

            if (users.length === 0) {
                resultsDiv.innerHTML = '<div style="padding: 12px; color: #999;">لا يوجد مستخدمين</div>';
            } else {
                let html = '';
                users.slice(0, 5).forEach(user => {
                    html += `
                        <div class="search-result-item" onclick="Chat.startChatFromSearch('${user.uid}', '${user.username}', '${user.fullName}')">
                            <div class="chat-avatar" style="width: 40px; height: 40px;">${user.fullName.charAt(0).toUpperCase()}</div>
                            <div>
                                <div><strong>${user.fullName}</strong></div>
                                <div style="color: #666; font-size: 12px;">@${user.username}</div>
                            </div>
                        </div>
                    `;
                });
                resultsDiv.innerHTML = html;
            }
            resultsDiv.classList.add('show');
        } catch (error) {
            console.error('خطأ في البحث:', error);
        }
    },

    // ===== بدء محادثة من نتائج البحث =====
    startChatFromSearch(uid, username, fullName) {
        UI.closeSearch();
        this.openChat({ uid, username, fullName, photoURL: '' });
    },

    // ===== تنظيف المستمعين (يستدعى عند تسجيل الخروج) =====
    cleanUp() {
        if (this.chatListListener) {
            this.chatListListener.off();
            this.chatListListener = null;
        }
        if (this.messagesListener) {
            this.messagesListener.off();
            this.messagesListener = null;
        }
    }
};

window.Chat = Chat;
