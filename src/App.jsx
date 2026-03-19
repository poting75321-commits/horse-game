import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

點「**Commit changes**」→「**Commit changes**」

---

## 完成後確認 repo 結構

GitHub repo 應該長這樣：
```
📁 src/
   App.jsx
   main.jsx
index.html
main.jsx        ← 這個要刪掉（根目錄的舊檔案）
package.json
vite.config.js
