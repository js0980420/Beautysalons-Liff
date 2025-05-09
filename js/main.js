// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("Main menu LIFF page loaded.");

    // LIFF 初始化 (請確認您的 LIFF ID 正確)
    // 這個 LIFF ID 應該是您在 LINE Developers Console 中為「主選單」或「入口」LIFF App 設定的 ID
    liff.init({
        liffId: "2007374001-2YVyxg6e" // ❗❗ 這是您之前提供的 LIFF ID，請確認是否為此主選單頁面專用的
    })
    .then(() => {
        console.log("LIFF initialized successfully on main menu page!");
        if (!liff.isLoggedIn() && !liff.isInClient()) {
            // 在外部瀏覽器且未登入時，可以選擇是否要自動登入
            // liff.login({ redirectUri: window.location.href });
            console.log("Not in LINE client and not logged in.");
        } else if (liff.isLoggedIn()) {
            // 如果已登入，可以嘗試獲取使用者資訊 (可選)
            liff.getProfile()
                .then(profile => {
                    console.log("User Profile on main menu:", profile);
                    // 可以在主選單顯示歡迎詞，例如：
                    // const welcomeMessage = document.querySelector('.main-menu-container h2');
                    // if (welcomeMessage) {
                    // welcomeMessage.textContent = `歡迎，${profile.displayName}！`;
                    // }
                })
                .catch(err => console.error("Error getting profile on main menu:", err));
        }
    })
    .catch((err) => {
        console.error("LIFF Initialization failed on main menu page.", err);
        // 即使 LIFF 初始化失敗，按鈕的基本跳轉功能(如果不是用 liff.openWindow)還是可以運作
        // 但與 LINE 相關的功能會失效
    });

    // 「我要預約」按鈕事件
    const bookingBtn = document.getElementById('booking-btn');
    if (bookingBtn) {
        bookingBtn.addEventListener('click', function() {
            console.log("'我要預約' button clicked.");
            const nextPage = 'select-service.html'; // 下一頁是選擇服務項目
            const targetUrl = `https://beautysalons-liff.pages.dev/${nextPage}`; // 完整的 LIFF 頁面 URL

            // alert(`準備跳轉到: ${targetUrl}`); // 除錯用

            if (liff.isInClient()) {
                // 在 LINE App 內，使用 liff.openWindow 開啟新的 LIFF 視窗
                // 這樣可以保持在 LINE App 的體驗中，且新的 LIFF 頁面也可以使用 LIFF 功能
                liff.openWindow({
                    url: targetUrl,
                    external: false // false 表示在 LINE App 內開啟
                });
            } else {
                // 如果是在外部瀏覽器中測試，直接使用 window.location.href
                window.location.href = nextPage; // 本地測試或外部瀏覽器使用相對路徑
            }
        });
    } else {
        console.error("Button with ID 'booking-btn' not found.");
    }

    // 其他按鈕的事件監聽器 (目前是 alert 提示)
    const queryBookingBtn = document.getElementById('query-booking-btn');
    if (queryBookingBtn) {
        queryBookingBtn.addEventListener('click', function() {
            alert('查詢預約功能尚未開放');
        });
    }

    const queryRemainingBtn = document.getElementById('query-remaining-btn');
    if (queryRemainingBtn) {
        queryRemainingBtn.addEventListener('click', function() {
            alert('查詢剩餘堂數功能尚未開放');
        });
    }

    const storeInfoBtn = document.getElementById('store-info-btn');
    if (storeInfoBtn) {
        storeInfoBtn.addEventListener('click', function() {
            alert('分店資訊功能尚未開放');
        });
    }

    const memberAreaBtn = document.getElementById('member-area-btn');
    if (memberAreaBtn) {
        memberAreaBtn.addEventListener('click', function() {
            alert('會員專區功能尚未開放');
        });
    }

    // 如果您有新增其他按鈕，可以在這裡加入對應的事件監聽器
    // 例如：
    // const latestNewsBtn = document.getElementById('latest-news-btn');
    // if (latestNewsBtn) {
    //     latestNewsBtn.addEventListener('click', function() {
    //         // 跳轉到最新消息 LIFF 頁面或開啟外部連結
    //         alert('最新資訊功能尚未開放');
    //     });
    // }
});
