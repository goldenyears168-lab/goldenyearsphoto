/* ==================================================
 * [V9.0 升級] 核心互動邏輯
 * 1. 處理漢堡選單 (Toggle) 的 ARIA 狀態與 [hidden]
 * 2. 處理行動版下拉選單 (Dropdown) 的點擊 (僅限行動版)
 * 3. 處理點擊外部 (Click Outside) 關閉選單
 *
 * 註：此檔案是 V6.2 的 "完全替換版"，
 * 專為 V9.0 的 <button> 與 ARIA 架構設計。
 * ==================================================
 */
(function(){
  
  const toggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) {
    console.warn('V9.0: 找不到漢堡鈕 (toggle) 或導覽列 (nav) 元素。');
    return;
  }

  // [ 🚀 V10.0 補強 ] 保險：避免在 form 中提交
  if (!toggle.hasAttribute('type')) toggle.setAttribute('type', 'button');
  document.querySelectorAll('.nav-dropdown-trigger').forEach(btn=>{
    if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
  });

  // --- 1. 主選單開關 (Toggle) ---
  
  function setOpen(open){
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      nav.hidden = false;
      nav.classList.add('is-open'); // .is-open 用於 CSS 過渡
      document.documentElement.classList.add('nav-open'); // 可選：鎖定 body 滾動
    } else {
      nav.classList.remove('is-open');
      nav.hidden = true;
      document.documentElement.classList.remove('nav-open');
    }
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  });

  // --- 2. 下拉選單 (Dropdown) ---
  // [ 顧問強化 ] 僅在行動版啟用 JS 點擊，桌面版保留 CSS :hover
  
  const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');
  const mediaQuery = window.matchMedia('(max-width: 992px)');

  function handleDropdownClick(btn, panel) {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded; // true -> 收合
  }

  dropdownTriggers.forEach(btn => {
    const controls = btn.getAttribute('aria-controls');
    const panel = controls && document.getElementById(controls);
    if (!panel) return;

    btn.addEventListener('click', () => {
      // [ V9.0 關鍵 ] 僅在行動版(992px以下)執行點擊切換
      if (mediaQuery.matches) {
        handleDropdownClick(btn, panel);
      }
    });
  });

  // [ V9.0 關鍵 ] 
  // 當視窗從 mobile resize 到 desktop 時，重設所有下拉選單狀態
  mediaQuery.addEventListener('change', (e) => {
    if (!e.matches) { // 進入桌面版 (non-mobile)
      dropdownTriggers.forEach(btn => {
        const controls = btn.getAttribute('aria-controls');
        const panel = controls && document.getElementById(controls);
        if (panel) {
          btn.setAttribute('aria-expanded', 'false');
          panel.hidden = true; // 隱藏所有面板，交給 CSS :hover
        }
      });
      
      // 並確保主選單也關閉
      setOpen(false);
    }
  });

  // --- 3. 點擊外部 (Click Outside) ---
  
  document.addEventListener('click', (e)=>{
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
      setOpen(false);
    }
  });
  
  // --- [ 🚀 V10.0 補強 ] 4. 鍵盤與連結點擊 ---

  // Esc 關閉（主選單與任何展開的 dropdown）
  document.addEventListener('keydown', (e)=>{
    if (e.key !== 'Escape') return;
    let changed = false;
    dropdownTriggers.forEach(btn => {
      // 檢查是否展開
      if (btn.getAttribute('aria-expanded') === 'true') {
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) { 
          btn.setAttribute('aria-expanded','false'); 
          panel.hidden = true; 
          changed = true; 
        }
      }
    });
    // 如果主選單是開的，也關閉它
    if (nav.classList.contains('is-open')) { 
      setOpen(false); 
      changed = true; 
    }
    // 如果有任何狀態改變，阻止預設行為 (例如 Esc 可能會停止頁面載入)
    if (changed) e.preventDefault();
  });

  // 行動：點選單連結後自動關閉（避免殘留）
  nav.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    // 如果點擊的不是 <a> 連結，就不用動作
    if (!a) return; 
    
    // [ 顧問強化 ] 僅在行動版 (mediaQuery.matches) 點擊連結時關閉
    if (mediaQuery.matches) {
      setOpen(false);
    }
  });

  /* ========== 5) [移植 V6.2] Index 圖庫篩選 ========== */
  // (此邏輯與 Header 無關，但若您需要，可保留)
  const filterContainer = document.querySelector('.portfolio-filter');
  
  if (filterContainer) {
    const buttons = document.querySelectorAll('.portfolio-filter .filter-btn');
    const items = document.querySelectorAll('.portfolio-gallery .gallery-item');

    buttons.forEach(btn => { if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button'); });

    function applyFilter(category) {
      items.forEach(item => {
        const match = (category === 'all') || (item.dataset.category === category);
        item.style.display = match ? '' : 'none';
      });
      buttons.forEach(b => {
        b.classList.toggle('active', b.dataset.filter === category);
      });
    }

    const defaultCategory = buttons[0]?.dataset.filter || 'all';
    applyFilter(defaultCategory); 

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        applyFilter(btn.dataset.filter);
      });
    });

    const hash = new URLSearchParams(location.hash.replace(/^#/, '')).get('filter');
    if (hash) {
      const target = [...buttons].find(b => b.dataset.filter === hash);
      if (target) target.click();
    }
  }

})();