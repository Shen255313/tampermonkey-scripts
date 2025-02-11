// ==UserScript==
// @name         網頁小說舒適閱讀 (ComfyNovRead)
// @namespace    https://github.com/Shen255313
// @version      1.0.0
// @description  提供舒適的網頁小說閱讀體驗
// @author       ShenYJ
// @match        http*://*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_deleteTab
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// ==/UserScript==

(function() {
    'use strict';

    // 語言包
    const lang = {
        set: '設置',
        autoScroll: '自動捲動',
        autoEnable: '自動啟用',
        hideImagesKeepText: '隱藏圖片只留文字',
        websiteConfig: '網站配置',
        whitelist: '白名單',
        blacklist: '黑名單',
        officialWebsite: '官網', // 新增：對應 Telegram -> 官網

        iconPosition: '圖示位置', // (保留，但主要選單不再顯示)
        playVideo: '視訊解析', // (保留，但主要選單不再顯示)
        playMusic: '音樂下載', // (保留，但主要選單不再顯示)
        zhNice: '知乎增強', // (保留，但主要選單不再顯示)
        videoDownload: '影片下載', // (保留，但主要選單不再顯示)
        nightMode: '夜間模式', // (為了對應程式碼中的 "夜間模式" 選單項，新增)
        telegram: 'Telegram', // (為了對應程式碼中原有的 Telegram 連結，但主要選單不再顯示)

        iconHeight: '圖標高度', // (保留，次級選單文字)
        iconWidth: '圖標大小', // (保留，次級選單文字)
        iconLine: '水平位置', // (保留，次級選單文字)
        iconWaitTime: '等待時間', // (保留，次級選單文字)
        iconLeft: '靠左', // (保留，次級選單文字)
        iconRight: '靠右', // (保留，次級選單文字)
        tipIconHeight: '默認360,建議1~500', // (保留，次級選單文字)
        tipIconWidth: '默認40,建議20~50', // (保留，次級選單文字)
        tipIconOpacity: '請填寫0-100的整數', // (保留，次級選單文字)
        setPlayVideo: '解析設置', // (保留，次級選單文字)
        playVideoLineAdd: '站外解析', // (保留，次級選單文字)
        tipPlayVideoLineAdd: '請填入線路名稱和地址，中間用半角逗號隔開，每線路一行。', // (保留，次級選單文字)
        zhSet: '知乎設置', // (保留，次級選單文字)
        zhVideoClose: '屏蔽視頻', // (保留，次級選單文字)
        zhVideoDownload: '視頻下載', // (保留，次級選單文字)
        zhADClose: '屏蔽廣告', // (保留，次級選單文字)
        zhCloseLeft: '關閉側邊欄', // (保留，次級選單文字)
        zhChangeLink: '鏈接直接跳轉', // (保留，次級選單文字)
        specialColumn: '標記文章', // (保留，次級選單文字)
        videoTitle: '標記視頻', // (保留，次級選單文字)
        scriptsinstall: '腳本安裝', // (保留，腳本底部連結文字)
        scriptsuse: '使用方法', // (保留，腳本底部連結文字)
        question: '常見問題', // (保留，腳本底部連結文字)
        tggroup: 'Telegram' // (保留，但腳本底部連結文字會改為官網)
    };

    /**
     * TestMenu 類別 - 負責創建和管理腳本的主選單和設置選單。
     */
    class TestMenu {
        constructor() {
            // 構造函數 - 在類別實例化時執行。
            this.initMenu(); // 初始化主選單
            this.iconVipTop = 360; // 設定初始圖標垂直位置 (默認為 360px)
            this.iconVipPosition = 'left'; // 設定初始圖標水平位置 (默認為靠左)
        }

        /**
         * initMenu 方法 - 初始化主選單，註冊選單命令並設定樣式。
         */
        initMenu() {
            // 註冊菜單命令 - 使用 GM_registerMenuCommand 在 Greasemonkey 選單中註冊一個命令。
            GM_registerMenuCommand(lang.set, () => this.menuSet()); // 當點擊 "設置" 選單項目時，執行 this.menuSet 方法。
            this.setStyle(); // 設定選單樣式
        }

        /**
         * setStyle 方法 - 設定選單的 CSS 樣式。
         */
        setStyle() {
            // 創建 style 元素 - 用於將 CSS 樣式添加到頁面 head 中。
            const domStyle = document.createElement('style');
            // 取得 head 元素 -  用於將 style 元素添加到 head 中。
            const domHead = document.getElementsByTagName('head')[0];

            // 定義選單樣式字串 - 包含所有選單和設置頁面的 CSS 樣式。
            let menuSetStyle = `
                /* 遮罩層樣式 - 用於在彈出選單時遮蓋背景內容 */
                .zhmMask{
                    z-index:999999999; /* 設定 z-index 為極高值，確保遮罩層在最上層 */
                    background-color:#000; /* 設定背景顏色為黑色 */
                    position: fixed;top: 0;right: 0;bottom: 0;left: 0; /* 設定固定定位，覆蓋整個視窗 */
                    opacity:0.8; /* 設定透明度為 0.8 */
                }
                /* 選單容器樣式 - 包裹整個設置選單 */
                .zhm_wrap-box{
                    z-index:1000000000; /* 設定 z-index 為極高值，確保選單容器在遮罩層之上 */
                    position:fixed;top: 50%;left: 50%;transform: translate(-50%, -200px); /* 設定固定定位，並將選單容器移動到視窗中心上方一點 */
                    width: 300px; /* 設定寬度為 300px */
                    color: #555; /* 設定文字顏色為 #555 */
                    background-color: #fff; /* 設定背景顏色為白色 */
                    border-radius: 5px; /* 設定邊框圓角為 5px */
                    overflow:hidden; /* 超出容器範圍的內容隱藏 */
                    font:16px numFont,PingFangSC-Regular,Tahoma,Microsoft Yahei,sans-serif !important; /* 設定字體大小和字體族 */
                    font-weight:400 !important; /* 設定字體粗細 */
                }
                /* 選單列表容器樣式 - 包裹選單項目的 ul 元素 */
                .zhm_setWrapLi{
                    margin:0px;padding:0px; /* 清除外邊距和內邊距 */
                }
                /* 選單項目樣式 - 選單中的每個 li 元素 */
                .zhm_setWrapLi li{
                    background-color: #fff; /* 設定背景顏色為白色 */
                    border-bottom:1px solid #eee; /* 設定底部邊框為 1px 實線 #eee */
                    margin:0px !important; /* 清除外邊距並強製覆蓋 */
                    padding:12px 20px; /* 設定上下內邊距為 12px，左右內邊距為 20px */
                    display: flex; /* 使用 flexbox 佈局 */
                    justify-content: space-between;align-items: center; /* 將項目分散對齊，並垂直置中對齊 */
                    list-style: none; /* 移除列表項目符號 */
                }
                /* 選單項目內容容器樣式 - 包裹選單項目文字和開關的容器 */
                .zhm_setWrapLiContent{
                    display: flex;justify-content: space-between;align-items: center; /* 使用 flexbox 佈局，分散對齊並垂直置中對齊 */
                }
                /* 選單底部樣式 - 選單底部的頁腳區域 */
                .zhm_iconSetFoot{
                    position:absolute;bottom:0px;padding:10px 20px;width:100%; /* 設定絕對定位在容器底部，並設定內邊距和寬度 */
                    z-index:1000000009;background:#fef9ef; /* 設定 z-index 和背景顏色 */
                }
                /* 選單底部列表容器樣式 - 包裹底部連結的 ul 元素 */
                .zhm_iconSetFootLi{
                    margin:0px;padding:0px; /* 清除外邊距和內邊距 */
                }
                /* 選單底部列表項目樣式 - 底部連結的每個 li 元素 */
                .zhm_iconSetFootLi li{
                    display: inline-flex; /* 使用 inline-flex 佈局，使項目水平排列 */
                    padding:0px 2px; /* 設定左右內邊距 */
                    justify-content: space-between;align-items: center; /* 分散對齊並垂直置中對齊 */
                    font-size: 12px; /* 設定字體大小為 12px */
                }
                /* 選單底部連結樣式 - 底部連結的 a 元素 */
                .zhm_iconSetFootLi li a{
                    color:#555; /* 設定文字顏色為 #555 */
                }
                /* 設置頁面樣式 - 次級設置頁面的容器 */
                .zhm_iconSetPage{
                    z-index:1000000001; /* 設定 z-index，確保在選單容器之上 */
                    position:absolute;top:0px;left:300px; /* 設定絕對定位在選單容器右側，初始位置偏移 300px */
                    background:#fff; /* 設定背景顏色為白色 */
                    width:300px; /* 設定寬度為 300px */
                    height:100%; /* 設定高度為 100% (填滿選單容器高度) */
                    display:none; /* 初始狀態隱藏 */
                }
                /* 設置頁面標題容器樣式 - 包裹設置頁面標題的 ul 元素 */
                .zhm_iconSetUlHead{
                    padding:0px;
                    margin:0px; /* 清除外邊距和內邊距 */
                }
                /* 設置頁面標題樣式 - 設置頁面的標題區域 */
                .zhm_iconSetPageHead{
                    border-bottom:1px solid #ccc; /* 設定底部邊框 */
                    height:40px; /* 設定高度為 40px */
                    line-height:40px; /* 設定行高為 40px，垂直置中文字 */
                    display: flex; /* 使用 flexbox 佈局 */
                    justify-content: space-between; /* 分散對齊項目 */
                    align-items: center; /* 垂直置中對齊項目 */
                    background-color:#fe6d73; /* 設定背景顏色為 #fe6d73 */
                    color:#fff; /* 設定文字顏色為白色 */
                    font-size: 15px; /* 設定字體大小為 15px */
                }
                /* 設置頁面列表容器樣式 - 包裹設置項目的 ul 元素 */
                .zhm_iconSetPageLi{
                    margin:0px;padding:0px; /* 清除外邊距和內邊距 */
                }
                /* 設置頁面列表項目樣式 - 設置頁面中的每個 li 元素 */
                .zhm_iconSetPageLi li{
                    list-style: none; /* 移除列表項目符號 */
                    padding:8px 20px; /* 設定上下內邊距為 8px，左右內邊距為 20px */
                    border-bottom:1px solid #eee; /* 設定底部邊框 */
                }
                /* 返回按鈕樣式 - 設置頁面標題中的返回箭頭 */
                .zhm_back{
                    border: solid #FFF; /* 設定邊框樣式 */
                    border-width: 0 3px 3px 0; /* 設定邊框寬度，形成箭頭效果 */
                    display: inline-block; /* 設定為行內塊元素 */
                    padding: 3px; /* 設定內邊距 */
                    transform: rotate(135deg); /* 旋轉 135 度，形成向左箭頭 */
                    -webkit-transform: rotate(135deg); /* 兼容 webkit 瀏覽器 */
                    margin-left:10px; /* 設定左外邊距 */
                    cursor:pointer; /* 設定鼠標指針為手指形狀 */
                }
                /* 向右箭頭樣式 - 選單項目中的向右箭頭，用於展開次級選單 */
                .zhm_to-right{
                    margin-left:20px; /* 設定左外邊距 */
                    display: inline-block; /* 設定為行內塊元素 */
                    padding: 3px; /* 設定內邊距 */
                    transform: rotate(-45deg); /* 旋轉 -45 度，形成向右箭頭 */
                    -webkit-transform: rotate(-45deg); /* 兼容 webkit 瀏覽器 */
                    cursor:pointer; /* 設定鼠標指針為手指形狀 */
                    border: solid #CCC; /* 設定邊框樣式 */
                    border-width: 0 3px 3px 0; /* 設定邊框寬度，形成箭頭效果 */
                }
                /* 禁用狀態的向右箭頭樣式 - 當次級選單不可用時的樣式 */
                .zhm_to-right.disabled{
                    border-color: #EEE; /* 設定邊框顏色為 #EEE */
                    cursor: default; /* 設定鼠標指針為默認箭頭 */
                }
                /* 圓形開關容器樣式 - 包裹圓形開關的容器 */
                .zhm_circular{
                    width: 40px; /* 設定寬度為 40px */
                    height: 20px; /* 設定高度為 20px */
                    border-radius: 16px; /* 設定邊框圓角，使其變成圓形 */
                    transition: .3s; /* 設定過渡效果，使切換更平滑 */
                    cursor: pointer; /* 設定鼠標指針為手指形狀 */
                    box-shadow: 0 0 3px #999 inset; /* 設定內陰影效果 */
                }
                /* 圓形開關按鈕樣式 - 圓形開關內部的圓點按鈕 */
                .zhm_round-button{
                    width: 20px; /* 設定寬度為 20px */
                    height: 20px; /* 設定高度為 20px */
                    border-radius: 50%; /* 設定邊框圓角，使其變成圓形 */
                    box-shadow: 0 1px 5px rgba(0,0,0,.5); /* 設定陰影效果 */
                    transition: .3s; /* 設定過渡效果 */
                    position: relative; /* 設定相對定位，用於移動圓點 */
                }
                /* 文字輸入框容器樣式 - 包裹文字輸入框的容器 */
                .zhm_text-input {
                    font-size: 16px; /* 設定字體大小 */
                    position: relative; /* 設定相對定位 */
                    right:0px; /* 設定右側偏移量 */
                    z-index: 0; /* 設定 z-index */
                }
                /* 文字輸入框主體樣式 - 輸入框的 input 元素 */
                .zhm_text-input__body {
                    -webkit-appearance: none; /* 移除瀏覽器默認樣式 */
                    background-color: transparent; /* 設定背景顏色為透明 */
                    border: 1px solid #c2c2c2; /* 設定邊框 */
                    border-radius: 3px; /* 設定邊框圓角 */
                    height: 1.7em; /* 設定高度 */
                    line-height: 1.7; /* 設定行高 */
                    padding: 2px 1em; /* 設定內邊距 */
                    width:55%; /* 設定寬度為 55% */
                    font-size:14px; /* 設定字體大小為 14px */
                    box-sizing: initial; /* 設定 box-sizing 為 initial */
                }
                /* 下拉選單容器樣式 - 包裹下拉選單的容器 */
                .zhm_select-box {
                    box-sizing: inherit; /* 設定 box-sizing 繼承父元素 */
                    font-size: 16px; /* 設定字體大小 */
                    position: relative; /* 設定相對定位 */
                    width:90px; /* 設定寬度為 90px */
                }
                /* 下拉選單主體樣式 - 下拉選單的 select 元素 */
                .zhm_select-box__body {
                    -webkit-appearance: none; /* 移除瀏覽器默認樣式 */
                    background-color: transparent; /* 設定背景顏色為透明 */
                    border: 1px solid #c2c2c2; /* 設定邊框 */
                    border-radius: 3px; /* 設定邊框圓角 */
                    cursor: pointer; /* 設定鼠標指針為手指形狀 */
                    height: 1.7em; /* 設定高度 */
                    line-height: 1.7; /* 設定行高 */
                    padding-left: 1em; /* 設定左內邊距 */
                    padding-right: calc(1em + 16px); /* 設定右內邊距，預留下拉箭頭空間 */
                    width: 140%; /* 設定寬度為 140% */
                    font-size:14px; /* 設定字體大小為 14px */
                    padding-top:2px; /* 設定上內邊距 */
                    padding-bottom:2px; /* 設定下內邊距 */
                }
                /* 向左移動動畫樣式 - 用於滑動顯示次級選單 */
                .zhm_toLeftMove{
                    animation:moveToLeft 0.5s infinite; /* 應用 moveToLeft 動畫，持續時間 0.5 秒，無限循環 */
                    -webkit-animation:moveToLeft 0.5s infinite; /* 兼容 webkit 瀏覽器 */
                    animation-iteration-count:1; /* 動畫迭代次數為 1 */
                    animation-fill-mode: forwards; /* 動畫結束時保持最後一幀的狀態 */
                }
                /* 向左移動關鍵幀動畫 - 定義向左滑動的動畫效果 */
                @keyframes moveToLeft{
                    from {left:300px;} /* 起始位置：距離左側 300px */
                    to {left:0px;} /* 結束位置：距離左側 0px */
                }
                /* 向左移動關鍵幀動畫 - webkit 兼容 */
                @-webkit-keyframes moveToLeft{
                    from {left:300px;}
                    to {left:0px;}
                }
                /* 向右移動動畫樣式 - 用於滑動隱藏次級選單 */
                .zhm_toRightMove{
                    animation:moveToRight 0.5s infinite; /* 應用 moveToRight 動畫，持續時間 0.5 秒，無限循環 */
                    -webkit-animation:moveToRight 0.5s infinite; /* 兼容 webkit 瀏覽器 */
                    animation-iteration-count:1; /* 動畫迭代次數為 1 */
                    animation-fill-mode: forwards; /* 動畫結束時保持最後一幀的狀態 */
                }
                /* 向右移動關鍵幀動畫 - 定義向右滑動的動畫效果 */
                @keyframes moveToRight{
                    from {left:0px;} /* 起始位置：距離左側 0px */
                    to {left:300px;} /* 結束位置：距離左側 300px */
                }
                /* 向右移動關鍵幀動畫 - webkit 兼容 */
                @-webkit-keyframes moveToRight{
                    from {left:0px;}
                    to {left:300px;}
                }
            `;

            // 將樣式字串添加到 style 元素的文字內容中。
            domStyle.appendChild(document.createTextNode(menuSetStyle));
            // 將 style 元素添加到頁面的 head 中，使樣式生效。
            domHead.appendChild(domStyle);
        }

        /**
         * menuSet 方法 - 創建並顯示設置選單。
         */
        menuSet() {
            // 選單設置數據 - 定義選單項目和對應的設置頁面。
            const setListJson = [
                {listName:lang.autoScroll, setListID:'iconPositionSetPage', setPageID:'', takePlace:'0px'}, // 圖示位置 -> 自動捲動 (移除次級選單)
                {listName:lang.autoEnable, setListID:'movieList', setPageID:'', takePlace:'0px'}, // 視訊解析 -> 自動啟用 (移除次級選單)
                {listName:lang.hideImagesKeepText, setListID:'musicList', setPageID:'', takePlace:''}, // 音樂下載 -> 隱藏圖片只留文字 (移除次級選單)
                {listName:lang.websiteConfig, setListID:'zhihuList', setPageID:'websiteConfigSetPage', takePlace:'220px'}, // 知乎增強 -> 網站配置 (次級選單改為 websiteConfigSetPage)
                {listName:lang.whitelist, setListID:'videoDownloadList', setPageID:'whitelistSetPage', takePlace:'0px'}, // 影片下載 -> 白名單 (次級選單改為 whitelistSetPage)
                {listName:lang.blacklist, setListID:'blackmodeList', setPageID:'blacklistSetPage', takePlace:'0px'}, // 夜間模式 -> 黑名單 (次級選單改為 blacklistSetPage)
                {listName:lang.officialWebsite, setListID:'telegramList', setPageID:'', takePlace:''} // Telegram -> 官網 (移除次級選單)
            ];

            // 創建主選單 HTML - 使用字串模板拼接 HTML 結構。
            let setHtml = '<div id="setMask" class="zhmMask"></div>'; // 添加遮罩層
            setHtml += '<div class="zhm_wrap-box" id="setWrap">'; // 添加選單容器

            // 添加設置選單標題
            setHtml += `
            <ul class='zhm_iconSetUlHead'>
                <li class='zhm_iconSetPageHead'>
                    <span></span>
                    <span>${lang.set}</span> <!- 設定標題文字為 "設置" ->
                    <span class='zhm_iconSetSave'>×</span> <!- 關閉按鈕 ->
                </li>
            </ul>`;

            // 網站配置設置頁面 - 次級設置頁面，用於設定網站配置相關選項。
            setHtml += `
            <div class='zhm_iconSetPage' id='websiteConfigSetPage'>
                <ul class='zhm_iconSetUlHead'>
                    <li class='zhm_iconSetPageHead'>
                        <span class='zhm_back'></span>
                        <span>${lang.websiteConfiguration}</span> <!- 標題：網站配置 ->
                        <span class='zhm_iconSetSave'>×</span>
                    </li>
                </ul>
                <ul class='zhm_iconSetPageLi'>
                    <li>${lang.backgroundColor}
                        <span class='zhm_text-input'>
                            <input type='color' class='zhm_text-input__body' id='backgroundColor' value='#000000'> <!- 背景顏色選擇器，初始值 #000000 ->
                        </span>
                    </li>
                    <li>${lang.textColor}
                        <span class='zhm_text-input'>
                            <input type='color' class='zhm_text-input__body' id='textColor' value='#1eff00'> <!- 文字顏色選擇器，初始值 #1eff00 ->
                        </span>
                    </li>
                    <li>${lang.saturation}：
                        <span class='zhm_text-input'>
                            <input class='zhm_text-input__body' id='saturation' value='100'> <!- 飽和度輸入框，初始值 100 ->
                        </span>
                    </li>
                    <li>${lang.contrast}：
                        <span class='zhm_text-input'>
                            <input class='zhm_text-input__body' id='contrast' value='100'> <!- 對比度輸入框，初始值 100 ->
                        </span>
                    </li>
                    <li>${lang.brightness}：
                        <span class='zhm_text-input'>
                            <input class='zhm_text-input__body' id='brightness' value='100'> <!- 亮度輸入框，初始值 100 ->
                        </span>
                    </li>
                     <li>${lang.linkColor}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='linkColor'>
                                <option value='default' >${lang.default}</option> <!- 連結顏色下拉選單 - 選項：預設 ->
                                <option value='custom' selected>自訂文字顏色</option> <!- 連結顏色下拉選單 - 選項：自訂文字顏色 (預設選中) ->
                            </select>
                        </div>
                    </li>
                    <li>${lang.lineHeight}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='lineHeight'>
                                <option value='default' >${lang.default}</option> <!- 文字行高下拉選單 - 選項：預設 ->
                                <option value='1.0' >1.0</option>
                                <option value='1.2' >1.2</option>
                                <option value='1.4' >1.4</option>
                                <option value='1.6' selected>1.6</option> <!- 文字行高下拉選單 - 選項：1.6 (預設選中) ->
                                <option value='1.8' >1.8</option>
                                <option value='2.0' >2.0</option>
                            </select>
                        </div>
                    </li>
                    <li>${lang.letterSpacing}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='letterSpacing'>
                                <option value='default' >${lang.default}</option> <!- 文字間距下拉選單 - 選項：預設 ->
                                <option value='-2px' >極窄</option>
                                <option value='-1px' >稍窄</option>
                                <option value='0px' selected>正常</option> <!- 文字間距下拉選單 - 選項：正常 (預設選中) ->
                                <option value='1px' >稍寬</option>
                                <option value='2px' >寬</option>
                            </select>
                        </div>
                    </li>
                    <li>${lang.fontSize}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='fontSize'>
                                <option value='default' >${lang.default}</option> <!- 文字大小下拉選單 - 選項：預設 ->
                                <option value='12px' >12px</option>
                                <option value='14px' >14px</option>
                                <option value='16px' selected>16px</option> <!- 文字大小下拉選單 - 選項：16px (預設選中) ->
                                <option value='18px' >18px</option>
                                <option value='20px' >20px</option>
                            </select>
                        </div>
                    </li>
                    <li>${lang.fontFamily}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='fontFamily'>
                                <option value='default' >${lang.default}</option> <!- 文字字體下拉選單 - 選項：預設 ->
                                <option value='serif' >襯線字體</option>
                                <option value='sans-serif' selected>非襯線字體</option> <!- 文字字體下拉選單 - 選項：非襯線字體 (預設選中) ->
                                <option value='monospace' >等寬字體</option>
                            </select>
                        </div>
                    </li>
                </ul>
            </div>`;

            // 白名單設置頁面 - 次級設置頁面，用於設定白名單網址。
            setHtml += `
            <div class='zhm_iconSetPage' id='whitelistSetPage'>
                <ul class='zhm_iconSetUlHead'>
                    <li class='zhm_iconSetPageHead'>
                        <span class='zhm_back'></span>
                        <span>${lang.whitelist}</span> <!- 標題：白名單 ->
                        <span class='zhm_iconSetSave'>×</span>
                    </li>
                </ul>
                <ul class='zhm_iconSetPageLi'>
                    <li>
                        <span>${lang.whitelistAutoComfortRead}</span> <!- 提示文字：名單內的網址將會自動執行舒適閱讀 ->
                    </li>
                    <li>
                        <textarea id='whitelistTextarea' placeholder='${lang.fullWidthInputBox}' style='width:100%;height:200px;'></textarea> <!- 文字區域，用於輸入白名單網址，提示文字為 fullWidthInputBox ->
                    </li>
                </ul>
            </div>`;

            // 黑名單設置頁面 - 次級設置頁面，用於設定黑名單網址。
            setHtml += `
            <div class='zhm_iconSetPage' id='blacklistSetPage'>
                <ul class='zhm_iconSetUlHead'>
                    <li class='zhm_iconSetPageHead'>
                        <span class='zhm_back'></span>
                        <span>${lang.blacklist}</span> <!- 標題：黑名單 ->
                        <span class='zhm_iconSetSave'>×</span>
                    </li>
                </ul>
                <ul class='zhm_iconSetPageLi'>
                    <li>
                        <span>${lang.autoComfortReadDisable}</span> <!- 提示文字：自動舒適閱讀將不會執行 ->
                    </li>
                    <li>
                        <textarea id='blacklistTextarea' placeholder='${lang.fullWidthInputBox}' style='width:100%;height:200px;'></textarea> <!- 文字區域，用於輸入黑名單網址，提示文字為 fullWidthInputBox ->
                    </li>
                </ul>
            </div>`;

            // 主選單列表
            setHtml += '<ul class="zhm_setWrapLi">';

            // 循環處理 setListJson 中的每個選單項目
            setListJson.forEach(item => {
                // 取得選單項目的 GM_value，若 blackmodeList 則預設為 '0'，否則預設為 '22'
                const listValue = GM_getValue(item.setListID, item.setListID=='blackmodeList'?'0':'22');
                // 根據 listValue 決定開關的背景顏色，'22' 代表開啟狀態，其他值代表關閉狀態
                const backColor = listValue != '22' ? '#fff' : '#fe6d73';
                // 根據 listValue 決定開關容器的背景顏色
                const switchBackColor = listValue != '22' ? '#FFF' : '#FFE5E5';

                // 添加選單項目 HTML
                setHtml += `
                <li>
                    <span>${item.listName}</span> <!- 選單項目名稱 ->
                    <div class='zhm_setWrapLiContent'>
                        <div class='zhm_circular' style='background-color:${switchBackColor}' id='${item.setListID}'> <!- 圓形開關容器，ID 為 item.setListID，背景色根據 switchBackColor 決定 ->
                            <div class='zhm_round-button' style='background:${backColor};left:${listValue}px'></div> <!- 圓形開關按鈕，背景色根據 backColor 決定，左偏移根據 listValue 決定 ->
                        </div>
                        <span class='zhm_to-right ${!item.setPageID ? "disabled" : ""}' ${item.setPageID ? `data='${item.setPageID}' takePlace='${item.takePlace}'` : ""}></span> <!- 向右箭頭，若 item.setPageID 存在則啟用，並添加 data 和 takePlace 屬性 ->
                    </div>
                </li>`;
            });

            setHtml += '</ul>'; // 結束主選單列表 ul 標籤

            // 底部
            setHtml += `
            <div class='zhm_iconSetFoot'>
                <ul class='zhm_iconSetFootLi'>
                    <li><a href='https://catlair.github.io/' target='_blank'>${lang.officialWebsite}</a></li> <!- 官網連結，文字為 "官網" ->
                    <li><a href='https://greasyfork.org/zh-TW/scripts/482128-%E7%9E%8E%E4%BA%BA%E5%B7%A5%E5%85%B7%E7%AE%B1' target='_blank'>${lang.scriptsinstall}</a></li> <!- 腳本安裝連結，文字為 "腳本安裝" ->
                    <li><a href='https://github.com/Shen255313/tampermonkey-scripts/blob/main/README.md' target='_blank'>${lang.scriptsuse}</a></li> <!- 使用方法連結，文字為 "使用方法" ->
                    <li><a href='https://github.com/Shen255313/tampermonkey-scripts/blob/main/README.md' target='_blank'>${lang.question}</a></li> <!- 常見問題連結，文字為 "常見問題" ->
                </ul>
            </div>`;

            setHtml += '</div>'; // 結束選單容器 div 標籤

            // 添加到頁面
            const div = document.createElement('div');
            div.id = 'zhmMenu';
            div.innerHTML = setHtml;
            document.body.appendChild(div);

            // 綁定事件
            this.bindEvents();
        }

        bindEvents() {
            // 開關按鈕點擊事件 - 為所有 class 為 .zhm_circular 的元素綁定點擊事件。
            document.querySelectorAll('.zhm_circular').forEach(item => {
                item.addEventListener('click', (e) => {
                    // 取得圓形按鈕元素
                    const button = e.currentTarget.querySelector('.zhm_round-button');
                    // 取得按鈕當前的 left 值 (px 單位) 並轉換為整數
                    const currentLeft = parseInt(button.style.left);
                    // 計算新的 left 值，若當前為 0 則設為 22，否則設為 0，實現開關切換效果
                    const newLeft = currentLeft == 0 ? 22 : 0;

                    // 設定按鈕的 left 值為新的值，實現水平移動
                    button.style.left = newLeft + 'px';
                    // 設定按鈕的背景顏色，根據 newLeft 值判斷，實現顏色切換
                    button.style.background = newLeft == 22 ? '#fe6d73' : '#fff';
                    // 設定開關容器的背景顏色，根據 newLeft 值判斷，實現顏色切換
                    e.currentTarget.style.backgroundColor = newLeft == 22 ? '#FFE5E5' : '#fff';

                    // 使用 GM_setValue 儲存開關狀態，以 e.currentTarget.id 作為 key，newLeft 作為 value
                    GM_setValue(e.currentTarget.id, newLeft);
                });
            });

            // 次級選單切換事件 - 為所有 class 為 .zhm_to-right:not(.disabled) 的元素綁定點擊事件。
            document.querySelectorAll('.zhm_to-right:not(.disabled)').forEach(item => {
                item.addEventListener('click', (e) => {
                    // 取得當前點擊元素 data- 屬性為 'data' 的值，即次級選單的 ID
                    const pageId = e.currentTarget.getAttribute('data');
                    // 根據 pageId 取得次級選單元素
                    const page = document.getElementById(pageId);
                    // 顯示次級選單
                    page.style.display = 'block';
                    // 添加向左移動動畫 class，實現滑動顯示效果
                    page.className = 'zhm_iconSetPage zhm_toLeftMove';
                });
            });

            // 返回按鈕事件 - 為所有 class 為 .zhm_back 的元素綁定點擊事件。
            document.querySelectorAll('.zhm_back').forEach(item => {
                item.addEventListener('click', (e) => {
                    // 取得最近的 class 為 .zhm_iconSetPage 的父元素，即次級選單容器
                    const page = e.currentTarget.closest('.zhm_iconSetPage');
                    // 添加向右移動動畫 class，實現滑動隱藏效果
                    page.className = 'zhm_iconSetPage zhm_toRightMove';
                    // 設定延遲計時器，在動畫結束後隱藏次級選單
                    setTimeout(() => {
                        page.style.display = 'none'; // 隱藏次級選單
                    }, 500); // 延遲 500 毫秒 (0.5 秒)，與動畫時間一致
                });
            });

            // 關閉按鈕事件 - 為所有 class 為 .zhm_iconSetSave 的元素綁定點擊事件。
            document.querySelectorAll('.zhm_iconSetSave').forEach(item => {
                item.addEventListener('click', () => {
                    // 移除 ID 為 'zhmMenu' 的元素，即移除整個設置選單
                    document.getElementById('zhmMenu').remove();
                });
            });
        }
    }

    // 創建 TestMenu 類別的實例，啟動腳本主選單功能。
    new TestMenu();
})();
