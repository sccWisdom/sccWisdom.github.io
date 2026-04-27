# 个人主页 | ZhangSan.dev

这是一个基于 HTML、CSS 和 JavaScript 构建的现代化个人主页网站，采用深色科技风格设计，支持响应式布局，可直接部署到 GitHub Pages。

## 在线预览

将项目部署到 GitHub Pages 后，访问 `https://yourusername.github.io/personal-portfolio` 即可预览。

## 功能特性

- ✨ **深色科技风格**：深蓝渐变背景、玻璃拟态卡片、渐变光效
- 🎨 **响应式设计**：完美适配 PC、平板、手机各种设备
- 🚀 **轻量动画**：打字机效果、卡片悬浮、滚动淡入动画
- 📱 **移动端优化**：可折叠导航栏、单列布局、触摸友好
- 🎯 **无需依赖**：纯原生实现，无需任何框架或构建工具

## 项目结构

```
personal-portfolio/
├── index.html          # 主页面
├── resume.pdf          # 简历文件（需自行添加）
├── README.md           # 项目说明
└── assets/
    ├── images/
    │   └── avatar.png  # 头像图片（需自行添加）
    ├── css/
    │   └── style.css   # 样式文件
    └── js/
        └── main.js     # 交互脚本
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/personal-portfolio.git
cd personal-portfolio
```

### 2. 自定义内容

修改 `index.html` 中的以下内容：

- **个人信息**：姓名、职业、介绍等
- **联系方式**：邮箱、GitHub 链接等
- **项目经历**：项目名称、描述、技术栈
- **工作经历**：公司、职位、时间
- **技能栈**：添加或删减技能标签

### 3. 添加资源文件

将以下文件放到对应目录：

- `assets/images/avatar.png` - 个人头像（建议尺寸：300x300px）
- `resume.pdf` - 个人简历（可选）

### 4. 本地预览

直接在浏览器中打开 `index.html` 文件即可预览效果。

或使用本地服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve
```

然后访问 `http://localhost:8000`

## 部署到 GitHub Pages

### 方法一：GitHub Actions（推荐）

1. 将项目推送到 GitHub 仓库

2. 在仓库 Settings 中：
   - 进入 Pages 设置
   - Source 选择 "GitHub Actions"

3. 创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. 推送代码后，GitHub Actions 会自动部署

### 方法二：手动部署

1. 将项目推送到 GitHub 仓库

2. 在仓库 Settings 中：
   - 进入 Pages 设置
   - Source 选择 "Deploy from branch"
   - Branch 选择 main，文件夹选择 "/ (root)"

3. 几分钟后，访问 `https://yourusername.github.io/personal-portfolio` 即可

## 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- 移动端浏览器

## 自定义指南

### 修改配色

在 `assets/css/style.css` 中修改 CSS 变量：

```css
:root {
    --primary: #6366f1;      /* 主色调 */
    --secondary: #a855f7;    /* 辅助色 */
    --accent: #3b82f6;       /* 强调色 */
}
```

### 修改打字机文字

在 `assets/js/main.js` 中修改 `typewriterTexts` 数组：

```javascript
const typewriterTexts = [
    '你的职业定位 1',
    '你的职业定位 2',
    '你的职业定位 3'
];
```

### 添加新技能

在 `index.html` 中的技能栈部分添加：

```html
<div class="skill-tag">
    <span class="skill-icon">🔥</span>
    新技能名称
</div>
```

## 注意事项

1. **UTF-8 编码**：所有文件必须使用 UTF-8 编码，避免中文乱码
2. **图片优化**：头像和图片建议压缩后再上传，提升加载速度
3. **链接检查**：部署前检查所有链接是否正确
4. **SEO 优化**：可根据需要添加更多 meta 标签

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- Email: zhangsan@example.com
- GitHub: https://github.com/yourname

---

**Made with ❤️ by ZhangSan**
