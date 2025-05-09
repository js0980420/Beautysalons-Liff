// js/select-beautician.js

document.addEventListener('DOMContentLoaded', function() {
    let selectedServiceId = '';
    let selectedServiceName = '';
    let selectedStoreId = '';
    let selectedStoreName = '';

    // 從 URL 獲取參數
    const urlParams = new URLSearchParams(window.location.search);
    selectedServiceId = urlParams.get('serviceId');
    selectedServiceName = decodeURIComponent(urlParams.get('serviceName') || '未知服務');
    selectedStoreId = urlParams.get('storeId');
    selectedStoreName = decodeURIComponent(urlParams.get('storeName') || '未知分店');

    // 更新頁面標題中選擇的服務和分店名稱
    const serviceNameTitleElement = document.getElementById('selected-service-name-title');
    const storeNameTitleElement = document.getElementById('selected-store-name-title');
    if (serviceNameTitleElement) {
        serviceNameTitleElement.textContent = selectedServiceName;
    }
    if (storeNameTitleElement) {
        storeNameTitleElement.textContent = selectedStoreName;
    }

    liff.init({
        liffId: "2007374001-2YVyxg6e" // ❗❗ 請填入您實際的 LIFF ID
    })
    .then(() => {
        console.log("LIFF initialized successfully on select-beautician page!");
    })
    .catch((err) => {
        console.error("LIFF Initialization failed on select-beautician page.", err);
    });

    // 模擬的美容師數據 (未來會由 API 根據 storeId 和 serviceId 篩選)
    // 以「新竹巨城店」(假設 STORE006) 為例
    const mockBeauticians = {
        "STORE006": [ // 新竹巨城店的美容師
            { id: "B001", name: "何亭儀", title: "店經理 / 資深美容師", image_url: "https://via.placeholder.com/150/8A2BE2/ffffff?text=%E4%BD%95%E4%BA%AD%E5%84%80" },
            { id: "B002", name: "李昇峰", title: "美容師", image_url: "https://via.placeholder.com/150/67318e/ffffff?text=%E6%9D%8E%E6%98%87%E5%B3%B0" },
            { id: "B003", name: "朱育萱", title: "美容師", image_url: "https://via.placeholder.com/150/67318e/ffffff?text=%E6%9C%B1%E8%82%B2%E8%90%B1" },
            { id: "B004", name: "曾于庭", title: "美容師", image_url: "https://via.placeholder.com/150/67318e/ffffff?text=%E6%9B%BE%E4%BA%8E%E5%BA%AD" },
            { id: "B005", name: "宋蕙如", title: "美容師", image_url: "https://via.placeholder.com/150/67318e/ffffff?text=%E5%AE%8B%E8%95%99%E5%A6%82" }
        ],
        "STORE001": [ // 台北忠孝旗艦店的模擬美容師 (範例)
            { id: "B006", name: "林小美", title: "資深美容師", image_url: "https://via.placeholder.com/150/8A2BE2/ffffff?text=%E6%9E%97%E5%B0%8F%E7%BE%8E" },
            { id: "B007", name: "陳大明", title: "美容師", image_url: "https://via.placeholder.com/150/67318e/ffffff?text=%E9%99%B3%E5%A4%A7%E6%98%8E" }
        ]
        // ... 其他分店的美容師數據
    };

    const beauticianListContainer = document.getElementById('beautician-list-container');
    const noPreferenceBtn = document.getElementById('no-preference-btn');

    if (beauticianListContainer) {
        // TODO: 未來這裡應該呼叫 API GET /stores/{selectedStoreId}/beauticians?service_id={selectedServiceId}
        // 目前先根據 selectedStoreId 從 mockBeauticians 中獲取數據
        const beauticiansForStore = mockBeauticians[selectedStoreId] || [];
        displayBeauticians(beauticiansForStore);
    } else {
        console.error("Element with ID 'beautician-list-container' not found.");
    }

    if (noPreferenceBtn) {
        noPreferenceBtn.addEventListener('click', function() {
            console.log("選擇：不指定美容師");
            alert(`您選擇了服務：${selectedServiceName}\n分店：${selectedStoreName}\n美容師：不指定\n接下來將前往選擇時段。`);
            navigateToTimeSlotPage(null, "不指定美容師"); // 傳遞 null 或特定標識給美容師 ID
        });
    }

    function displayBeauticians(beauticians) {
        beauticianListContainer.innerHTML = ''; // 清空現有內容
        if (beauticians.length === 0) {
            beauticianListContainer.innerHTML = '<p style="text-align:center;">此分店目前無符合條件的美容師可執行此服務。</p>';
            return;
        }
        beauticians.forEach(beautician => {
            const card = document.createElement('div');
            card.className = 'beautician-card';
            card.innerHTML = `
                <img src="${beautician.image_url}" alt="${beautician.name}">
                <h3>${beautician.name}</h3>
                <p class="beautician-title">${beautician.title || '美容師'}</p>
                <button class="select-beautician-btn" data-beautician-id="${beautician.id}" data-beautician-name="${beautician.name}">選擇此美容師</button>
            `;
            beauticianListContainer.appendChild(card);

            const button = card.querySelector('.select-beautician-btn');
            button.addEventListener('click', function() {
                const selectedBeauticianId = this.dataset.beauticianId;
                const selectedBeauticianName = this.dataset.beauticianName;
                navigateToTimeSlotPage(selectedBeauticianId, selectedBeauticianName);
            });
        });
    }

    function navigateToTimeSlotPage(beauticianId, beauticianName) {
        console.log(`選擇的服務: ${selectedServiceName} (ID: ${selectedServiceId})`);
        console.log(`選擇的分店: ${selectedStoreName} (ID: ${selectedStoreId})`);
        console.log(`選擇的美容師: ${beauticianName} (ID: ${beauticianId})`);
        alert(`您選擇了服務：${selectedServiceName}\n分店：${selectedStoreName}\n美容師：${beauticianName}\n接下來將前往選擇時段。`);

        const nextPage = 'select-timeslot.html'; // 假設下一頁是選擇時段
        const params = `?serviceId=${selectedServiceId}&serviceName=${encodeURIComponent(selectedServiceName)}&storeId=${selectedStoreId}&storeName=${encodeURIComponent(selectedStoreName)}&beauticianId=${beauticianId || 'any'}&beauticianName=${encodeURIComponent(beauticianName)}`;

        if (liff.isInClient()) {
            liff.openWindow({
               url: `https://beautysalons-liff.pages.dev/${nextPage}${params}`, // 請確保路徑正確
               external: false
            });
        } else {
             window.location.href = `${nextPage}${params}`;
        }
    }
});
