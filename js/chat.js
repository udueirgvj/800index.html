const Chat = {
    close() { document.getElementById('chatRoom').classList.remove('open'); },
    sendMessage() { alert('إرسال رسالة'); }
};
window.Chat = Chat;
