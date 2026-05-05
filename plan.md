# AI Resume Assistant 開發計劃

## 專案概述

基於提供的設計圖，建立一個 AI Resume Assistant 應用程式，讓使用者能夠上傳履歷並獲得 AI 驅動的個人化建議。

## 1. 元件拆分 (Component Architecture)

### 1.1 主要頁面元件

- **App.jsx** - 主應用程式容器
- **HomePage.jsx** - 主頁面容器

### 1.2 佈局元件 (Layout Components)

- **Header.jsx** - 頂部導航列
  - Logo 區域
  - 標題文字
  - 使用者操作區域 (Log out 按鈕和使用者頭像)

### 1.3 功能元件 (Feature Components)

- **HeroSection.jsx** - 主要標題和描述區域
  - 主標題："AI Resume Assistant"
  - 副標題描述文字
- **UploadSection.jsx** - 履歷上傳區域

  - 檔案圖示
  - "Upload your resume" 標題
  - "Upload Resume" 按鈕
  - 檔案拖放功能

- **SuggestionsSection.jsx** - 建議列表區域
  - "Suggestions" 標題
  - 建議項目列表

### 1.4 UI 元件 (UI Components)

- **Button.jsx** - 可重用按鈕元件
  - Primary 按鈕樣式 (藍色)
  - Secondary 按鈕樣式
- **Icon.jsx** - 圖示元件

  - 檔案圖示
  - 使用者頭像圖示
  - Logo 圖示

- **SuggestionItem.jsx** - 單一建議項目
  - 藍色圓點
  - 建議文字內容

## 2. 產品架構 (Product Architecture)

### 2.1 技術棧

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **CSS Framework**: Tailwind CSS (需要安裝)
- **State Management**: React hooks (useState, useContext)
- **File Upload**: HTML5 File API
- **HTTP Client**: Fetch API 或 Axios

### 2.2 資料夾結構

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Icon.jsx
│   │   └── SuggestionItem.jsx
│   └── features/
│       ├── HeroSection.jsx
│       ├── UploadSection.jsx
│       └── SuggestionsSection.jsx
├── pages/
│   └── HomePage.jsx
├── hooks/
│   ├── useFileUpload.js
│   └── useSuggestions.js
├── services/
│   ├── api.js
│   └── fileService.js
├── utils/
│   ├── constants.js
│   └── helpers.js
├── styles/
│   └── globals.css
├── assets/
│   └── icons/
└── App.jsx
```

### 2.3 狀態管理

- **Local State**: 使用 useState 管理元件內部狀態
- **Global State**: 使用 Context API 管理全域狀態
  - User authentication state
  - Upload progress state
  - Suggestions data

### 2.4 API 架構

```javascript
// API 端點規劃
POST /api/upload-resume     // 上傳履歷檔案
GET  /api/suggestions/:id   // 獲取建議
POST /api/auth/logout       // 使用者登出
```

## 3. Tailwind CSS 規劃

### 3.1 安裝和設定

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3.2 設計系統 (Design System)

#### 3.2.1 顏色調色盤

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6", // 主要藍色
          600: "#2563eb",
          700: "#1d4ed8",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
    },
  },
};
```

#### 3.2.2 字體設定

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Inter', 'system-ui', 'sans-serif'],
},
fontSize: {
  'hero': ['2.5rem', { lineHeight: '3rem' }],      // 主標題
  'section': ['1.5rem', { lineHeight: '2rem' }],   // 區塊標題
  'body': ['1rem', { lineHeight: '1.5rem' }],      // 內文
  'small': ['0.875rem', { lineHeight: '1.25rem' }] // 小字
}
```

#### 3.2.3 間距系統

```javascript
spacing: {
  '18': '4.5rem',
  '72': '18rem',
  '84': '21rem',
  '96': '24rem',
}
```

### 3.3 元件樣式規劃

#### 3.3.1 按鈕樣式

```css
/* Primary Button */
.btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors duration-200;
}
```

#### 3.3.2 卡片樣式

```css
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
}

.card-upload {
  @apply bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center;
}
```

#### 3.3.3 文字樣式

```css
.text-hero {
  @apply text-4xl md:text-5xl font-bold text-gray-900 leading-tight;
}

.text-subtitle {
  @apply text-lg text-gray-600 leading-relaxed;
}

.text-section-title {
  @apply text-2xl font-semibold text-gray-900 mb-6;
}
```

### 3.4 響應式設計

```css
/* 手機版 */
.container-mobile {
  @apply px-4 py-6;
}

/* 平板版 */
.container-tablet {
  @apply md:px-8 md:py-12;
}

/* 桌面版 */
.container-desktop {
  @apply lg:px-12 lg:py-16 xl:px-16;
}
```

### 3.5 動畫效果

```css
.fade-in {
  @apply opacity-0 animate-pulse;
  animation: fadeIn 0.5s ease-in-out forwards;
}

.slide-up {
  @apply transform translate-y-4 opacity-0;
  animation: slideUp 0.6s ease-out forwards;
}
```

## 4. 開發階段規劃

### Phase 1: 基礎設置

1. 安裝 Tailwind CSS
2. 設定基本路由結構
3. 建立基礎元件結構

### Phase 2: UI 元件開發

1. 開發 Header 元件
2. 開發 Button 和 Icon 元件
3. 開發 HeroSection 元件

### Phase 3: 核心功能

1. 實作 UploadSection 元件
2. 實作檔案上傳功能
3. 實作 SuggestionsSection 元件

### Phase 4: 整合和優化

1. API 整合
2. 錯誤處理
3. 效能優化
4. RWD 調整

### Phase 5: 測試和部署

1. 單元測試
2. 整合測試
3. 部署設定

## 5. 注意事項

### 5.1 可訪問性 (Accessibility)

- 使用語義化 HTML 標籤
- 添加適當的 ARIA 標籤
- 確保鍵盤導航支援
- 維持足夠的色彩對比度

### 5.2 效能考量

- 圖片優化和懶加載
- 程式碼分割
- Bundle 大小優化
- 快取策略

### 5.3 安全性

- 檔案類型驗證
- 檔案大小限制
- XSS 防護
- CSRF 保護

這個計劃提供了完整的開發藍圖，可以循序漸進地實現 AI Resume Assistant 應用程式。
