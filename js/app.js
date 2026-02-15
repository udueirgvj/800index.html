<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تلرفيب - التطبيق (نسخة بسيطة)</title>
    <style>
        body {
            background: #667eea;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: sans-serif;
            margin: 0;
            padding: 10px;
        }
        #app {
            width: 100%;
            max-width: 400px;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 20px;
        }
        button {
            width: 100%;
            padding: 15px;
            margin: 5px 0;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 18px;
            cursor: pointer;
            transition: 0.2s;
        }
        button:hover {
            background: #5a67d8;
        }
        .logout {
            background: #e74c3c;
            margin-top: 20px;
        }
        .logout:hover {
            background: #c0392b;
        }
    </style>
</head>
<body>
    <div id="app">
        <h1>تلرفيب</h1>
        <button onclick="alert('فتح القائمة الجانبية')">☰ القائمة الجانبية</button>
        <button onclick="alert('فتح البحث')">🔍 بحث</button>
        <button onclick="alert('فتح نافذة الإنشاء')">+ إنشاء</button>
        <button onclick="alert('فتح لوحة الدعم')">🎧 الدعم</button>
        <button class="logout" onclick="logout()">🚪 تسجيل خروج</button>
    </div>

    <script>
        // محاكاة مستخدم وهمي (للتجربة فقط)
        let currentUser = { fullName: 'مستخدم تجريبي', username: 'test' };

        function logout() {
            alert('تم تسجيل الخروج');
            window.location.href = 'index.html';
        }
    </script>
</body>
</html>
