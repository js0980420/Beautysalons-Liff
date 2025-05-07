// 主選單按鈕事件註冊
// 依據需求可擴充各功能導向

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('booking-btn').addEventListener('click', function() {
    alert('我要預約功能尚未開放');
  });
  document.getElementById('query-booking-btn').addEventListener('click', function() {
    alert('查詢預約功能尚未開放');
  });
  document.getElementById('query-remaining-btn').addEventListener('click', function() {
    alert('查詢剩餘堂數功能尚未開放');
  });
  document.getElementById('store-info-btn').addEventListener('click', function() {
    alert('分店資訊功能尚未開放');
  });
  document.getElementById('member-area-btn').addEventListener('click', function() {
    alert('會員專區功能尚未開放');
  });
}); 