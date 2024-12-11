// ==UserScript==
// @name         左右鍵翻頁 Navigate with Arrow Keys
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  使用左右鍵來翻上下頁
// @author       ShenYJ
// @homepage      https://greasyfork.org/zh-TW/scripts/510257-左右鍵翻頁-navigate-with-arrow-keys
// @icon         https://img.ixintu.com/download/jpg/20201127/b2a55453b5000509eda6a939275250e6_512_512.jpg
// @match        *://*/*
// @grant        none
// ==/UserScript==
 
(function() {
    'use strict'; // 使用嚴格模式
 
    // 日誌記錄函數
    function log(message) {
        console.log(`[翻頁腳本] ${message}`); // 在控制台輸出日誌信息
    }
 
    // 配置選項
    const config = {
        prevPageSelectors: ['a', 'button', 'div', 'span'], // 支援的元素選擇器
        nextPageSelectors: ['a', 'button', 'div', 'span'], // 支援的元素選擇器
        prevPageKeywords: ['上一頁', '前一頁', '上一節', '上一章', '上一頁', '前一頁', '前一章', '上一页', '前一页', '上一节', '上一页', '前一页', '前一章'], // 上一頁的同義詞
        nextPageKeywords: ['下一頁', '後一頁', '下一節', '下一章', '下一頁', '後一節', '後一章', '下一页', '后一页', '下一节', '下一页', '后一节', '后一章'], // 下一頁的同義詞
        prevKey: 'ArrowLeft', // 上一頁按鍵
        nextKey: 'ArrowRight', // 下一頁按鍵
        logLevel: 'info' // 日誌記錄級別
    };
 
    // 查找符合條件的元素
    function findPageElement(keywords, selectors) {
        for (const selector of selectors) { // 遍歷所有選擇器
            const elements = document.querySelectorAll(selector); // 查找所有符合選擇器的元素
            for (const element of elements) { // 遍歷所有元素
                for (const keyword of keywords) { // 遍歷所有關鍵詞
                    if (element.textContent.includes(keyword)) { // 如果元素的文本內容包含關鍵詞
                        return element; // 返回該元素
                    }
                }
            }
        }
        return null; // 如果沒有找到符合條件的元素，返回 null
    }
 
    // 處理按鍵事件
    function handleKeydown(event) {
        if (event.key === config.prevKey) { // 如果按下的是上一頁按鍵
            const prevPageElement = findPageElement(config.prevPageKeywords, config.prevPageSelectors); // 查找上一頁的元素
            if (prevPageElement) { // 如果找到上一頁的元素
                prevPageElement.click(); // 點擊該元素
                log('翻到上一頁'); // 記錄日誌
                highlightElement(prevPageElement); // 高亮顯示該元素
            } else {
                log('未找到上一頁的元素'); // 如果沒有找到上一頁的元素，記錄日誌
            }
        } else if (event.key === config.nextKey) { // 如果按下的是下一頁按鍵
            const nextPageElement = findPageElement(config.nextPageKeywords, config.nextPageSelectors); // 查找下一頁的元素
            if (nextPageElement) { // 如果找到下一頁的元素
                nextPageElement.click(); // 點擊該元素
                log('翻到下一頁'); // 記錄日誌
                highlightElement(nextPageElement); // 高亮顯示該元素
            } else {
                log('未找到下一頁的元素'); // 如果沒有找到下一頁的元素，記錄日誌
            }
        }
    }
 
    // 高亮顯示被點擊的元素
    function highlightElement(element) {
        element.style.outline = '2px solid red'; // 設置元素的外框為紅色
        setTimeout(() => {
            element.style.outline = ''; // 500 毫秒後移除外框
        }, 500);
    }
 
    // 防重複點擊機制
    let lastClickTime = 0; // 上次點擊的時間
    function preventDoubleClick() {
        const now = Date.now(); // 獲取當前時間
        if (now - lastClickTime < 1000) { // 如果距離上次點擊的時間小於 1000 毫秒
            return true; // 返回 true，表示重複點擊
        }
        lastClickTime = now; // 更新上次點擊的時間
        return false; // 返回 false，表示不是重複點擊
    }
 
    // 監聽按鍵事件
    document.addEventListener('keydown', (event) => {
        if (preventDoubleClick()) { // 如果是重複點擊
            log('重複點擊，忽略此次操作'); // 記錄日誌
            return; // 忽略此次操作
        }
        handleKeydown(event); // 處理按鍵事件
    });
 
    // 初始掃描現有的 DOM
    function initialScan() {
        log('進行初始掃描'); // 記錄日誌
        const prevPageElement = findPageElement(config.prevPageKeywords, config.prevPageSelectors); // 查找上一頁的元素
        const nextPageElement = findPageElement(config.nextPageKeywords, config.nextPageSelectors); // 查找下一頁的元素
        log(`初始掃描結果: 上一頁元素${prevPageElement ? '已找到' : '未找到'}, 下一頁元素${nextPageElement ? '已找到' : '未找到'}`); // 記錄掃描結果
    }
 
    // 監聽動態加載內容
    const observer = new MutationObserver(() => {
        log('檢測到動態加載內容'); // 記錄日誌
        initialScan(); // 進行初始掃描
    });
 
