// ==UserScript==
// @name         網頁小說舒適閱讀 (ComfyNovRead)
// @namespace    https://github.com/Shen255313
// @version      1.0.0
// @description  提供舒適的網頁小說閱讀體驗
// @author       ShenYJ
// @match        http*://*/*
// @icon         https://media.istockphoto.com/id/845329690/zh/%E5%90%91%E9%87%8F/%E7%9C%BC%E7%9D%9B%E5%9C%96%E7%A4%BA%E5%90%91%E9%87%8F%E5%9C%96.jpg?s=612x612&w=0&k=20&c=OZpCI7g-jojyrxU9aZcYJKQqz9fZakUOTTzCVkWmscQ=
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
        whitelist: '白名單',
        blacklist: '黑名單',
        hideImagesTextOnly: '隱藏圖片只留文字',
        autoEnable: '自動啟用',
        websiteConfig: '網站配置',
        save: '儲存',
        mainMenu: '主要選單',
        subMenu: '次級選單',
        autoComfortReadDisable: '自動舒適閱讀將不會執行',
        whitelistAutoComfortRead: '名單內的網址將會自動執行舒適閱讀',
        fullWidthInputBox: '滿板輸入框(一行就是一個網址)',
        backgroundColor: '背景顏色',
        textColor: '文字顏色',
        saturation: '飽和度',
        contrast: '對比度',
        brightness: '亮度',
        linkColor: '連結顏色',
        default: '預設',
        lineHeight: '文字行高',
        wordSpacing: '文字間距',
        fontSize: '文字大小',
        fontFamily: '文字字體',
        githubofficialWebsite: 'github官網',
        feedback: '反饋',
    };

    /**
     * TestMenu 類別 - 負責創建和管理腳本的主選單和設置選單。
     */
    class TestMenu {
        constructor() {
            // 構造函數 - 在類別實例化時執行。
            this.initMenu(); // 初始化主選單
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
                    z-index:999999999;
                    background-color:#000;
                    position: fixed;top: 0;right: 0;bottom: 0;left: 0;
                    opacity:0.8;
                }
                /* 選單容器樣式 */
                .zhm_wrap-box{
                    z-index:1000000000;
                    position:fixed;top: 50%;left: 50%;transform: translate(-50%, -200px);
                    width: 300px;
                    color: #555;
                    background-color: #fff;
                    border-radius: 5px;
                    overflow:hidden;
                    font:16px numFont,PingFangSC-Regular,Tahoma,Microsoft Yahei,sans-serif !important;
                    font-weight:400 !important;
                }
                .zhm_setWrapLi{
                    margin:0px;padding:0px;
                }
                .zhm_setWrapLi li{
                    background-color: #fff;
                    border-bottom:1px solid #eee;
                    margin:0px !important;
                    padding:12px 20px;
                    display: flex;
                    justify-content: space-between;align-items: center;
                    list-style: none;
                }
                .zhm_setWrapLiContent{
                    display: flex;justify-content: space-between;align-items: center;
                }
                .zhm_iconSetFoot{
                    position:absolute;bottom:0px;padding:10px 20px;width:100%;
                    z-index:1000000009;background:#fef9ef;
                }
                .zhm_iconSetFootLi{
                    margin:0px;padding:0px;
                }
                .zhm_iconSetFootLi li{
                    display: inline-flex;
                    padding:0px 2px;
                    justify-content: space-between;align-items: center;
                    font-size: 12px;
                }
                .zhm_iconSetFootLi li a{
                    color:#555;
                }
                .zhm_iconSetPage{
                    z-index:1000000001;
                    position:absolute;top:0px;left:300px;
                    background:#fff;
                    width:300px;
                    height:100%;
                    display:none;
                }
                .zhm_iconSetUlHead{
                    padding:0px;
                    margin:0px;
                }
                .zhm_iconSetPageHead{
                    border-bottom:1px solid #ccc;
                    height:40px;
                    line-height:40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color:#fe6d73;
                    color:#fff;
                    font-size: 30px;
                }
                .zhm_iconSetPageLi{
                    margin:0px;padding:0px;
                }
                .zhm_iconSetPageLi li{
                    list-style: none;
                    padding:8px 20px;
                    border-bottom:1px solid #eee;
                }
                .zhm_back{
                    border: solid #FFF;
                    border-width: 0 3px 3px 0;
                    display: inline-block;
                    padding: 3px;
                    transform: rotate(135deg);
                    -webkit-transform: rotate(135deg);
                    margin-left:10px;
                    cursor:pointer;
                }
                .zhm_to-right{
                    margin-left:20px;
                    display: inline-block;
                    padding: 3px;
                    transform: rotate(-45deg);
                    -webkit-transform: rotate(-45deg);
                    cursor:pointer;
                    border: solid #CCC;
                    border-width: 0 3px 3px 0;
                }
                .zhm_to-right.disabled{
                    border-color: #EEE;
                    cursor: default;
                }
                .zhm_circular{
                    width: 40px;
                    height: 20px;
                    border-radius: 16px;
                    transition: .3s;
                    cursor: pointer;
                    box-shadow: 0 0 3px #999 inset;
                }
                .zhm_round-button{
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    box-shadow: 0 1px 5px rgba(0,0,0,.5);
                    transition: .3s;
                    position: relative;
                }
                .zhm_text-input {
                    font-size: 16px;
                    position: relative;
                    right:0px;
                    z-index: 0;
                }
                .zhm_text-input__body {
                    -webkit-appearance: none;
                    background-color: transparent;
                    border: 1px solid #c2c2c2;
                    border-radius: 3px;
                    height: 1.7em;
                    line-height: 1.7;
                    padding: 2px 1em;
                    width:55%;
                    font-size:14px;
                    box-sizing: initial;
                }
                .zhm_color-input {
                    font-size: 16px;
                    position: relative;
                    right:0px;
                    z-index: 0;
                }
                 .zhm_color-input__body {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-color: transparent;
                    border: 1px solid #c2c2c2;
                    border-radius: 3px;
                    height: 1.7em;
                    line-height: 1.7;
                    padding: 2px 1em;
                    width:55%;
                    font-size:14px;
                    box-sizing: initial;
                    cursor: pointer;
                }
                .zhm_select-box {
                    box-sizing: inherit;
                    font-size: 16px;
                    position: relative;
                    width:90px;
                }
                .zhm_select-box__body {
                    -webkit-appearance: none;
                    background-color: transparent;
                    border: 1px solid #c2c2c2;
                    border-radius: 3px;
                    cursor: pointer;
                    height: 1.7em;
                    line-height: 1.7;
                    padding-left: 1em;
                    padding-right: calc(1em + 16px);
                    width: 140%;
                    font-size:14px;
                    padding-top:2px;
                    padding-bottom:2px;
                }
                .zhm_toLeftMove{
                    animation:moveToLeft 0.5s infinite;
                    -webkit-animation:moveToLeft 0.5s infinite;
                    animation-iteration-count:1;
                    animation-fill-mode: forwards;
                }
                @keyframes moveToLeft{
                    from {left:300px;}
                    to {left:0px;}
                }
                @-webkit-keyframes moveToLeft{
                    from {left:300px;}
                    to {left:0px;}
                }
                .zhm_toRightMove{
                    animation:moveToRight 0.5s infinite;
                    -webkit-animation:moveToRight 0.5s infinite;
                    animation-iteration-count:1;
                    animation-fill-mode: forwards;
                }
                @keyframes moveToRight{
                    from {left:0px;}
                    to {left:300px;}
                }
                @-webkit-keyframes moveToRight{
                    from {left:0px;}
                    to {left:300px;}
                }
            `;

            domStyle.appendChild(document.createTextNode(menuSetStyle));
            domHead.appendChild(domStyle);
        }

        /**
         * menuSet 方法 - 創建並顯示設置選單。
         */
        menuSet() {
            // 選單設置數據
            const setListJson = [
                {listName:lang.autoScroll, setListID:'autoScroll', setPageID:'', takePlace:'0px'},
                {listName:lang.autoEnable, setListID:'autoEnable', setPageID:'', takePlace:'0px'},
                {listName:lang.hideImagesTextOnly, setListID:'hideImagesTextOnly', setPageID:'', takePlace:'0px'},
                {listName:lang.whitelist, setListID:'whitelistSetPage', setPageID:'whitelistSetPage', takePlace:'0px'},
                {listName:lang.blacklist, setListID:'blacklistSetPage', setPageID:'blacklistSetPage', takePlace:'0px'},
                {listName:lang.websiteConfig, setListID:'websiteConfigSetPage', setPageID:'websiteConfigSetPage', takePlace:'220px'},
                {listName:lang.githubofficialWebsite, setListID:'officialWebsite', setPageID:'', takePlace:'0px', url: 'https://catlair.github.io/'},
            ];

            // 創建主選單 HTML
            let setHtml = '<div id="setMask" class="zhmMask"></div>';
            setHtml += '<div class="zhm_wrap-box" id="setWrap">';

            // 添加設置選單標題
            setHtml += `
            <ul class='zhm_iconSetUlHead'>
                <li class='zhm_iconSetPageHead'>
                    <span></span>
                    <span>${lang.set}</span>
                    <span class='zhm_iconSetSave'>×</span>
                </li>
            </ul>`;


            // 網站配置設置頁面
            setHtml += `
            <div class='zhm_iconSetPage' id='websiteConfigSetPage'>
                <ul class='zhm_iconSetUlHead'>
                    <li class='zhm_iconSetPageHead'>
                        <span class='zhm_back'></span>
                        <span>${lang.websiteConfig}</span>
                        <span class='zhm_iconSetSave'>×</span>
                    </li>
                </ul>
                <ul class='zhm_iconSetPageLi'>
                     <li>${lang.backgroundColor}
                        <span class='zhm_color-input'>
                            <input type='color' class='zhm_color-input__body' id='backgroundColor' value='#000000'>
                        </span>
                    </li>
                    <li>${lang.textColor}
                        <span class='zhm_color-input'>
                            <input type='color' class='zhm_color-input__body' id='textColor' value='#1eff00'>
                        </span>
                    </li>
                    <li>${lang.saturation}：
                        <span class='zhm_text-input'>
                            <input class='zhm_text-input__body' id='saturation' value='100'>
                        </span>
                    </li>
                    <li>${lang.contrast}：
                        <span class='zhm_text-input'>
                            <input class='zhm_text-input__body' id='contrast' value='100'>
                        </span>
                    </li>
                    <li>${lang.brightness}：
                        <span class='zhm_text-input'>
                            <input class='zhm_text-input__body' id='brightness' value='100'>
                        </span>
                    </li>
                     <li>${lang.linkColor}：
                        <span class='zhm_color-input'>
                            <input type='color' class='zhm_color-input__body' id='linkColor' value='default'>
                        </span>
                    </li>
                    <li>${lang.lineHeight}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='lineHeight'>
                                <option value='default' >${lang.default}</option>
                                <option value='1.5' >${lang.height1_5}</option>
                                <option value='1.8' selected>${lang.height1_8}</option>
                                <option value='2.0' >${lang.height2_0}</option>
                            </select>
                        </div>
                    </li>
                    <li>${lang.wordSpacing}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='wordSpacing'>
                                <option value='default' >${lang.default}</option>
                                <option value='normal' selected>${lang.wordNormal}</option>
                                <option value='loose' >${lang.wordLoose}</option>
                            </select>
                        </div>
                    </li>
                    <li>${lang.fontSize}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='fontSize'>
                                <option value='default' >${lang.default}</option>
                                <option value='14px' >14px</option>
                                <option value='16px' selected>16px</option>
                                <option value='18px' >18px</option>
                                <option value='20px' >20px</option>
                            </select>
                        </div>
                    </li>
                    <li>${lang.fontFamily}：
                        <div class='zhm_select-box'>
                            <select class='zhm_select-box__body' id='fontFamily'>
                                <option value='default' >${lang.default}</option>
                                <option value='serif' >${lang.fontSerif}</option>
                                <option value='sans-serif' selected>${lang.fontSansSerif}</option>
                                <option value='monospace' >${lang.fontMonospace}</option>
                            </select>
                        </div>
                    </li>
                    <li style='color:#999;font-size:13px;padding-top:0px;padding-bottom:4px;'>
                        <hr style='border: 0;border-top: 1px dashed #ccc;margin:10px 0px 4px 0px;'/>
                        * ${lang.settingNotice}
                    </li>
                </ul>
            </div>`;

            // 白名單設置頁面
            setHtml += `
            <div class='zhm_iconSetPage' id='whitelistSetPage'>
                <ul class='zhm_iconSetUlHead'>
                    <li class='zhm_iconSetPageHead'>
                        <span class='zhm_back'></span>
                        <span>${lang.whitelist}</span>
                        <span class='zhm_iconSetSave'>×</span>
                    </li>
                </ul>
                <ul class='zhm_iconSetPageLi'>
                    <li>
                        <span>${lang.whitelistAutoComfortRead}</span>
                    </li>
                    <li>
                        <textarea id='whitelistTextarea' placeholder='${lang.fullWidthInputBox}' style='width:100%;height:200px;'></textarea>
                    </li>
                </ul>
            </div>`;

            // 黑名單設置頁面
            setHtml += `
            <div class='zhm_iconSetPage' id='blacklistSetPage'>
                <ul class='zhm_iconSetUlHead'>
                    <li class='zhm_iconSetPageHead'>
                        <span class='zhm_back'></span>
                        <span>${lang.blacklist}</span>
                        <span class='zhm_iconSetSave'>×</span>
                    </li>
                </ul>
                <ul class='zhm_iconSetPageLi'>
                    <li>
                        <span>${lang.autoComfortReadDisable}</span>
                    </li>
                    <li>
                        <textarea id='blacklistTextarea' placeholder='${lang.fullWidthInputBox}' style='width:100%;height:200px;'></textarea>
                    </li>
                </ul>
            </div>`;

            // 主要選單列表
            setHtml += '<ul class="zhm_setWrapLi">';

            // 循環處理 setListJson 中的每個選單項目
            setListJson.forEach(item => {
                if (item.listName === lang.githubofficialWebsite) {
                    setHtml += `
                    <li>
                        <span><a href='${item.url}' target='_blank' style='color:#555;text-decoration: none;'>${item.listName}</a></span>
                    </li>`;
                } else if (item.listName === lang.websiteConfig || item.listName === lang.whitelist || item.listName === lang.blacklist) {
                    setHtml += `
                    <li>
                        <span>${item.listName}</span>
                        <div class='zhm_setWrapLiContent'>
                            <span class='zhm_to-right ${!item.setPageID ? "disabled" : ""}' ${item.setPageID ? `data='${item.setPageID}' takePlace='${item.takePlace}'` : ""}></span>
                        </div>
                    </li>`;
                } else {
                    const listValue = GM_getValue(item.setListID, '22');
                    const backColor = listValue != '22' ? '#fff' : '#fe6d73';
                    const switchBackColor = listValue != '22' ? '#FFF' : '#FFE5E5';
                    setHtml += `
                    <li>
                        <span>${item.listName}</span>
                        <div class='zhm_setWrapLiContent'>
                            <div class='zhm_circular' style='background-color:${switchBackColor}' id='${item.setListID}'>
                                <div class='zhm_round-button' style='background:${backColor};left:${listValue}px'></div>
                            </div>
                        </div>
                    </li>`;
                }
            });

            setHtml += '</ul>';

            // 底部
            setHtml += `
            <div class='zhm_iconSetFoot'>
                <ul class='zhm_iconSetFootLi'>
                    <li><a href='https://catlair.github.io/' target='_blank'>${lang.githubofficialWebsite}</a></li>
                    <li><a href='https://github.com/Shen255313/tampermonkey-scripts/issues' target='_blank'>${lang.feedback}</a></li>
                </ul>
            </div>`;

            setHtml += '</div>';

            // 添加到頁面
            const div = document.createElement('div');
            div.id = 'zhmMenu';
            div.innerHTML = setHtml;
            document.body.appendChild(div);

            // 綁定事件
            this.bindEvents();
        }

        bindEvents() {
            // 開關按鈕點擊事件
            document.querySelectorAll('.zhm_circular').forEach(item => {
                item.addEventListener('click', (e) => {
                    const button = e.currentTarget.querySelector('.zhm_round-button');
                    const currentLeft = parseInt(button.style.left);
                    const newLeft = currentLeft == 0 ? 22 : 0;

                    button.style.left = newLeft + 'px';
                    button.style.background = newLeft == 22 ? '#fe6d73' : '#fff';
                    e.currentTarget.style.backgroundColor = newLeft == 22 ? '#FFE5E5' : '#fff';

                    GM_setValue(e.currentTarget.id, newLeft);
                });
            });


            // 次級選單切換事件
            document.querySelectorAll('.zhm_to-right:not(.disabled)').forEach(item => {
                item.addEventListener('click', (e) => {
                    const pageId = e.currentTarget.getAttribute('data');
                    const page = document.getElementById(pageId);
                    page.style.display = 'block';
                    page.className = 'zhm_iconSetPage zhm_toLeftMove';
                });
            });

            // 返回按鈕事件
            document.querySelectorAll('.zhm_back').forEach(item => {
                item.addEventListener('click', (e) => {
                    const page = e.currentTarget.closest('.zhm_iconSetPage');
                    page.className = 'zhm_iconSetPage zhm_toRightMove';
                    setTimeout(() => {
                        page.style.display = 'none';
                    }, 500);
                });
            });

            // 關閉按鈕事件
            document.querySelectorAll('.zhm_iconSetSave').forEach(item => {
                item.addEventListener('click', () => {
                    document.getElementById('zhmMenu').remove();
                });
            });
        }
    }

    // 創建 TestMenu 類別的實例，啟動腳本主選單功能。
    new TestMenu();
})();
