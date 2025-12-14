# 代碼遷移建議報告

**掃描日期**: 2025-12-14
**掃描檔案數**: 49
**發現遷移機會**: 7

## 📊 遷移機會統計

- **高優先級**: 0 處
- **中優先級**: 7 處
- **低優先級**: 0 處

---

## 📝 遷移建議（按文件）

### `src/blog/workshop.njk`

**發現 3 處遷移機會**

1. **Card Migration** (第 76 行) - medium 優先級
   - 建議: 使用 card macro: {{ card("default|sand", "", "...") }}
   - 上下文: `d-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div class="bento-card p-6 md:...`

2. **Card Migration** (第 98 行) - medium 優先級
   - 建議: 使用 card macro: {{ card("default|sand", "", "...") }}
   - 上下文: `</ul>
            </div>
            
            <div class="bento-card p-6 md:...`

3. **Card Migration** (第 120 行) - medium 優先級
   - 建議: 使用 card macro: {{ card("default|sand", "", "...") }}
   - 上下文: `                </ul>
        </div>

            <div class="bento-card p-6 md:...`

### `src/guide/crop-tool.njk`

**發現 1 處遷移機會**

1. **Card Migration** (第 85 行) - medium 優先級
   - 建議: 使用 card macro: {{ card("default|sand", "", "...") }}
   - 上下文: `li>
        </ul>
        </div>
        
        <div class="bento-card p-8 md:...`

### `src/index.njk`

**發現 3 處遷移機會**

1. **Card Migration** (第 86 行) - medium 優先級
   - 建議: 使用 card macro: {{ card("default|sand", "", "...") }}
   - 上下文: `-cols-2 gap-6">
        <!-- About Us -->
        <div class="bento-card p-10 bg...`

2. **Card Migration** (第 167 行) - medium 優先級
   - 建議: 使用 card macro: {{ card("default|sand", "", "...") }}
   - 上下文: `-cols-2 lg:grid-cols-3 gap-6 py-16 md:py-24">
    <div class="bento-card md:col-...`

3. **Card Migration** (第 209 行) - medium 優先級
   - 建議: 使用 card macro: {{ card("default|sand", "", "...") }}
   - 上下文: `            APPROVED
      </div>
    </div>

    <div class="bento-card md:col-...`


---

## ✅ 遷移步驟

1. **審查建議**: 檢查每個遷移建議是否適用
2. **逐步遷移**: 一次遷移一個文件，確保功能正常
3. **測試驗證**: 遷移後測試頁面功能和樣式
4. **更新文檔**: 更新相關文檔和註釋

