// loader.js
const files = [
    'js/firebase-config.js',
    'js/auth.js',
    'js/bots.js',
    'js/support.js',
    'js/groups.js',
    'js/chat.js',
    'js/app.js'
];

function loadScript(index) {
    if (index >= files.length) return;
    const script = document.createElement('script');
    script.src = files[index];
    script.onload = () => loadScript(index + 1);
    script.onerror = () => console.error('خطأ في تحميل:', files[index]);
    document.head.appendChild(script);
}
loadScript(0);
