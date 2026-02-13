// ========== نظام المصادقة المتطور ==========
const Auth = {
    // المستخدم الحالي
    currentUser: null,

    // التحقق من صحة اسم المستخدم
    isValidUsername(username) {
        // 5-10 أحرف، إنجليزي وأرقام فقط، لا يبدأ برقم
        const regex = /^[A-Za-z][A-Za-z0-9]{4,9}$/;
        return regex.test(username);
    },

    // التحقق من عدم تكرار اسم المستخدم
    async isUsernameAvailable(username) {
        const snapshot = await db.ref('usernames').child(username).once('value');
        return !snapshot.exists();
    },

    // إنشاء حساب جديد
    async signUp(email, password, fullName, username) {
        // التحقق من المدخلات
        if (!email || !password || !fullName || !username) {
            throw new Error('جميع الحقول مطلوبة');
        }

        if (!this.isValidUsername(username)) {
            throw new Error('اسم المستخدم: 5-10 أحرف إنجليزية، لا يبدأ برقم');
        }

        if (password.length < 6) {
            throw new Error('كلمة المرور 6 أحرف على الأقل');
        }

        // التحقق من توفر اسم المستخدم
        const available = await this.isUsernameAvailable(username);
        if (!available) {
            throw new Error('اسم المستخدم غير متاح');
        }

        try {
            // 1. إنشاء المستخدم في Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 2. إرسال بريد التحقق
            await user.sendEmailVerification();

            // 3. حفظ بيانات المستخدم في Realtime Database
            const userData = {
                uid: user.uid,
                email: email,
                fullName: fullName,
                username: username,
                photoURL: '',
                bio: '',
                emailVerified: false,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            await db.ref(`users/${user.uid}`).set(userData);
            
            // 4. حفظ اسم المستخدم في مسار منفصل لضمان الفريدة
            await db.ref(`usernames/${username}`).set(user.uid);

            // 5. تسجيل الخروج فوراً حتى يفعل البريد
            await auth.signOut();

            return {
                success: true,
                message: 'تم إنشاء الحساب. الرجاء تفعيل البريد الإلكتروني',
                email: email
            };

        } catch (error) {
            // معالجة أخطاء Firebase
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('البريد الإلكتروني مستخدم بالفعل');
            }
            throw error;
        }
    },

    // تسجيل الدخول
    async login(email, password) {
        if (!email || !password) {
            throw new Error('أدخل البريد الإلكتروني وكلمة المرور');
        }

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // التحقق من تفعيل البريد
            if (!user.emailVerified) {
                await auth.signOut();
                throw new Error('الرجاء تفعيل البريد الإلكتروني أولاً. تحقق من صندوق الوارد');
            }

            // تحديث آخر دخول في قاعدة البيانات
            await db.ref(`users/${user.uid}/lastLogin`).set(new Date().toISOString());

            // جلب بيانات المستخدم من Realtime Database
            const userSnapshot = await db.ref(`users/${user.uid}`).once('value');
            this.currentUser = userSnapshot.val();

            return {
                success: true,
                user: this.currentUser
            };

        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                throw new Error('البريد أو كلمة المرور غير صحيحة');
            }
            throw error;
        }
    },

    // إعادة إرسال رابط التفعيل
    async resendVerification() {
        const user = auth.currentUser;
        if (user) {
            await user.sendEmailVerification();
            return 'تم إعادة إرسال رابط التفعيل';
        }
        throw new Error('لا يوجد مستخدم مسجل حالياً');
    },

    // تسجيل الخروج
    async logout() {
        await auth.signOut();
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    },

    // التحقق من حالة المصادقة
    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(async (user) => {
            if (user && user.emailVerified) {
                // جلب البيانات من قاعدة البيانات
                const snapshot = await db.ref(`users/${user.uid}`).once('value');
                this.currentUser = snapshot.val();
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                callback(this.currentUser);
            } else {
                this.currentUser = null;
                localStorage.removeItem('currentUser');
                callback(null);
            }
        });
    },

    // استعادة الجلسة من localStorage
    loadSession() {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            return this.currentUser;
        }
        return null;
    }
};

window.Auth = Auth;
