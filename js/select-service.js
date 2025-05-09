// js/select-service.js

document.addEventListener('DOMContentLoaded', function() {
    let displayCategory = 'exosome'; // 預設顯示外泌體服務
    let pageTitleSuffix = "服務項目"; // 預設標題後綴，改為更通用

    // 檢查 URL 是否有 category 參數，如果有，則使用該參數
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');

    if (categoryFromUrl) {
        displayCategory = categoryFromUrl;
        if (categoryFromUrl === 'medical') {
            pageTitleSuffix = "專業醫療諮詢/服務";
        } else if (categoryFromUrl === 'other') {
            pageTitleSuffix = "其他養護/保養";
        } else if (categoryFromUrl === 'exosome') { // 如果明確指定 exosome
             pageTitleSuffix = "外泌體養護系列";
        }
        console.log("根據 URL 參數顯示分類:", displayCategory);
    } else {
        pageTitleSuffix = "外泌體養護系列"; // 從主選單進來，預設是外泌體
        console.log("未指定分類，預設顯示外泌體服務");
    }


    liff.init({
        liffId: "2007374001-2YVyxg6e" // ❗❗ 請填入您實際的 LIFF ID
    })
    .then(() => {
        console.log("LIFF initialized successfully on select-service page!");
        if (!liff.isLoggedIn() && !liff.isInClient()) {
            console.log("Not in LINE client and not logged in.");
        }
    })
    .catch((err) => {
        console.error("LIFF Initialization failed on select-service page.", err);
    });

    // 模擬的服務項目數據 (已重新分類並調整名稱)
    const mockServices = [
        // 外泌體服務 (category: "exosome")
        { id: "EXO001", name: "H168 髮之泌", price: 6800, category: "exosome", image_url: "https://via.placeholder.com/300x200/8A2BE2/ffffff?text=H168+%E9%AB%AE%E4%B9%8B%E6%B3%8C" },
        { id: "S001", name: "H168 益露髮", price: 8800, category: "exosome", image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=H168+%E7%9B%8A%E9%9C%B2%E9%AB%AE" },
        { id: "EXO002", name: "蘊髮極泌", price: 6000, category: "exosome", image_url: "https://via.placeholder.com/300x200/8A2BE2/ffffff?text=%E8%98%8A%E9%AB%AE%E6%A5%B5%E6%B3%8C" },
        { id: "EXO003", name: "肌泌光妍", price: 5800, category: "exosome", image_url: "https://via.placeholder.com/300x200/8A2BE2/ffffff?text=%E8%82%8C%E6%B3%8C%E5%85%89%E5%A6%8D" },
        { id: "S005", name: "華顏傳奇", price: 1800, category: "exosome", image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E8%8F%AF%E9%A1%8F%E5%82%B3%E5%A5%87" },
        { id: "S007", name: "膝蓋養護", price: 6800, category: "exosome", image_url: "https://via.placeholder.com/300x200/67318e/ffffff?text=%E8%86%9D%E8%93%8B%E9%A4%8A%E8%AD%B7" },
        { id: "MED002", name: "妊娠修復療程", price: 9800, category: "exosome", image_url: "https://via.placeholder.com/300x200/8A2BE2/ffffff?text=%E5%A6%8A%E5%A娠%E4%BF%AE%E5%BE%A9" },

        // 醫療服務 (category: "medical") - 這 4 項為醫療服務
        { id: "MED003", name: "癌症免疫細胞治療 (專業醫生諮詢與治療計畫)", price: 500, category: "medical", image_url: "https://via.placeholder.com/300x200/4682B4/ffffff?text=%E7%99%8C%E7%97%87%E5%85%8D%E7%96%AB%E7%B4%B0%E8%83%9E" },
        { id: "MED004", name: "歐洲胸腺素免疫調節針劑 - 癌症治療 (專業醫生諮詢與治療計畫)", price: 300, category: "medical", image_url: "https://via.placeholder.com/300x200/4682B4/ffffff?text=%E8%83%B8%E8%85%BA%E7%B4%A0%E5%85%8D%E7%96%AB" },
        { id: "MED005", name: "幹細胞再生精準醫療 (專業醫生諮詢與治療計畫)", price: 500, category: "medical", image_url: "https://via.placeholder.com/300x200/4682B4/ffffff?text=%E5%B9%B9%E7%B4%B0%E8%83%9E%E5%86%8D%E7%94%9F" },
        { id: "MED006", name: "抗老回春國際醫療服務 (專業醫生諮詢與治療計畫)", price: 300, category: "medical", image_url: "https://via.placeholder.com/300x200/4682B4/ffffff?text=%E6%8A%97%E8%80%81%E5%9B%9E%E6%98%A5" },

        // 其他服務 (category: "other") - 包含基因槍療程，但預設不顯示
        { id: "MED001", name: "基因槍療程", price: 70000, category: "other", image_url: "https://via.placeholder.com/300x200/20B2AA/ffffff?text=%E5%9F%BA%E5%9B%A0%E6%A7%8D%E7%99%82%E7%A8%8B" },
        { id: "OTH001", name: "基礎臉部清潔", price: 1200, category: "other", image_url: "https://via.placeholder.com/300x200/20B2AA/ffffff?text=%E5%9F%BA%E7%A4%8E%E6%B8%85%E6%BD%94" },
        { id: "OTH002", name: "肩頸舒壓按摩", price: 1500, category: "other", image_url: "https://via.placeholder.com/300x200/20B2AA/ffffff?text=%E8%82%A9%E9%A0%B8%E6%8C%89%E6%91%A9" }
    ];

    const serviceListContainer = document.getElementById('service-list-container');
    const pageTitle = document.querySelector('.page-title');

    if (serviceListContainer && pageTitle) {
        let servicesToDisplay = mockServices.filter(service => service.category === displayCategory);

        // 排序邏輯：
        // 1. 將名稱包含 "H168" 的服務挑出來
        // 2. 將非 "H168" 的服務挑出來
        // 3. 分別對這兩組服務按價格升序排序
        // 4. 合併兩組，"H168" 組在前
        const h168Services = servicesToDisplay.filter(s => s.name.includes("H168"));
        const otherServices = servicesToDisplay.filter(s => !s.name.includes("H168"));

        h168Services.sort((a, b) => a.price - b.price);
        otherServices.sort((a, b) => a.price - b.price);

        servicesToDisplay = [...h168Services, ...otherServices];

        pageTitle.textContent = `請選擇您想預約的 - ${pageTitleSuffix}`;
        displayServices(servicesToDisplay);

    } else {
        console.error("Element with ID 'service-list-container' or '.page-title' not found.");
    }

    function displayServices(services) {
        serviceListContainer.innerHTML = '';
        if (services.length === 0) {
            serviceListContainer.innerHTML = `<p style="text-align:center;">此分類目前無 ${pageTitleSuffix} 項目。</p>`;
            return;
        }
        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <img src="${service.image_url}" alt="${service.name}">
                <h3>${service.name}</h3>
                <p class="service-price">NT$ ${service.price.toLocaleString()}</p>
                <button class="select-service-btn" data-service-id="${service.id}" data-service-name="${service.name}">選擇此服務</button>
            `;
            serviceListContainer.appendChild(card);

            const button = card.querySelector('.select-service-btn');
            button.addEventListener('click', function() {
                const selectedServiceId = this.dataset.serviceId;
                const selectedServiceName = this.dataset.serviceName;
                console.log(`選擇的服務: ${selectedServiceName} (ID: ${selectedServiceId})`);
                alert(`您選擇了：${selectedServiceName}\n接下來將前往選擇分店。`);

                const nextPage = 'select-store.html';
                const params = `?serviceId=${selectedServiceId}&serviceName=${encodeURIComponent(selectedServiceName)}`;

                if (liff.isInClient()) {
                    liff.openWindow({
                       url: `https://beautysalons-liff.pages.dev/${nextPage}${params}`,
                       external: false
                    });
                } else {
                     window.location.href = `${nextPage}${params}`;
                }
            });
        });
    }
});
