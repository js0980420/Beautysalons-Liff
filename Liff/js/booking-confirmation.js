// js/booking-confirmation.js

document.addEventListener('DOMContentLoaded', function() {
    let bookingDetails = {}; // 用來儲存所有預約相關資訊
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');

    // 從 URL 獲取所有參數 - ⭐⭐⭐ 在這裡初始化 urlParams ⭐⭐⭐
    const urlParams = new URLSearchParams(window.location.search); // 新增此行來定義 urlParams

    bookingDetails.serviceId = urlParams.get('serviceId');
    bookingDetails.serviceName = decodeURIComponent(urlParams.get('serviceName') || '未知服務');
    bookingDetails.storeId = urlParams.get('storeId');
    bookingDetails.storeName = decodeURIComponent(urlParams.get('storeName') || '未知分店');
    bookingDetails.beauticianId = urlParams.get('beauticianId');
    bookingDetails.beauticianName = decodeURIComponent(urlParams.get('beauticianName') || '店家安排');
    bookingDetails.dateTime = decodeURIComponent(urlParams.get('dateTime') || '未知時間');

    // 更新頁面上的預約摘要資訊
    const summaryServiceNameEl = document.getElementById('summary-service-name');
    const summaryStoreNameEl = document.getElementById('summary-store-name');
    const summaryBeauticianNameEl = document.getElementById('summary-beautician-name');
    const summaryDatetimeEl = document.getElementById('summary-datetime');

    if (summaryServiceNameEl) summaryServiceNameEl.textContent = bookingDetails.serviceName;
    if (summaryStoreNameEl) summaryStoreNameEl.textContent = bookingDetails.storeName;
    if (summaryBeauticianNameEl) summaryBeauticianNameEl.textContent = bookingDetails.beauticianName;

    if (summaryDatetimeEl) {
        try {
            const dateObj = new Date(bookingDetails.dateTime);
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
            summaryDatetimeEl.textContent = dateObj.toLocaleString('zh-TW', options);
        } catch (e) {
            summaryDatetimeEl.textContent = bookingDetails.dateTime;
        }
    }


    // 初始化時禁用按鈕，稍後根據 LIFF 狀態或模擬狀態啟用
    if (confirmBookingBtn) {
        confirmBookingBtn.disabled = true;
        confirmBookingBtn.textContent = "正在初始化...";
    }

    liff.init({
        liffId: "2007374001-2YVyxg6e" // ❗❗ 請填入您實際的 LIFF ID
    })
    .then(async () => {
        console.log("LIFF initialized successfully on booking-confirmation page!");

        // 在模擬介面階段，我們先假設有一個模擬的 User ID，並啟用按鈕
        // 這樣即使不在 LINE 環境或未登入，也能測試後續流程
        bookingDetails.lineUserId = "SIMULATED_USER_ID_12345"; // 模擬的 User ID
        console.log("Using simulated Line User ID:", bookingDetails.lineUserId);

        if (confirmBookingBtn) {
            confirmBookingBtn.disabled = false;
            confirmBookingBtn.textContent = "確認預約並送出";
        }

        // 以下是原本的登入和獲取 profile 邏輯，在模擬階段可以先註解掉或保留供後續使用
        /*
        if (!liff.isLoggedIn()) {
            console.log("User is not logged in. Attempting to login...");
            alert("為了完成預約，需要請您先登入 LINE。點擊確定後將引導您登入。");
            liff.login({ redirectUri: window.location.href });
            return;
        }

        try {
            const context = await liff.getContext();
            bookingDetails.lineUserId = context.userId;
            if (bookingDetails.lineUserId) {
                console.log("Successfully fetched Line User ID:", bookingDetails.lineUserId);
                if (confirmBookingBtn) {
                    confirmBookingBtn.disabled = false;
                    confirmBookingBtn.textContent = "確認預約並送出";
                }
            } else {
                throw new Error("Line User ID is null or undefined after getContext.");
            }
        } catch (err) {
            console.error("Failed to get Line User ID after login:", err);
            alert("獲取您的 LINE 用戶資訊失敗，請嘗試重新整理頁面或稍後再試。");
            if (confirmBookingBtn) {
                confirmBookingBtn.textContent = "獲取用戶資訊失敗";
            }
        }
        */
    })
    .catch((err) => {
        console.error("LIFF Initialization failed on booking-confirmation page.", err);
        // 在模擬階段，即使 LIFF 初始化失敗 (例如在普通瀏覽器中)，我們仍然啟用按鈕以便測試頁面流程
        alert("LIFF 初始化失敗 (可能在外部瀏覽器)。將啟用按鈕以進行介面流程模擬。");
        bookingDetails.lineUserId = "SIMULATED_USER_ID_ERROR_CASE"; // 給一個不同的模擬 ID
        if (confirmBookingBtn) {
            confirmBookingBtn.disabled = false;
            confirmBookingBtn.textContent = "確認預約並送出 (模擬)";
        }
    });

    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', async function() {
            console.log("Confirm button clicked.");

            if (this.disabled) {
                alert("系統正在處理中或初始化未完成，請稍候。");
                return;
            }

            // 在模擬階段，我們已經在 LIFF 初始化後設定了 bookingDetails.lineUserId
            // 所以這裡的檢查主要是針對真實環境
            if (!bookingDetails.lineUserId) {
                console.error("Line User ID is missing before submitting booking.");
                alert("無法完成預約，似乎未成功獲取您的 LINE 用戶資訊。請嘗試重新整理頁面。");
                return;
            }

            const bookingData = {
                line_user_id: bookingDetails.lineUserId, // 會使用模擬的 ID
                store_id: parseInt(bookingDetails.storeId),
                service_id: parseInt(bookingDetails.serviceId),
                beautician_id: (bookingDetails.beauticianId === 'any' || bookingDetails.beauticianId === 'null' || !bookingDetails.beauticianId) ? null : parseInt(bookingDetails.beauticianId),
                start_time: bookingDetails.dateTime
            };

            console.log("準備提交的預約資料 (模擬):", bookingData);
            alert("正在為您提交預約請求，請稍候...");

            confirmBookingBtn.disabled = true;
            confirmBookingBtn.textContent = "提交中...";
            setTimeout(() => {
                console.log("模擬預約請求成功");
                alert("您的預約請求已成功送出！\n美容師確認後會通知您。(模擬)");

                const nextPage = 'booking-success.html';
                const mockAppointmentId = "MOCK" + Date.now();
                const params = `?appointmentId=${mockAppointmentId}&serviceName=${encodeURIComponent(bookingDetails.serviceName)}&storeName=${encodeURIComponent(bookingDetails.storeName)}&beauticianName=${encodeURIComponent(bookingDetails.beauticianName)}&dateTime=${encodeURIComponent(bookingDetails.dateTime)}`;

                if (liff.isInClient()) {
                    // 即使是模擬，如果想測試 LIFF 的跳轉，還是可以使用 liff.openWindow
                    liff.openWindow({ url: `https://beautysalons-liff.pages.dev/${nextPage}${params}`, external: false });
                } else {
                    // 在外部瀏覽器中，直接跳轉
                    window.location.href = `${nextPage}${params}`;
                }
            }, 1500);
        });
    }
});
