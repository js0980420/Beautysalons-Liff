// main.js - LIFF 初始化與主選單按鈕事件

document.addEventListener('DOMContentLoaded', async function() {
  // 首先進行 LIFF 初始化
  await liff.init({
      liffId: "2007374001-2YVyxg6e" // 您的 LIFF ID
  });
  const profile = await liff.getProfile();
  const userId = profile.userId;

  // 取得網址參數
  const urlParams = new URLSearchParams(window.location.search);
  const inviter = urlParams.get('inviter');

  // 傳送到後端
  if (inviter && userId) {
    fetch('https://你的API網址/api/record-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviter, userId })
    });
  }

  console.log("LIFF initialized successfully!"); // LIFF 初始化成功！

  // 初始化成功後，再註冊按鈕事件
  // 主選單按鈕事件註冊
  // 依據需求可擴充各功能導向

  const bookingBtn = document.getElementById('booking-btn');
  if (bookingBtn) {
      bookingBtn.addEventListener('click', function() {
          // TODO: 之後替換成實際的「我要預約」功能，例如開啟選擇服務的 LIFF 頁面或發送 Postback
          alert('我要預約功能尚未開放');
          // 範例：如果「我要預約」是要開啟另一個 LIFF 頁面
          // if (liff.isInClient()) {
          //     liff.openWindow({
          //         url: 'https://your-other-liff-url.com/select-service', // 替換成實際的服務選擇 LIFF URL
          //         external: false // 在 LINE 內部開啟
          //     });
          // } else {
          //     window.location.href = 'https://your-other-liff-url.com/select-service'; // 在外部瀏覽器中開啟
          // }
      });
  }

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

  // LIFF 初始化成功後，可以開始使用 LIFF 的各種功能
  if (!liff.isLoggedIn()) {
      // 如果使用者還沒登入，可以選擇引導他們登入
      // 考慮到這可能是主選單頁面，不一定需要強制登入，除非特定功能需要
      // liff.login();
      console.log("User is not logged in to LINE.");
  } else {
      // 如果已登入，可以嘗試獲取使用者資訊
      liff.getProfile()
          .then(profile => {
              console.log("User Profile:", profile); // 使用者資訊
              // 例如：可以在頁面上顯示使用者名稱
              // const userNameElement = document.getElementById('user-name'); // 假設您 HTML 中有此元素
              // if (userNameElement) {
              //     userNameElement.textContent = `歡迎， ${profile.displayName}！`;
              // }
          })
          .catch(err => console.error("Error getting profile:", err)); // 獲取使用者資訊失敗
  }
});
