// ==================== bot.js ====================
// هذا الملف يحتوي على كل منطق البوتات (TTDBOT و BotMaker)
// يمكن تطويره بشكل منفرد دون التأثير على باقي التطبيق

// ========== كائن TTDBOT (البوت الرسمي الموثق) ==========
const TTDBOT = {
    async startConversation(chatObj, currentUser, db, sendMessageCallback) {
        chatObj.currentChatType = 'bot';
        chatObj.currentChatId = `bot_${currentUser.uid}`;
        chatObj.currentChatUser = { uid: 'ttdbot', username: 'ttdbot', fullName: 'TTDBOT' };
        chatObj.openChatUI('TTDBOT', '🤖', '🟢 دعم تطوير');
        
        const container = document.getElementById('messagesContainer');
        container.innerHTML = `
            <div class="message received bot-message">
                <div>👋 مرحباً! أنا البوت الرسمي لتلرفيب.</div>
                <div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div class="message received bot-message">
                <div>📌 أرسل /start لبدء إنشاء بوت جديد.</div>
                <div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
        `;
    },

    async handleMessage(text, currentUser, db, sendMessageCallback) {
        const botStateRef = db.ref(`botState/${currentUser.uid}`);
        const snap = await botStateRef.once('value');
        let state = snap.val() || { step: 'idle' };
        let reply = '';

        if (text === '/start') {
            state = { step: 'awaiting_name' };
            reply = '🤖 أرسل الاسم الذي تريده للبوت:';
        } else if (state.step === 'awaiting_name') {
            state = { step: 'awaiting_username', name: text };
            reply = `الاسم "${text}" تم حفظه.\nالآن أرسل اسم المستخدم للبوت (يجب أن ينتهي بـ "bot"):`;
        } else if (state.step === 'awaiting_username') {
            const username = text;
            if (!username.endsWith('bot')) {
                reply = '❌ اسم المستخدم يجب أن ينتهي بـ "bot". حاول مرة أخرى:';
            } else if (!/^[A-Za-z][A-Za-z0-9_]{4,19}$/.test(username)) {
                reply = '❌ اسم المستخدم غير صالح (5-20 حرف، يبدأ بحرف). حاول مرة أخرى:';
            } else {
                const check = await db.ref('usernames').child(username).once('value');
                if (check.exists()) {
                    reply = '❌ اسم المستخدم مستخدم بالفعل. اختر اسماً آخر:';
                } else {
                    // إنشاء توكن
                    const token = this.generateToken();
                    reply = `✅ تم إنشاء البوت بنجاح!\nالاسم: ${state.name}\nاسم المستخدم: @${username}\nالتوكن: ${token}\n\nاحتفظ بهذا التوكن لاستخدام البوت.`;
                    
                    // حفظ البوت في قاعدة البيانات
                    await db.ref(`bots/${username}`).set({
                        name: state.name,
                        username,
                        token,
                        type: 'basic', // نوع أساسي
                        owner: currentUser.uid,
                        createdAt: Date.now(),
                        verified: false // غير موثق
                    });
                    await db.ref(`usernames/${username}`).set('bot_' + username);
                    state = { step: 'idle' };
                }
            }
        } else {
            state = { step: 'awaiting_name' };
            reply = '👋 أرسل /start لبدء إنشاء بوت.';
        }

        await botStateRef.set(state);
        await sendMessageCallback('ttdbot', reply);
    },

    generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
};
// ========== كائن BotMaker (صانع البوتات المتقدم) ==========
const BotMaker = {
    async startConversation(chatObj, currentUser, db, sendMessageCallback) {
        chatObj.currentChatType = 'botmaker';
        chatObj.currentChatId = `botmaker_${currentUser.uid}`;
        chatObj.currentChatUser = { uid: 'botmaker', username: 'botmaker', fullName: 'BotMaker' };
        chatObj.openChatUI('BotMaker', '🛠️', '🟢 متصل');

        const container = document.getElementById('messagesContainer');
        container.innerHTML = `
            <div class="message received bot-message">
                <div>👋 مرحباً! أنا صانع البوتات المتقدم.</div>
                <div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div class="message received bot-message">
                <div>📋 اختر نوع البوت الذي تريد إنشاءه:</div>
                <div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div class="message received bot-message">
                <div>1️⃣ بوت حماية للمجموعات<br>2️⃣ بوت ردود تلقائية<br>3️⃣ بوت تذكير<br>4️⃣ بوت رشق (تصويت)</div>
                <div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div class="message received bot-message">
                <div>✨ سيطلب منك التوكن الذي حصلت عليه من @ttdbot</div>
                <div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
        `;
        
        // تهيئة حالة البوت
        await db.ref(`botMakerState/${currentUser.uid}`).set({ step: 'awaiting_choice' });
    },

    async handleMessage(text, currentUser, db, sendMessageCallback) {
        const stateRef = db.ref(`botMakerState/${currentUser.uid}`);
        const snap = await stateRef.once('value');
        let state = snap.val() || { step: 'awaiting_choice' };
        let reply = '';

        // مرحلة اختيار النوع
        if (state.step === 'awaiting_choice') {
            const choice = parseInt(text);
            let type = '';
            if (choice === 1) type = 'حماية';
            else if (choice === 2) type = 'ردود';
            else if (choice === 3) type = 'تذكير';
            else if (choice === 4) type = 'رشق';
            else {
                reply = '❌ اختيار غير صالح. الرجاء اختيار رقم من 1 إلى 4.';
                await sendMessageCallback('botmaker', reply);
                return;
            }
            state = { step: 'awaiting_token', type: type };
            reply = `اخترت: بوت ${type}\nالآن أرسل **التوكن** الذي حصلت عليه من @ttdbot:`;
            await stateRef.set(state);
            await sendMessageCallback('botmaker', reply);
            return;
        }

        // مرحلة إدخال التوكن
        if (state.step === 'awaiting_token') {
            const token = text.trim();
            // البحث عن البوت باستخدام التوكن
            const botsSnap = await db.ref('bots').once('value');
            let foundBot = null;
            let foundUsername = null;
            botsSnap.forEach(child => {
                const bot = child.val();
                if (bot.token === token) {
                    foundBot = bot;
                    foundUsername = child.key;
                }
            });

            if (!foundBot) {
                reply = '❌ توكن غير صالح. تأكد من التوكن وحاول مرة أخرى.';
                await sendMessageCallback('botmaker', reply);
                return;
            }

            // تحديث البوت بنوعه الجديد وجعله موثقاً (دعم تطوير)
            await db.ref(`bots/${foundUsername}`).update({
                type: state.type,
                verified: true,
                upgradedAt: Date.now()
            });

            // إنشاء معرف مختصر للبوت (مثل @username)
            const botLink = `@${foundUsername}`;

            reply = `✅ تم ترقية بوتك بنجاح!\nالنوع: ${state.type}\nالاسم: ${foundBot.name}\nرابط البوت: ${botLink}\n\nيمكنك الآن استخدام البوت بالضغط على الرابط أعلاه.`;
            
            // إعادة تعيين الحالة
            await stateRef.set({ step: 'idle' });
            await sendMessageCallback('botmaker', reply);
            return;
        }

        // إذا كانت الحالة idle أو أي شيء آخر
        reply = '👋 أرسل /start للبدء.';
        await sendMessageCallback('botmaker', reply);
    }
};

// تصدير الكائنات للاستخدام في الملفات الأخرى
window.TTDBOT = TTDBOT;
window.BotMaker = BotMaker;
