/*
 * 好時有影 V6.2 - 主 JavaScript (最終修復版)
 * 工程師：Gemini
 * 策略：
 * 1. [V6.2 關鍵修復] JS 點擊監聽器 "必須" 先檢查 isDesktop()。
 * 2. [V6.2] e.preventDefault() "只能" 在行動版 (!isDesktop()) 中執行。
 * 3. [V6.1] CSS 100% 負責 Desktop :hover。
 * 4. [V6.1] JS "強制" 清理 L1 (漢堡) 和 L2 (下拉) 選單的 .is-open 狀態。
 */

document.addEventListener('DOMContentLoaded', () => {
  const mqDesktop = window.matchMedia('(min-width: 992px)');
  const isDesktop = () => mqDesktop.matches;

  /* ========== 1) RWD 手機選單 (L1) ========== */
  const toggleButton = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.header-nav');

  if (toggleButton && navMenu) {
    // 點擊漢堡按鈕
    toggleButton.addEventListener('click', () => {
      // (保險) 如果在桌機版，確保選單是關的
      if (isDesktop()) {
        navMenu.classList.remove('is-open');
        toggleButton.innerHTML = '&#9776;';
        return;
      }
      // 切換行動版選單
      const isOpen = navMenu.classList.toggle('is-open');
      toggleButton.innerHTML = isOpen ? '&times;' : '&#9776;';
    });

    // [V6.1 關鍵修復] 斷點切換：*強制*重置 L1 (漢堡) 選單
    mqDesktop.addEventListener('change', () => {
      navMenu.classList.remove('is-open');
      toggleButton.innerHTML = '&#9776;';
    });
  }

  /* ========== 2) Dropdown (L2) - V6.2 簡化邏輯 ========== */
  
  const allDropdowns = document.querySelectorAll('.dropdown');

  // 統一關閉 L2 選單 (行動版)
  const closeAllL2Dropdowns = () => {
    allDropdowns.forEach(dropdown => {
      dropdown.classList.remove('is-open');
      const trigger = dropdown.querySelector('.nav-dropdown-trigger') || dropdown.querySelector(':scope > a');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  };

  // 統一處理所有 L2 下拉選單
  allDropdowns.forEach(dropdown => {
    // [V6.0] 尋找觸發器 (<a> 標籤)
    const trigger = dropdown.querySelector('.nav-dropdown-trigger') || dropdown.querySelector(':scope > a');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (!trigger || !menu) return; // 不是有效的 dropdown

    // a11y 輔助
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    // [ 🚀 關鍵修復 V6.2：JS 只在行動版作用 ]
    trigger.addEventListener('click', (e) => {
      
      // [V6.2 關鍵修復] 1. 檢查是否為桌面版
      if (isDesktop()) {
        // 桌面版 100% 交給 CSS :hover，JS "不" 執行 preventDefault。
        // 允許 href="#" 正常運作，不干擾 CSS :hover。
        return; 
      }
      
      // --- [V6.2] 以下是 "行動版" 邏輯 ---

      // 2. (只在行動版) 阻止 <a> 標籤跳轉
      e.preventDefault(); 
      
      // 3. [V4.2] 檢查目前的狀態
      const wasOpen = dropdown.classList.contains('is-open');

      // 4. [V4.2] 無條件關閉「所有」L2 選單（重置狀態）
      closeAllL2Dropdowns();

      // 5. [V4.2] 如果它原本是關的，就把它打開
      if (!wasOpen) {
        dropdown.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      // (如果它原本是開的，它在步驟 4 已被關閉，任務完成)
    });
  });

  // 全局：點擊選單外部，關閉所有 L2 選單 (行動版)
  document.addEventListener('click', (e) => {
    // 如果點擊的目標不在 .dropdown 內部，則關閉所有
    if (!e.target.closest('.dropdown')) {
      // [FIX] 確保點擊外部時，是呼叫 "關閉所有" 函數
      closeAllL2Dropdowns();
    }
  });

  // [ 🚀 關鍵修復：清理 L2 (下拉) 選單斷點切換 (Bug #B) ]
  const cleanupL2DropdownsOnResize = () => {
    // [FIX V3.9] 移除 if (isDesktop()) 檢查，強制清理
    closeAllL2Dropdowns();
  };

  // 頁面載入時跑一次，並綁定到斷點切換事件
  cleanupL2DropdownsOnResize();
  mqDesktop.addEventListener('change', cleanupL2DropdownsOnResize);


  /* ========== 3) Index 圖庫篩選 (Refactored from index.njk) ========== */
  // 加上防呆檢查，只在有 .portfolio-filter 的頁面執行
  const filterContainer = document.querySelector('.portfolio-filter');
  
  if (filterContainer) {
    const buttons = document.querySelectorAll('.portfolio-filter .filter-btn');
    const items = document.querySelectorAll('.portfolio-gallery .gallery-item');

    // 讓按鈕不觸發 form submit（保險）
    buttons.forEach(btn => { if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button'); });

    // 顯示/隱藏邏輯
    function applyFilter(category) {
      // (優化) 遍歷 items 並設定 display
      items.forEach(item => {
        const match = (category === 'all') || (item.dataset.category === category);
        item.style.display = match ? '' : 'none';
      });
      // (優化) 遍歷 buttons 並設定 active class
      buttons.forEach(b => {
        b.classList.toggle('active', b.dataset.filter === category);
      });
    }

    // 預設：顯示第一個按鈕的分類
    const defaultCategory = buttons[0]?.dataset.filter || 'all';
    applyFilter(defaultCategory); // 預設會自動加上 active class

    // 點擊互動
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        applyFilter(btn.dataset.filter);
      });
    });

    // 支援網址 hash（可選）：#filter=linkedin-portrait
    const hash = new URLSearchParams(location.hash.replace(/^#/, '')).get('filter');
    if (hash) {
      const target = [...buttons].find(b => b.dataset.filter === hash);
      if (target) target.click(); // .click() 會觸發上面的監聽器並執行 applyFilter
    }
  }
  
});