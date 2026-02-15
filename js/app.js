// ==================== app.js (الإصدار الصحيح) ====================
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

const UI = {
    toggleDrawer() {
        document.getElementById('drawer').classList.toggle('open');
        document.getElementById('drawerOverlay').classList.toggle('open');
    },
    closeDrawer() {
        document.getElementById('drawer').classList.remove('open');
        document.getElementById('drawerOverlay').classList.remove('open');
    },
    toggleSearch() {
        document.getElementById('searchBar').classList.toggle('show');
    },
    openCreateModal() {
        document.getElementById('createModal').classList.add('open');
    },
    closeCreateModal() {
        document.getElementById('createModal').classList.remove('open');
    },
    openCountersMenu() {
        document.getElementById('countersMenu').classList.add('open');
    },
    closeCountersMenu() {
        document.getElementById('countersMenu').classList.remove('open');
    },
    countersAction(action) {
        alert('قيد التطوير: ' + action);
        this.closeCountersMenu();
    },
    showSettings(type) {
        if (type === 'counters') {
            this.openCountersMenu();
        } else {
            alert(type);
        }
        this.closeDrawer();
    },
    updateDrawerInfo() {
        if (currentUser) {
            document.getElementById('drawerFullName').innerText = currentUser.fullName;
            document.getElementById('drawerUsername').innerText = '@' + currentUser.username;
        }
    },
    changePhoto() {
        alert('تغيير الصورة قيد التطوير');
    },
    editName() {
        const newName = prompt('الاسم الجديد:', currentUser.fullName);
        if (newName && newName.trim()) {
            currentUser.fullName = newName.trim();
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            this.updateDrawerInfo();
        }
        this.closeDrawer();
    },
    editUsername() {
        alert('تغيير اسم المستخدم قيد التطوير');
        this.closeDrawer();
    },
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        this.closeDrawer();
    },
    closeProfile() {
        document.getElementById('profileModal').classList.remove('open');
    },
    closeForwardModal() {
        document.getElementById('forwardModal').classList.remove('open');
    },
    openProfileFromChat() {}
};

const Auth = {
    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};

const Search = {
    async handle() {
        const query = document.getElementById('searchInput').value.trim();
        if (query.length < 2) return;
        alert('بحث عن: ' + query);
    }
};

const GroupsAndChannels = {
    async create() {
        alert('إنشاء مجموعة/قناة');
        UI.closeCreateModal();
    }
};

const Chat = {
    close() {
        document.getElementById('chatRoom').classList.remove('open');
    },
    async sendMessage() {}
};

const Support = {
    openSupportPanel() {
        document.getElementById('supportPanel').classList.add('open');
    },
    closeSupportPanel() {
        document.getElementById('supportPanel').classList.remove('open');
    }
};

const Channel = {
    open() {
        alert('قناة المطور');
    }
};

// ربط حدث البحث
document.getElementById('searchInput').addEventListener('keyup', Search.handle);

// تحديث معلومات القائمة الجانبية عند التحميل
UI.updateDrawerInfo();
