// js/select-store.js

document.addEventListener('DOMContentLoaded', function() {
    let selectedServiceId = '';
    let selectedServiceName = '';

    // 從 URL 獲取 serviceId 和 serviceName 參數
    const urlParams = new URLSearchParams(window.location.search);
    selectedServiceId = urlParams.get('serviceId');
    selectedServiceName = decodeURIComponent(urlParams.get('serviceName') || '未知服務'); // 解碼服務名稱

    // 更新頁面標題中選擇的服務名稱
    const serviceNameTitleElement = document.getElementById('selected-service-name-title');
    if (serviceNameTitleElement) {
        serviceNameTitleElement.textContent = selectedServiceName;
    }

    liff.init({
        liffId: "2007374001-2YVyxg6e" // ❗❗ 請填入您實際的 LIFF ID
    })
    .then(() => {
        console.log("LIFF initialized successfully on select-store page!");
    })
    .catch((err) => {
        console.error("LIFF Initialization failed on select-store page.", err);
    });

    // 模擬的分店數據 (未來會由 API 根據 serviceId 篩選)
    // 假設所有分店都提供所有服務 (在模擬階段)
    const mockStores = [
        {
            id: "STORE001",
            name: "台北忠孝旗艦店",
            address: "台北市大安區忠孝東路四段49巷2號4樓",
            phone: "(02)8773-6767",
            image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E5%BF%A0%E5%AD%9D%E6%97%97%E8%89%A6"
        },
        {
            id: "STORE002",
            name: "新北舒莉泉旗艦店",
            address: "新北市土城區裕民路77號3樓",
            phone: "(02)8261-3010",
            image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E8%88%92%E8%8E%89%E6%B3%89"
        },
        {
            id: "STORE003",
            name: "桃園同安旗艦店",
            address: "桃園市同安街116號1樓",
            phone: "(03)355-0105",
            image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E6%A1%83%E5%9C%92%E5%90%8C%E5%AE%89"
        },
        {
            id: "STORE004",
            name: "桃園中壢旗艦店",
            address: "桃園市中壢區元化路2段45號2樓",
            phone: "(03)426-1187",
            image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E6%A1%83%E5%9C%92%E4%B8%AD%E壢"
        },
        {
            id: "STORE005",
            name: "楊梅丹佛旗艦店",
            address: "桃園市楊梅區秀才路47號",
            phone: "(03)478-6946",
            image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E6%A5%8A%E6%A2%85%E4%B8%B9%E4%BD%9B"
        },
        {
            id: "STORE006",
            name: "新竹巨城旗艦店",
            address: "新竹市東區民生路128號2樓之2",
            phone: "(03)515-2203",
            image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E6%96%B0%E7%AB%B9%E5%B7%A8%E5%9F%8E"
        }
    ];

    const storeListContainer = document.getElementById('store-list-container');

    if (storeListContainer) {
        // TODO: 未來這裡應該呼叫 API GET /stores?service_id={selectedServiceId}
        // 目前先顯示所有模擬分店
        displayStores(mockStores);
    } else {
        console.error("Element with ID 'store-list-container' not found.");
    }

    function displayStores(stores) {
        storeListContainer.innerHTML = ''; // 清空現有內容
        if (stores.length === 0) {
            storeListContainer.innerHTML = '<p style="text-align:center;">目前無分店提供此服務。</p>';
            return;
        }
        stores.forEach(store => {
            const card = document.createElement('div');
            card.className = 'store-card'; // 您可以在 CSS 中定義 .store-card 樣式
            card.innerHTML = `
                <img src="${store.image_url}" alt="${store.name}">
                <h3>${store.name}</h3>
                <p class="store-address">${store.address}</p>
                <p class="store-phone">電話：${store.phone}</p>
                <button class="select-store-btn" data-store-id="${store.id}" data-store-name="${store.name}">選擇此分店</button>
            `;
            storeListContainer.appendChild(card);

            // 為每個按鈕添加事件監聽器
            const button = card.querySelector('.select-store-btn');
            button.addEventListener('click', function() {
                const selectedStoreId = this.dataset.storeId;
                const selectedStoreName = this.dataset.storeName;
                console.log(`選擇的服務: ${selectedServiceName} (ID: ${selectedServiceId})`);
                console.log(`選擇的分店: ${selectedStoreName} (ID: ${selectedStoreId})`);
                alert(`您選擇了服務：${selectedServiceName}\n分店：${selectedStoreName}\n接下來將前往選擇美容師。`);

                // 實際跳轉邏輯
                const nextPage = 'select-beautician.html'; // 假設下一頁是選擇美容師
                const params = `?serviceId=${selectedServiceId}&serviceName=${encodeURIComponent(selectedServiceName)}&storeId=${selectedStoreId}&storeName=${encodeURIComponent(selectedStoreName)}`;

                if (liff.isInClient()) {
                    liff.openWindow({
                       url: `https://beautysalons-liff.pages.dev/${nextPage}${params}`, // 請確保路徑正確
                       external: false
                    });
                } else {
                     window.location.href = `${nextPage}${params}`;
                }
            });
        });
    }
});
