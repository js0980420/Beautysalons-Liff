import os
import json
import datetime
from flask import Flask, request, abort, redirect, url_for
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
    TemplateSendMessage, ButtonsTemplate, PostbackEvent,
    PostbackTemplateAction, MessageTemplateAction, URITemplateAction,
    CarouselTemplate, CarouselColumn, DatetimePickerTemplateAction
)
import pytz
import requests
import uuid
from urllib.parse import urlencode
from dotenv import load_dotenv

# 加載.env文件中的環境變量(本地開發使用)
load_dotenv()

app = Flask(__name__)

# LINE Bot設定
LINE_CHANNEL_SECRET = os.environ.get('LINE_CHANNEL_SECRET', '')
LINE_CHANNEL_ACCESS_TOKEN = os.environ.get('LINE_CHANNEL_ACCESS_TOKEN', '')

# Google Calendar API設定
GOOGLE_CALENDAR_CLIENT_ID = os.environ.get('GOOGLE_CALENDAR_CLIENT_ID', '')
GOOGLE_CALENDAR_CLIENT_SECRET = os.environ.get('GOOGLE_CALENDAR_CLIENT_SECRET', '')
GOOGLE_CALENDAR_REDIRECT_URI = os.environ.get('GOOGLE_CALENDAR_REDIRECT_URI', '')
GOOGLE_CALENDAR_ID = os.environ.get('GOOGLE_CALENDAR_ID', '')

line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)

# 模擬資料庫
shops = {
    'shop1': {'name': '台北店', 'services': ['剪髮', '染髮', '護髮', '造型']},
    'shop2': {'name': '新北店', 'services': ['剪髮', '染髮', '護髮']},
    'shop3': {'name': '桃園店', 'services': ['剪髮', '染髮']}
}

stylists = {
    'shop1': {'stylist1': '設計師Amy', 'stylist2': '設計師Bob', 'stylist3': '設計師Carol'},
    'shop2': {'stylist1': '設計師David', 'stylist2': '設計師Eva'},
    'shop3': {'stylist1': '設計師Frank'}
}

# 服務時長（小時）
service_duration = {
    '剪髮': 1,
    '染髮': 2,
    '護髮': 1,
    '造型': 1.5
}

# 使用者狀態追蹤
user_states = {}

# 暫存預約信息，等待Google Calendar授權
pending_bookings = {}

@app.route("/callback", methods=['POST'])
def callback():
    signature = request.headers['X-Line-Signature']
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)
    
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        print("Invalid signature. Please check your channel access token/channel secret.")
        abort(400)
    
    return 'OK'

@app.route("/google_auth", methods=['GET'])
def google_auth():
    """Google OAuth認證回調處理"""
    code = request.args.get('code')
    state = request.args.get('state')
    
    if not code or not state or state not in pending_bookings:
        return "認證失敗，請重新嘗試預約", 400
    
    # 使用認證碼獲取訪問令牌
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CALENDAR_CLIENT_ID,
        "client_secret": GOOGLE_CALENDAR_CLIENT_SECRET,
        "redirect_uri": GOOGLE_CALENDAR_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    token_response = requests.post(token_url, data=token_data)
    
    if token_response.status_code != 200:
        return "無法獲取訪問令牌，請重新嘗試", 400
    
    tokens = token_response.json()
    access_token = tokens.get('access_token')
    
    # 向Google日曆添加事件
    booking_info = pending_bookings[state]
    
    # 創建Google日曆事件
    create_google_calendar_event(access_token, booking_info)
    
    # 發送LINE訊息，通知用戶預約成功
    send_booking_confirmation(booking_info)
    
    # 移除暫存預約信息
    del pending_bookings[state]
    
    return "預約已成功添加到Google日曆，請返回LINE查看確認通知", 200

def create_google_calendar_event(access_token, booking_info):
    """創建Google日曆事件"""
    calendar_api_url = f"https://www.googleapis.com/calendar/v3/calendars/{GOOGLE_CALENDAR_ID}/events"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # 計算服務結束時間
    start_datetime = datetime.datetime.strptime(f"{booking_info['date']} {booking_info['time']}", "%Y-%m-%d %H:%M")
    service_hours = service_duration.get(booking_info['service'], 1)
    end_datetime = start_datetime + datetime.timedelta(hours=service_hours)
    
    # 創建事件數據
    event_data = {
        "summary": f"{booking_info['service']}預約 - {booking_info['customer_name']}",
        "description": f"服務項目: {booking_info['service']}\n"
                       f"店鋪: {booking_info['shop']}\n"
                       f"設計師: {booking_info['stylist']}\n"
                       f"客戶LINE ID: {booking_info['user_id']}",
        "start": {
            "dateTime": start_datetime.strftime("%Y-%m-%dT%H:%M:%S"),
            "timeZone": "Asia/Taipei"
        },
        "end": {
            "dateTime": end_datetime.strftime("%Y-%m-%dT%H:%M:%S"),
            "timeZone": "Asia/Taipei"
        }
    }
    
    response = requests.post(calendar_api_url, headers=headers, json=event_data)
    
    if response.status_code not in [200, 201]:
        app.logger.error(f"無法創建Google日曆事件: {response.text}")
        return False
    
    event = response.json()
    booking_info['calendar_event_id'] = event.get('id')
    booking_info['calendar_event_link'] = event.get('htmlLink')
    
    return True

def send_booking_confirmation(booking_info):
    """發送預約確認訊息到LINE"""
    user_id = booking_info['user_id']
    
    success_message = f"預約成功！\n\n" \
                     f"服務項目：{booking_info['service']}\n" \
                     f"預約店鋪：{booking_info['shop']}\n" \
                     f"預約設計師：{booking_info['stylist']}\n" \
                     f"預約日期：{booking_info['date']}\n" \
                     f"預約時間：{booking_info['time']}\n\n"
    
    if booking_info.get('calendar_event_link'):
        success_message += f"Google日曆連結: {booking_info['calendar_event_link']}\n\n"
    
    success_message += "期待您的光臨！"
    
    line_bot_api.push_message(
        user_id,
        TextSendMessage(text=success_message)
    )
    
    # 重置用戶狀態
    if user_id in user_states:
        user_states[user_id] = {
            'step': 'init',
            'shop': None,
            'service': None,
            'stylist': None,
            'date': None,
            'time': None
        }

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    user_id = event.source.user_id
    text = event.message.text
    
    # 初始化用戶狀態
    if user_id not in user_states:
        user_states[user_id] = {
            'step': 'init',
            'shop': None,
            'service': None,
            'stylist': None,
            'date': None,
            'time': None
        }
    
    # 根據用戶當前狀態處理消息
    if text == "預約美容服務":
        # 顯示服務選項
        show_service_selection(event, user_id)
    elif user_states[user_id]['step'] == 'selecting_service' and text in ['剪髮', '染髮', '護髮', '造型']:
        # 用戶選擇了服務
        user_states[user_id]['service'] = text
        user_states[user_id]['step'] = 'selecting_shop'
        show_shop_selection(event, user_id)
    elif user_states[user_id]['step'] == 'selecting_shop' and any(shop['name'] == text for shop in shops.values()):
        # 用戶選擇了店鋪
        shop_id = next(k for k, v in shops.items() if v['name'] == text)
        user_states[user_id]['shop'] = shop_id
        user_states[user_id]['step'] = 'selecting_stylist'
        show_stylist_selection(event, user_id)
    elif user_states[user_id]['step'] == 'selecting_stylist':
        # 用戶選擇了設計師或不指定
        shop_id = user_states[user_id]['shop']
        if text == "不指定設計師":
            user_states[user_id]['stylist'] = "any"
        elif text in stylists[shop_id].values():
            stylist_id = next(k for k, v in stylists[shop_id].items() if v == text)
            user_states[user_id]['stylist'] = stylist_id
        else:
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(text="請選擇有效的設計師")
            )
            return
            
        user_states[user_id]['step'] = 'selecting_date'
        show_date_selection(event, user_id)
    elif user_states[user_id]['step'] == 'entering_name':
        # 用戶輸入姓名
        user_states[user_id]['customer_name'] = text
        user_states[user_id]['step'] = 'confirming'
        show_booking_confirmation(event, user_id)
    elif user_states[user_id]['step'] == 'confirming':
        if text == "確認預約":
            # 處理預約確認
            confirm_booking(event, user_id)
        elif text == "取消預約":
            # 重置狀態
            user_states[user_id] = {
                'step': 'init',
                'shop': None,
                'service': None,
                'stylist': None,
                'date': None,
                'time': None
            }
            line_bot_api.reply_message(
                event.reply_token,
                TextSendMessage(text="預約已取消，您可以重新開始預約流程。")
            )
    else:
        # 預設回應
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text="您好！請輸入「預約美容服務」開始預約流程。")
        )

@handler.add(PostbackEvent)
def handle_postback(event):
    user_id = event.source.user_id
    data = event.postback.data
    
    if user_id not in user_states:
        user_states[user_id] = {
            'step': 'init',
            'shop': None,
            'service': None,
            'stylist': None,
            'date': None,
            'time': None
        }
    
    # 解析 postback 數據
    if data.startswith('date_'):
        # 用戶選擇了日期
        selected_date = data.replace('date_', '')
        user_states[user_id]['date'] = selected_date
        user_states[user_id]['step'] = 'selecting_time'
        show_time_selection(event, user_id)
    elif data.startswith('time_'):
        # 用戶選擇了時間
        selected_time = data.replace('time_', '')
        user_states[user_id]['time'] = selected_time
        user_states[user_id]['step'] = 'entering_name'
        
        # 請用戶輸入姓名
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text="請輸入您的姓名，以完成預約")
        )
    elif data == 'datetime_picker':
        # 處理日期時間選擇器
        date = event.postback.params['date']
        time = event.postback.params.get('time', '12:00')
        
        user_states[user_id]['date'] = date
        user_states[user_id]['time'] = time
        user_states[user_id]['step'] = 'entering_name'
        
        # 請用戶輸入姓名
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text="請輸入您的姓名，以完成預約")
        )

def show_service_selection(event, user_id):
    user_states[user_id]['step'] = 'selecting_service'
    
    buttons_template = ButtonsTemplate(
        title='選擇服務項目',
        text='請選擇您需要的服務',
        actions=[
            MessageTemplateAction(label='剪髮', text='剪髮'),
            MessageTemplateAction(label='染髮', text='染髮'),
            MessageTemplateAction(label='護髮', text='護髮'),
            MessageTemplateAction(label='造型', text='造型')
        ]
    )
    
    template_message = TemplateSendMessage(
        alt_text='選擇服務項目',
        template=buttons_template
    )
    
    line_bot_api.reply_message(event.reply_token, template_message)

def show_shop_selection(event, user_id):
    actions = []
    for shop_id, shop_info in shops.items():
        # 檢查該店是否提供所選服務
        if user_states[user_id]['service'] in shop_info['services']:
            actions.append(MessageTemplateAction(
                label=shop_info['name'],
                text=shop_info['name']
            ))
    
    buttons_template = ButtonsTemplate(
        title='選擇美容院',
        text='請選擇您想預約的店鋪',
        actions=actions
    )
    
    template_message = TemplateSendMessage(
        alt_text='選擇美容院',
        template=buttons_template
    )
    
    line_bot_api.reply_message(event.reply_token, template_message)

def show_stylist_selection(event, user_id):
    shop_id = user_states[user_id]['shop']
    
    actions = [MessageTemplateAction(label='不指定設計師', text='不指定設計師')]
    for stylist_id, stylist_name in stylists[shop_id].items():
        actions.append(MessageTemplateAction(
            label=stylist_name,
            text=stylist_name
        ))
    
    buttons_template = ButtonsTemplate(
        title='選擇美容師',
        text='請選擇您想預約的設計師',
        actions=actions[:4]  # LINE限制最多4個按鈕
    )
    
    template_message = TemplateSendMessage(
        alt_text='選擇美容師',
        template=buttons_template
    )
    
    line_bot_api.reply_message(event.reply_token, template_message)

def show_date_selection(event, user_id):
    # 生成未來7天的日期選項
    today = datetime.datetime.now(pytz.timezone('Asia/Taipei'))
    date_actions = []
    
    for i in range(1, 8):  # 從明天開始的7天
        future_date = today + datetime.timedelta(days=i)
        date_str = future_date.strftime('%Y-%m-%d')
        display_str = future_date.strftime('%m/%d (%a)')
        
        date_actions.append(PostbackTemplateAction(
            label=display_str,
            data=f'date_{date_str}'
        ))
    
    # 另一種方式是使用日期選擇器
    date_actions.append(DatetimePickerTemplateAction(
        label='選擇其他日期',
        data='datetime_picker',
        mode='date',
        initial=today.strftime('%Y-%m-%d'),
        min=today.strftime('%Y-%m-%d'),
        max=(today + datetime.timedelta(days=30)).strftime('%Y-%m-%d')
    ))
    
    carousel_template = CarouselTemplate(
        columns=[
            CarouselColumn(
                title='選擇日期',
                text='請選擇預約日期',
                actions=date_actions[:3]
            ),
            CarouselColumn(
                title='選擇日期',
                text='請選擇預約日期',
                actions=date_actions[3:6]
            )
        ]
    )
    
    template_message = TemplateSendMessage(
        alt_text='選擇日期',
        template=carousel_template
    )
    
    line_bot_api.reply_message(event.reply_token, template_message)

def show_time_selection(event, user_id):
    time_slots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
    time_actions = []
    
    for time in time_slots:
        time_actions.append(PostbackTemplateAction(
            label=time,
            data=f'time_{time}'
        ))
    
    carousel_template = CarouselTemplate(
        columns=[
            CarouselColumn(
                title='選擇時間',
                text='上午/中午',
                actions=time_actions[:3]
            ),
            CarouselColumn(
                title='選擇時間',
                text='下午',
                actions=time_actions[3:6]
            ),
            CarouselColumn(
                title='選擇時間',
                text='傍晚',
                actions=time_actions[6:9]
            )
        ]
    )
    
    template_message = TemplateSendMessage(
        alt_text='選擇時間',
        template=carousel_template
    )
    
    line_bot_api.reply_message(event.reply_token, template_message)

def show_booking_confirmation(event, user_id):
    state = user_states[user_id]
    shop_name = shops[state['shop']]['name']
    stylist = stylists[state['shop']].get(state['stylist'], '不指定設計師') if state['stylist'] != 'any' else '不指定設計師'
    
    confirm_text = f"請確認您的預約資訊：\n\n" \
                  f"姓名：{state.get('customer_name', '未提供')}\n" \
                  f"服務項目：{state['service']}\n" \
                  f"預約店鋪：{shop_name}\n" \
                  f"預約設計師：{stylist}\n" \
                  f"預約日期：{state['date']}\n" \
                  f"預約時間：{state['time']}"
    
    buttons_template = ButtonsTemplate(
        title='確認預約',
        text=confirm_text,
        actions=[
            MessageTemplateAction(label='確認預約', text='確認預約'),
            MessageTemplateAction(label='取消預約', text='取消預約')
        ]
    )
    
    template_message = TemplateSendMessage(
        alt_text='確認預約',
        template=buttons_template
    )
    
    line_bot_api.reply_message(event.reply_token, template_message)

def confirm_booking(event, user_id):
    state = user_states[user_id]
    shop_name = shops[state['shop']]['name']
    stylist = stylists[state['shop']].get(state['stylist'], '不指定設計師') if state['stylist'] != 'any' else '不指定設計師'
    
    # 檢查Google Calendar API環境變數
    if GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET and GOOGLE_CALENDAR_REDIRECT_URI:
        # 創建暫存預約信息，等待Google Calendar授權
        booking_uuid = str(uuid.uuid4())
        
        # 保存預約信息
        pending_bookings[booking_uuid] = {
            'user_id': user_id,
            'customer_name': state.get('customer_name', '未提供姓名'),
            'service': state['service'],
            'shop': shop_name,
            'stylist': stylist,
            'date': state['date'],
            'time': state['time'],
            'status': 'pending'
        }
        
        # 生成Google OAuth授權URL
        oauth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode({
            'client_id': GOOGLE_CALENDAR_CLIENT_ID,
            'redirect_uri': GOOGLE_CALENDAR_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'https://www.googleapis.com/auth/calendar',
            'state': booking_uuid,
            'access_type': 'offline',
            'prompt': 'consent'
        })
        
        # 發送授權請求連結
        buttons_template = ButtonsTemplate(
            title='連結到Google日曆',
            text='請點擊下方按鈕連結到Google日曆，以完成預約',
            actions=[
                URITemplateAction(
                    label='連結Google日曆',
                    uri=oauth_url
                )
            ]
        )
        
        template_message = TemplateSendMessage(
            alt_text='連結Google日曆',
            template=buttons_template
        )
        
        line_bot_api.reply_message(event.reply_token, template_message)
    else:
        # 若未設置Google Calendar API，直接確認預約
        booking_info = {
            'user_id': user_id,
            'customer_name': state.get('customer_name', '未提供姓名'),
            'service': state['service'],
            'shop': shop_name,
            'stylist': stylist,
            'date': state['date'],
            'time': state['time'],
            'status': 'confirmed'
        }
        
        # 在實際應用中，這裡應該將預約信息保存到數據庫
        
        # 發送預約成功通知
        success_message = f"預約成功！\n\n" \
                         f"服務項目：{state['service']}\n" \
                         f"預約店鋪：{shop_name}\n" \
                         f"預約設計師：{stylist}\n" \
                         f"預約日期：{state['date']}\n" \
                         f"預約時間：{state['time']}\n\n" \
                         f"期待您的光臨！"
        
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=success_message)
        )
        
        # 重置用戶狀態
        user_states[user_id] = {
            'step': 'init',
            'shop': None,
            'service': None,
            'stylist': None,
            'date': None,
            'time': None
        }

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 