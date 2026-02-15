// ==================== bots.js ====================
const TTDBOT = {
    async startConversation(chatObj, currentUser, sendMessageCallback) {
        chatObj.currentChatType = 'bot';
        chatObj.currentChatId = `bot_${currentUser.uid}`;
        chatObj.currentChatUser = { uid: 'ttdbot', username: 'ttdbot', fullName: 'TTDBOT' };
        chatObj.openChatUI('TTDBOT', '🤖', '🟢 دعم تطوير');
        document.getElementById('messagesContainer').innerHTML = `
            <div class="message received bot-message"><div>👋 مرحباً! أنا البوت الرسمي.</div><div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div></div>
            <div class="message received bot-message"><div>📌 أرسل /start لبدء إنشاء بوت جديد.</div><div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div></div>
        `;
    },

    async handleMessage(text, currentUser, sendMessageCallback) {
        const botStateRef = db.ref(`botState/${currentUser.uid}`);
        const snap = await botStateRef.once('value');
        let state = snap.val() || { step: 'idle' };
        let reply = '';

        if (text === '/start') {
            state = { step: 'awaiting_name' };
            reply = '🤖 أرسل الاسم الذي تريده للبوت:';
        } else if (state.step === 'awaiting_name') {
            state = { step: 'awaiting_username', name: text };
            reply = `الاسم "${text}" تم حفظه.\nالآن أرسل اسم المستخدم (ينتهي بـ "bot"):`;
        } else if (state.step === 'awaiting_username') {
            const username = text;
            if (!username.endsWith('bot')) reply = '❌ اسم المستخدم يجب أن ينتهي بـ "bot". حاول مرة أخرى:';
            else if (!/^[A-Za-z][A-Za-z0-9_]{4,19}$/.test(username)) reply = '❌ اسم المستخدم غير صالح (5-20 حرف). حاول مرة أخرى:';
            else {
                const check = await db.ref('usernames').child(username).once('value');
                if (check.exists()) reply = '❌ اسم المستخدم مستخدم بالفعل. اختر اسماً آخر:';
                else {
                    const token = this.generateToken();
                    reply = `✅ تم إنشاء البوت!\nالاسم: ${state.name}\n@${username}\nالتوكن: ${token}`;
                    await db.ref(`bots/${username}`).set({ name: state.name, username, token, owner: currentUser.uid, createdAt: Date.now() });
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
        for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
        return token;
    }
};

const BotMaker = {
    async startConversation(chatObj, currentUser, sendMessageCallback) {
        chatObj.currentChatType = 'botmaker';
        chatObj.currentChatId = `botmaker_${currentUser.uid}`;
        chatObj.currentChatUser = { uid: 'botmaker', username: 'botmaker', fullName: 'BotMaker' };
        chatObj.openChatUI('BotMaker', '🛠️', '🟢 متصل');
        document.getElementById('messagesContainer').innerHTML = `
            <div class="message received bot-message"><div>👋 مرحباً! أنا صانع البوتات.</div><div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div></div>
            <div class="message received bot-message"><div>📋 اختر نوع البوت:</div><div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div></div>
            <div class="message received bot-message"><div>1️⃣ حماية | 2️⃣ ردود | 3️⃣ تذكير | 4️⃣ رشق</div><div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div></div>
            <div class="message received bot-message"><div>✨ سيطلب منك التوكن من @ttdbot</div><div class="message-time">${new Date().toLocaleTimeString('ar', {hour:'2-digit',minute:'2-digit'})}</div></div>
        `;
        await db.ref(`botMakerState/${currentUser.uid}`).set({ step: 'awaiting_choice' });
    },

    async handleMessage(text, currentUser, sendMessageCallback) {
        const stateRef = db.ref(`botMakerState/${currentUser.uid}`);
        const snap = await stateRef.once('value');
        let state = snap.val() || { step: 'awaiting_choice' };
        let reply = '';

        if (state.step === 'awaiting_choice') {
            const choice = parseInt(text);
            let type = '';
            if (choice === 1) type = 'حماية';
            else if (choice === 2) type = 'ردود';
            else if (choice === 3) type = 'تذكير';
            else if (choice === 4) type = 'رشق';
            else {
                reply = '❌ اختيار غير صالح. اختر 1-4.';
                await sendMessageCallback('botmaker', reply);
                return;
            }
            state = { step: 'awaiting_token', type };
            reply = `اخترت: بوت ${type}\nالآن أرسل التوكن من @ttdbot:`;
            await stateRef.set(state);
            await sendMessageCallback('botmaker', reply);
            return;
        }

        if (state.step === 'awaiting_token') {
            const token = text.trim();
            const botsSnap = await db.ref('bots').once('value');
            let foundBot = null, foundUsername = null;
            botsSnap.forEach(child => {
                const bot = child.val();
                if (bot.token === token) { foundBot = bot; foundUsername = child.key; }
            });
            if (!foundBot) {
                reply = '❌ توكن غير صالح. حاول مرة أخرى.';
                await sendMessageCallback('botmaker', reply);
                return;
            }
            await db.ref(`bots/${foundUsername}`).update({ type: state.type, verified: true });
            reply = `✅ تم ترقية بوتك!\nالنوع: ${state.type}\nالاسم: ${foundBot.name}\n@${foundUsername}\nالتوكن: ${token}`;
            await stateRef.set({ step: 'idle' });
            await sendMessageCallback('botmaker', reply);
        }
    }
};

window.TTDBOT = TTDBOT;
window.BotMaker = BotMaker;
