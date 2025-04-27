# 美容院LINE預約機器人

這是一個基於LINE Messaging API的美容院預約系統機器人，可以處理用戶的服務預約流程，並支持Google Calendar整合。

## 功能特點

- 選擇服務項目（剪髮、染髮、護髮、造型）
- 選擇預約店鋪（根據選擇的服務篩選有提供該服務的店鋪）
- 選擇美容師或不指定
- 選擇預約日期和時間
- 確認預約信息
- Google Calendar整合，自動將預約添加到商家日曆

## 技術棧

- Python Flask: 後端框架
- LINE Messaging API: 機器人介面
- Google Calendar API: 日曆整合
- Gunicorn: WSGI HTTP伺服器

## 部署到Render

1. 在GitHub上創建一個新的倉庫並上傳代碼

2. 註冊一個Render帳戶：https://render.com/

3. 創建新的Web服務：
   - 選擇 "Build and deploy from a Git repository"
   - 連接您的GitHub倉庫
   - 選擇分支（通常是 `main` 或 `master`）

4. 配置服務：
   - 給服務命名（如 `beauty-salon-line-bot`）
   - 選擇運行時環境為 `Python`
   - 構建命令：`pip install -r requirements.txt`
   - 啟動命令：`gunicorn app:app`

5. 設置環境變數：
   - `LINE_CHANNEL_SECRET`: 您的LINE Channel密鑰
   - `LINE_CHANNEL_ACCESS_TOKEN`: 您的LINE訪問令牌
   - `GOOGLE_CALENDAR_CLIENT_ID`: Google Cloud Platform OAuth 2.0 客戶端ID
   - `GOOGLE_CALENDAR_CLIENT_SECRET`: Google Cloud Platform OAuth 2.0 客戶端密鑰
   - `GOOGLE_CALENDAR_REDIRECT_URI`: 授權回調URL（通常是 `https://您的應用網址/google_auth`）
   - `GOOGLE_CALENDAR_ID`: 您的Google日曆ID（通常是您的Gmail地址）

6. 部署服務並等待構建完成

7. 複製生成的URL（如 `https://beauty-salon-line-bot.onrender.com`）

8. 在LINE Developers後台設置Webhook URL為：`https://您的應用網址/callback`

## LINE Bot設置

1. 創建一個LINE開發者帳號：https://developers.line.biz/

2. 創建一個新的Provider和Channel（Messaging API）

3. 獲取Channel Secret和Channel Access Token

4. 啟用Webhook並設置URL為：`https://您的應用網址/callback`

5. 在"Messaging API"設置中，關閉"自動回應訊息"和"加入好友的歡迎訊息"

6. 將生成的QR碼分享給用戶，或將機器人添加到LINE官方帳號

## Google Calendar API設置

1. 訪問 Google Cloud Platform (https://console.cloud.google.com/)

2. 創建一個新的項目

3. 啟用 Google Calendar API

4. 配置 OAuth 同意屏幕：
   - 用戶類型：外部
   - 添加必要的範圍：`.../auth/calendar`
   - 添加測試用戶

5. 創建 OAuth 2.0 客戶端ID：
   - 應用類型：Web應用
   - 授權重定向URL：`https://您的應用網址/google_auth`
   - 記下生成的客戶端ID和客戶端密鑰

6. 創建或選擇一個Google日曆，複製其ID

## 本地開發

1. 安裝依賴：
```
pip install -r requirements.txt
```

2. 設置環境變數（可以創建一個.env文件）：
```
LINE_CHANNEL_SECRET='your_channel_secret'
LINE_CHANNEL_ACCESS_TOKEN='your_channel_access_token'
GOOGLE_CALENDAR_CLIENT_ID='your_google_client_id'
GOOGLE_CALENDAR_CLIENT_SECRET='your_google_client_secret'
GOOGLE_CALENDAR_REDIRECT_URI='your_redirect_uri'
GOOGLE_CALENDAR_ID='your_calendar_id'
```

3. 運行應用：
```
python app.py
```

4. 使用ngrok等工具將本地服務器暴露在互聯網上：
```
ngrok http 5000
```

5. 在LINE Developers後台設置Webhook URL為ngrok產生的公開URL加上"/callback"路徑。

6. 記得在Google Cloud Platform的OAuth重定向URI中也添加ngrok URL加上"/google_auth"路徑。

## 預約流程

1. 用戶添加LINE機器人為好友
2. 用戶發送「預約美容服務」開始預約流程
3. 用戶依次選擇服務項目、店鋪、設計師、日期和時間
4. 用戶輸入姓名
5. 確認預約信息
6. 若已配置Google Calendar，用戶需點擊連結授權訪問Google日曆
7. 預約成功，用戶收到確認通知 