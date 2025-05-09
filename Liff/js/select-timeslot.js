// js/select-timeslot.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("select-timeslot.js: DOMContentLoaded event fired.");

    let selectedServiceId = '';
    let selectedServiceName = '';
    let selectedStoreId = '';
    let selectedStoreName = '';
    let selectedBeauticianId = '';
    let selectedBeauticianName = '';

    let currentDate = new Date();

    // 從 URL 獲取參數
    const urlParams = new URLSearchParams(window.location.search);
    selectedServiceId = urlParams.get('serviceId');
    selectedServiceName = decodeURIComponent(urlParams.get('serviceName') || '未知服務');
    selectedStoreId = urlParams.get('storeId');
    selectedStoreName = decodeURIComponent(urlParams.get('storeName') || '未知分店');
    selectedBeauticianId = urlParams.get('beauticianId');
    selectedBeauticianName = decodeURIComponent(urlParams.get('beauticianName') || '店家安排');

    console.log("select-timeslot.js: Received URL Parameters:", {
        serviceId: selectedServiceId,
        serviceName: selectedServiceName,
        storeId: selectedStoreId,
        storeName: selectedStoreName,
        beauticianId: selectedBeauticianId,
        beauticianName: selectedBeauticianName
    });

    // 更新頁面標題
    const serviceNameTitleEl = document.getElementById('selected-service-name-title');
    const storeNameTitleEl = document.getElementById('selected-store-name-title');
    const beauticianNameTitleEl = document.getElementById('selected-beautician-name-title');

    if(serviceNameTitleEl) serviceNameTitleEl.textContent = selectedServiceName;
    else console.error("Element with ID 'selected-service-name-title' not found.");

    if(storeNameTitleEl) storeNameTitleEl.textContent = selectedStoreName;
    else console.error("Element with ID 'selected-store-name-title' not found.");

    if(beauticianNameTitleEl) beauticianNameTitleEl.textContent = selectedBeauticianName;
    else console.error("Element with ID 'selected-beautician-name-title' not found.");


    const currentDateDisplay = document.getElementById('current-date-display');
    const timeslotListContainer = document.getElementById('timeslot-list-container');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');

    if (!currentDateDisplay) console.error("Element with ID 'current-date-display' not found.");
    if (!timeslotListContainer) console.error("Element with ID 'timeslot-list-container' not found.");
    if (!prevDayBtn) console.error("Element with ID 'prev-day-btn' not found.");
    if (!nextDayBtn) console.error("Element with ID 'next-day-btn' not found.");

    liff.init({
        liffId: "2007374001-2YVyxg6e" // ❗❗ 請填入您實際的 LIFF ID
    })
    .then(() => {
        console.log("LIFF initialized successfully on select-timeslot page!");
        fetchAndDisplayAvailableSlots(); // 初始化後載入時段
    })
    .catch((err) => {
        console.error("LIFF Initialization failed on select-timeslot page.", err);
        if(timeslotListContainer) timeslotListContainer.innerHTML = '<p class="no-slots-message">系統初始化失敗，請稍後再試。</p>';
    });

    const mockApiAvailableSlots = [
        { date: "2025-05-09", slots: ["10:00", "11:00", "14:00", "15:00", "16:30"] },
        { date: "2025-05-10", slots: ["13:00", "14:00", "17:00"] },
        { date: "2025-05-11", slots: [] },
        { date: "2025-05-12", slots: ["09:30", "10:30", "11:30", "14:30", "15:30"] },
        // 為了測試方便，可以手動加入今天的日期和一些時段
        // 例如，如果今天是 2025-05-09:
        // { date: new Date().toISOString().split('T')[0], slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] }
    ];

    function formatDate(date) {
        if (!(date instanceof Date)) { // 增加檢查確保 date 是 Date 物件
            console.error("formatDate received an invalid date object:", date);
            // 提供一個預設值或拋出錯誤
            date = new Date(); // 使用當前日期作為後備
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
        const dayOfWeek = dayNames[date.getDay()];
        return {
            iso: `${year}-${month}-${day}`,
            display: `${year}-${month}-${day} (${dayOfWeek})`
        };
    }

    function displayDate() {
        if(currentDateDisplay) currentDateDisplay.textContent = formatDate(currentDate).display;
    }

    async function fetchAvailableSlotsFromServer(dateToQuery) {
        const formattedDate = formatDate(dateToQuery);
        console.log(`模擬查詢日期: ${formattedDate.iso} 的可預約時段`);
        if(timeslotListContainer) timeslotListContainer.innerHTML = '<p class="loading-message">正在查詢可預約時段...</p>';
        
        return new Promise(resolve => {
            setTimeout(() => {
                const slotsForDate = mockApiAvailableSlots.find(d => d.date === formattedDate.iso);
                console.log(`找到 ${formattedDate.iso} 的時段:`, slotsForDate);
                resolve(slotsForDate ? slotsForDate.slots : []);
            }, 500);
        });
    }

    async function fetchAndDisplayAvailableSlots() {
        console.log("fetchAndDisplayAvailableSlots called for date:", currentDate);
        displayDate();
        const slots = await fetchAvailableSlotsFromServer(currentDate);
        renderTimeSlots(slots);
    }

    function renderTimeSlots(slotsArray) {
        if(!timeslotListContainer) return;
        timeslotListContainer.innerHTML = '';
        if (!slotsArray || slotsArray.length === 0) {
            timeslotListContainer.innerHTML = '<p class="no-slots-message">本日無可預約時段，請選擇其他日期。</p>';
            return;
        }
        console.log("renderTimeSlots - 準備渲染的時段:", slotsArray);
        slotsArray.forEach(slot => {
            const slotButton = document.createElement('button');
            slotButton.className = 'timeslot-btn';
            slotButton.textContent = slot;
            const currentISODate = formatDate(currentDate).iso;
            slotButton.dataset.datetime = `${currentISODate}T${slot}:00`;

            slotButton.addEventListener('click', function() {
                const selectedDateTime = this.dataset.datetime;
                console.log("時段按鈕被點擊。選擇的 datetime:", selectedDateTime);
                handleTimeSlotSelection(selectedDateTime);
            });
            timeslotListContainer.appendChild(slotButton);
        });
    }

    function handleTimeSlotSelection(dateTime) {
        console.log("handleTimeSlotSelection 函數被呼叫，選擇的時段是:", dateTime);

        // 再次確認所有需要傳遞的參數都有值
        if (!selectedServiceId || !selectedServiceName || !selectedStoreId || !selectedStoreName || !selectedBeauticianName || !dateTime) {
            console.error("handleTimeSlotSelection: 缺少必要的參數!", {
                serviceId: selectedServiceId,
                serviceName: selectedServiceName,
                storeId: selectedStoreId,
                storeName: selectedStoreName,
                beauticianId: selectedBeauticianId, // 允許為 'any' 或 null
                beauticianName: selectedBeauticianName,
                dateTime: dateTime
            });
            alert("抱歉，預約資訊不完整，無法繼續。請重新選擇。");
            return;
        }

        const alertMessage = `您選擇了：\n服務：${selectedServiceName}\n分店：${selectedStoreName}\n美容師：${selectedBeauticianName}\n時間：${dateTime}\n\n接下來將前往確認預約。`;
        console.log("準備顯示的 alert 訊息:", alertMessage);
        alert(alertMessage);

        const nextPage = 'booking-confirmation.html';
        const params = `?serviceId=${selectedServiceId}&serviceName=${encodeURIComponent(selectedServiceName)}&storeId=${selectedStoreId}&storeName=${encodeURIComponent(selectedStoreName)}&beauticianId=${selectedBeauticianId || 'any'}&beauticianName=${encodeURIComponent(selectedBeauticianName)}&dateTime=${encodeURIComponent(dateTime)}`;
        const targetUrl = `https://beautysalons-liff.pages.dev/${nextPage}${params}`;
        const localTargetUrl = `${nextPage}${params}`; // 用於本地測試

        console.log("準備跳轉的完整 URL (LIFF 環境):", targetUrl);
        console.log("準備跳轉的相對 URL (本地測試):", localTargetUrl);

        try {
            if (liff.isInClient()) {
                console.log("在 LINE Client 中，嘗試使用 liff.openWindow 跳轉到:", targetUrl);
                liff.openWindow({ url: targetUrl, external: false });
            } else {
                console.log("在外部瀏覽器中，嘗試使用 window.location.href 跳轉到:", localTargetUrl);
                window.location.href = localTargetUrl;
            }
            console.log("跳轉指令已執行。");
        } catch (error) {
            console.error("跳轉時發生錯誤:", error);
            alert("頁面跳轉失敗，請稍後再試。");
        }
    }

    if(prevDayBtn) {
        prevDayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            fetchAndDisplayAvailableSlots();
        });
    } else {
        console.warn("prevDayBtn not found.");
    }

    if(nextDayBtn) {
        nextDayBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            fetchAndDisplayAvailableSlots();
        });
    } else {
        console.warn("nextDayBtn not found.");
    }

    // 確保在 LIFF 初始化後才執行日期和時段的初始載入
    // displayDate(); // 移到 liff.init().then() 內部或 fetchAndDisplayAvailableSlots() 開頭
});
