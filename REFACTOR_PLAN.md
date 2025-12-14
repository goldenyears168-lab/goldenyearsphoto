# 大文件拆分計劃

## 1. main.css (2343 行)

### 建議拆分為以下模塊:

```

main.css (主文件，只包含 @import)

├── modules/variables.css    (~160 行)  - CSS 變量定義

├── modules/base.css         (~960 行)  - 基礎樣式和重置

├── modules/utilities.css     (~287 行)  - 工具類

├── modules/components.css    (~593 行)  - 組件樣式

├── modules/navigation.css   (~200 行)  - 導航相關

└── modules/animations.css   (~143 行)  - 動畫和其他

```


**注意**: Eleventy 使用 PostCSS，需要確認 @import 支持


## 2. identity-test.js (971 行)

### 建議拆分為以下模塊:

```

identity-test.js (主文件，初始化)

├── modules/state.js      - 狀態管理 (state 對象)

├── modules/dom.js        - DOM 元素初始化

├── modules/quiz.js       - 測驗邏輯 (問題渲染、答案處理)

├── modules/results.js    - 結果計算和顯示

└── modules/ui.js         - UI 交互 (動畫、通知等)

```


**注意**: 需要確保模塊間的依賴關係正確
