#!/usr/bin/env python
import os
import sys

def main():
    """
    在本地運行LINE Bot伺服器
    """
    print("啟動美容院LINE Bot預約系統...")
    
    # 檢查環境變數
    missing_vars = []
    if not os.environ.get('LINE_CHANNEL_SECRET'):
        missing_vars.append('LINE_CHANNEL_SECRET')
    if not os.environ.get('LINE_CHANNEL_ACCESS_TOKEN'):
        missing_vars.append('LINE_CHANNEL_ACCESS_TOKEN')
    
    if missing_vars:
        print("錯誤: 缺少以下環境變數:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\n請設置環境變數後再試。例如:")
        print("export LINE_CHANNEL_SECRET='your_channel_secret'")
        print("export LINE_CHANNEL_ACCESS_TOKEN='your_channel_access_token'")
        return 1
    
    # 導入app並運行
    try:
        from app import app
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        print(f"啟動伺服器時發生錯誤: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 