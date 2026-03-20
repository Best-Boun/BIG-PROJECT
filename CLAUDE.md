# 🎨 Smart Persona — Frontend Redesign Prompt
## Modern SaaS Style (Vercel / Stripe / Linear Inspired)

---

## 📋 Project Context

ฉันมีโปรเจกต์ React + Vite ชื่อ **Smart Persona** — แพลตฟอร์มหางาน/สร้าง Resume/Portfolio สำหรับมืออาชีพ

**Tech Stack ปัจจุบัน:**
- React 19 + Vite 7 + React Router 7
- react-bootstrap + Bootstrap 5
- framer-motion, react-icons, recharts, chart.js
- Tailwind CSS (ติดตั้งแล้วแต่ถูก comment ออกใน index.css)
- json-server เป็น mock backend (port 3001, 3002, 3003)

**หน้าหลักที่ต้อง Redesign (ทั้ง JSX + CSS):**
1. `Landing.jsx` + `Landing.css` — หน้าแรกสำหรับคนที่ยังไม่ login
2. `ProfileEdit.jsx` — หน้าแก้ไขโปรไฟล์ (ใช้ inline styles เยอะมาก)
3. `ResumeEditor.jsx` — หน้าสร้าง/แก้ Resume มี template preview
4. `JobBrowse.jsx` + `JobDetail.jsx` + CSS — หน้า browse งาน + รายละเอียดงาน
5. `Applications.jsx` + `Applications.css` — หน้าติดตามใบสมัคร

**Components ที่เกี่ยวข้อง:**
- `Header2.jsx` + `Header2.css` — Navbar หลัก
- `Feature1.jsx` + `Feature1.css` — Profile customizer
- `photo-resume-templates.jsx` — Resume templates

---

## 🎯 Design Direction: Modern SaaS

### Philosophy
ต้องการสไตล์ **Modern SaaS** เหมือน Vercel, Stripe, Linear — ดูทางการแต่ไม่เชย, สะอาด, professional, มี personality

### สิ่งที่ต้องเปลี่ยนจากดีไซน์เดิม

**ปัญหาปัจจุบัน:**
- ใช้ `linear-gradient(135deg, #6a11cb, #2575fc)` ซ้ำทุกหน้า — ดู generic
- Inline styles เยอะมาก (โดยเฉพาะ ProfileEdit.jsx) — maintain ยาก
- Card design ใช้ `border-radius: 12-16px` + heavy box-shadow ทุกที่ — ดูเหมือน template
- สี gradient purple-blue ทุกที่ — ดู "AI-generated"
- Animation ใช้ `translateY(-8px)` hover ทุก card — ซ้ำเจน

---

## 📐 Design System Guidelines

### 1. Color Palette

```css
:root {
  /* Primary — เลือก 1 สีหลักที่มี character ไม่ใช่ gradient */
  --color-primary: #0A0A0A;          /* Near-black สำหรับ text หลัก */
  --color-accent: #0066FF;           /* หรือจะเลือก #6366F1 (Indigo) / #2563EB (Blue) */
  --color-accent-light: #EEF2FF;     /* Accent background อ่อน */

  /* Neutrals — ใช้เยอะที่สุด */
  --color-bg: #FAFAFA;               /* Page background */
  --color-surface: #FFFFFF;           /* Card / Panel background */
  --color-border: #E5E7EB;           /* Borders ทั่วไป */
  --color-border-hover: #D1D5DB;     /* Border เมื่อ hover */
  --color-text-primary: #111827;     /* หัวข้อ */
  --color-text-secondary: #6B7280;   /* คำอธิบาย */
  --color-text-tertiary: #9CA3AF;    /* Placeholder, hint */

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}
```

**หลักการ:** ลด gradient ลง ใช้ **solid colors + subtle contrast** แทน — header ไม่จำเป็นต้องเป็น gradient, ใช้ border-bottom แทน box-shadow

---

### 2. Typography

```css
/* ไม่ใช้ Inter เพราะ generic เกินไป — เลือก 1 จากนี้ */

/* Option A: Geist (Vercel style) */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');

/* Option B: Plus Jakarta Sans (modern แต่ warm กว่า) */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* Option C: Satoshi (ถ้าใช้ CDN ได้) หรือ DM Sans */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Type Scale — ใช้ระบบ consistent */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;        /* 16px */
  --text-lg: 1.125rem;      /* 18px */
  --text-xl: 1.25rem;       /* 20px */
  --text-2xl: 1.5rem;       /* 24px */
  --text-3xl: 1.875rem;     /* 30px */
  --text-4xl: 2.25rem;      /* 36px */
  --text-5xl: 3rem;          /* 48px */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  --tracking-tight: -0.025em;  /* สำหรับหัวข้อใหญ่ */
  --tracking-normal: 0;
}
```

**หลักการ:** หัวข้อใหญ่ใช้ `font-weight: 700-800` + `letter-spacing: -0.025em` (tight tracking เหมือน Vercel), body ใช้ `400-500`

---

### 3. Spacing & Layout

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  --container-max: 1200px;
  --container-narrow: 768px;
}
```

**หลักการ:** ลด border-radius จาก 12-16px ลงมาที่ **6-8px** (ดู sharp + professional กว่า), section padding ใช้ `80px → 96-120px` ให้ breathe มากขึ้น

---

### 4. Shadows & Borders

```css
:root {
  /* ใช้ border แทน heavy shadow */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

**หลักการ Vercel/Stripe:**
- ใช้ `border: 1px solid var(--color-border)` เป็นหลัก — shadow เบามาก
- Hover state = เปลี่ยน border-color + เพิ่ม shadow เล็กน้อย
- **ไม่ใช้** `box-shadow: 0 15px 40px rgba(106, 17, 203, 0.2)` แบบเดิม

---

### 5. Components Pattern

#### Cards
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
  /* ไม่ translateY — แค่เปลี่ยน border + shadow เบาๆ */
}
```

#### Buttons
```css
/* Primary */
.btn-primary {
  background: var(--color-text-primary);   /* ปุ่มดำ เหมือน Vercel */
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: opacity 0.15s ease;
  cursor: pointer;
}
.btn-primary:hover { opacity: 0.85; }

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btn-secondary:hover {
  background: var(--color-bg);
  border-color: var(--color-border-hover);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  padding: 8px 12px;
  border-radius: var(--radius-md);
}
.btn-ghost:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
}
```

#### Inputs
```css
.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
}
.input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}
.input::placeholder {
  color: var(--color-text-tertiary);
}
```

#### Badges / Tags
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.badge-accent {
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-color: transparent;
}
```

---

### 6. Animation Guidelines

```css
/* Transition ค่า default — เร็วและ subtle */
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

**หลักการ:**
- **ลด animation ลง** — Vercel/Stripe ใช้น้อยมาก, ทำ subtle
- **Page load:** ใช้ `opacity: 0 → 1` + `translateY(8px → 0)` stagger delay ไม่เกิน 0.3s
- **Hover:** เปลี่ยนแค่ `opacity`, `border-color`, `background` — ไม่ `translateY`
- **Modal:** `scale(0.95) → scale(1)` + `opacity: 0 → 1` ระยะเวลา 0.2s
- **ไม่ใช้** `translateY(-8px)` hover ทุก card แบบเดิม
- **ไม่ใช้** `animation: pulse-bg 15s infinite` แบบเดิม

---

## 📄 Per-Page Redesign Instructions

### Page 1: Landing.jsx + Landing.css

**เดิม:** gradient purple-blue hero, heavy card hover effects, emoji icons
**ใหม่:**

```
Hero Section:
- Background: สีขาว/เกือบขาว ไม่ใช่ gradient — หรือถ้าอยากได้ gradient ใช้ subtle mesh ไม่ใช่ linear-gradient จัดๆ
- Title: font-size: 3.5-4rem, font-weight: 800, letter-spacing: -0.03em, color: near-black
- Subtitle: font-size: 1.125rem, color: gray-500, max-width: 580px, center
- CTA buttons: ปุ่มดำ (primary) + ปุ่ม border (secondary)
- ลบ ::before pseudo-element animation

Features Section:
- Grid 3 columns, cards มี border: 1px solid #E5E7EB ไม่ใช่ shadow heavy
- Icon: ใช้ react-icons (Lucide style) ใน container สี accent-light ขนาด 40x40
- ลบ translateY(-8px) hover

Social Proof:
- ลบ gradient background, ใช้ bg สีอ่อน + ตัวเลขใหญ่ bold
- ลดการใช้ emoji

How It Works:
- ใช้ numbered steps (01, 02, 03) แทน emoji
- เพิ่มเส้น connector ระหว่าง steps

Testimonials:
- Simple quote + avatar + name, ไม่ต้อง star rating ก็ได้
- ลบ heavy border + gradient bg

CTA Section:
- ใช้ background เดียวกับ hero (สีอ่อน) + ปุ่มดำ
```

### Page 2: ProfileEdit.jsx

**เดิม:** inline styles ทุกอย่าง, modal popups, gradient buttons
**ใหม่:**

```
Architecture:
- ย้าย inline styles → CSS file (ProfileEdit.css)
- ใช้ CSS variables จาก design system

Layout:
- Left sidebar (nav tabs) + right content area
- หรือ vertical tabs ด้านบน (About, Experience, Education, Skills, Projects...)
- Section headers ใช้ text-sm uppercase tracking-wide gray

Forms:
- Label: font-weight: 500, color: text-secondary, font-size: text-sm
- Input: ใช้ pattern จาก design system ด้านบน
- ปุ่ม Save/Cancel: ใช้ btn-primary + btn-secondary

Modals:
- Overlay สี rgba(0,0,0,0.4) — ไม่ใช่ 0.5
- Modal width: max-width 480px
- Header + body + footer pattern ชัดเจน
- Animation: scale(0.95) → scale(1) + fade

Colors:
- ลบ background: '#27ae60' inline → ใช้ var(--color-success)
- ลบ background: '#95a5a6' → ใช้ var(--color-text-tertiary) + btn-secondary pattern
- ลบ background: '#6a11cb' → ใช้ var(--color-accent) หรือ btn-primary pattern
```

### Page 3: ResumeEditor.jsx

**เดิม:** complex inline logic, zoom controls, template selector
**ใหม่:**

```
Layout:
- 2-panel: Left = form (scrollable), Right = live preview (sticky)
- Ratio ประมาณ 45:55 หรือ 40:60
- Divider: border-right: 1px solid var(--color-border)

Form Side:
- Collapsible sections (accordion style) — ไม่ต้อง scroll หา section
- Section header: ชื่อ + chevron icon + item count badge
- Inputs ใช้ pattern จาก design system

Preview Side:
- Top bar: template selector dropdown + color picker + zoom slider + download btn
- Preview area: centered, มี subtle grid/dot background pattern
- Scale control: ปุ่ม - / slider / ปุ่ม +

Template Selector Modal:
- Grid 2-3 columns แสดง template thumbnails
- Selected state: accent border + checkmark
```

### Page 4: JobBrowse.jsx + JobDetail.jsx

**เดิม:** gradient headers, emoji, heavy card effects
**ใหม่:**

```
JobBrowse:
- Search bar: large, centered, minimal — border + icon left, shadow-sm
- Filters: horizontal chip/pill filters (type, level, salary range)
- Job cards: border card ไม่ใช่ shadow, layout = flex row
  - Left: company logo/initial → right: title + company + tags + salary
  - Tags: pill badges เล็กๆ (Full-time, Remote, Senior...)
  - Hover: border-color change only

JobDetail:
- Header: ลบ gradient, ใช้ white bg + back button + breadcrumb
- Content: 2-column (main 65% + sidebar 35%)
  - Main: description, requirements list, company info
  - Sidebar: apply card (sticky), salary, location, posted date
- Requirements: checklist style ไม่ใช่ pill tags
- Apply button: btn-primary ใหญ่เต็ม sidebar width
```

### Page 5: Applications.jsx + Applications.css

**เดิม:** gradient header, emoji stats, progress steps
**ใหม่:**

```
Header:
- ลบ gradient → ใช้ breadcrumb + title text เรียบๆ

Stats:
- 4-column grid, ตัวเลขใหญ่ bold + label เล็กข้างล่าง
- Border card, ไม่ใช่ shadow card
- ไม่ใช้ emoji — ใช้ colored dot หรือ small icon

Application Cards:
- Table-like layout (ไม่ใช่ stacked cards) — เหมือน Linear issues view
- Columns: Company | Position | Status | Date | Actions
- Status: colored dot + text (ไม่ใช่ progress bar steps)
  - Applied = gray, Interview = blue, Offer = green, Rejected = red
- Hover row: background highlight subtle

Filters:
- Tab-style filters (All, Applied, Interview, Offer, Rejected) — not dropdown
- Active tab: bottom border accent
```

### Component: Header2.jsx (Navbar)

**เดิม:** gradient purple-blue background, heavy shadow
**ใหม่:**

```
- Background: white (var(--color-surface))
- Border-bottom: 1px solid var(--color-border)) — ไม่ใช่ box-shadow
- Logo: text only + icon เล็กๆ, color: text-primary
- Nav links: color text-secondary, hover: text-primary
- Active link: font-weight: 600 + color: text-primary (ไม่ใช่ gradient underline)
- Profile icon: circle avatar right side + dropdown
- Height: ~64px
- Position: sticky top: 0
```

---

## ⚙️ Implementation Notes

### Migration Strategy
1. สร้าง `design-system.css` เก็บ CSS variables ทั้งหมด → import ใน `index.css`
2. เปิดใช้ Tailwind CSS กลับมา (uncomment ใน index.css) — ใช้ utility classes แทน inline styles
3. ย้าย inline styles จาก `ProfileEdit.jsx` ไป CSS file ทีละ section
4. เปลี่ยน gradient backgrounds → solid colors + borders ทุกที่
5. เปลี่ยน heavy shadows → subtle borders

### File ที่ต้องแก้
```
src/index.css                    → เปิด Tailwind + import design-system
src/design-system.css            → สร้างใหม่ (CSS variables ทั้งหมด)
src/pages/Landing.jsx            → refactor JSX + ลด emoji
src/pages/Landing.css            → redesign ทั้งหมด
src/pages/ProfileEdit.jsx        → ย้าย inline styles → CSS
src/pages/ProfileEdit.css        → สร้างใหม่
src/pages/ResumeEditor.jsx       → ปรับ layout + styling
src/pages/ResumeEditor.css       → สร้าง/แก้ไข
src/pages/JobBrowse.jsx + .css   → redesign cards + filters
src/pages/JobDetail.jsx + .css   → redesign layout
src/pages/Applications.jsx       → table-like layout
src/pages/Applications.css       → redesign
src/components/Header2.jsx       → white navbar
src/components/Header2.css       → redesign
```

### สิ่งที่ห้ามทำ
- ❌ ห้ามใช้ `linear-gradient(135deg, #6a11cb, #2575fc)` อีก
- ❌ ห้ามใช้ `translateY(-8px)` hover ทุก card
- ❌ ห้ามใช้ emoji เป็น icon หลัก (ใช้ react-icons แทน)
- ❌ ห้ามใช้ `border-radius: 16px` ทุกที่ — ลงมา 6-8px
- ❌ ห้ามใส่ heavy box-shadow ที่มีสี (เช่น rgba(106, 17, 203, 0.2))
- ❌ ห้ามใช้ inline styles ใหม่ — ย้ายไป CSS file

### สิ่งที่ต้องทำ
- ✅ ใช้ CSS variables จาก design-system.css ทุกที่
- ✅ ใช้ `border: 1px solid` เป็น visual separator หลัก
- ✅ ใช้ font-weight heavy (700-800) + tight tracking สำหรับหัวข้อ
- ✅ ใช้ neutral colors (grays) เป็นหลัก, accent color เฉพาะจุดสำคัญ
- ✅ ใช้ whitespace/negative space เยอะ — ให้หายใจได้
- ✅ ใช้ consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 96)
- ✅ Responsive ด้วย CSS Grid + Flexbox (ลด Bootstrap grid ลงได้)

---

## 🖼️ Visual Reference Summary

| Element | เดิม | ใหม่ (SaaS Style) |
|---------|------|-------------------|
| Background | Gradient purple-blue | White / Off-white (#FAFAFA) |
| Cards | Heavy shadow + large radius | 1px border + small radius (8px) |
| Buttons | Gradient + colored | Solid black (primary) + bordered (secondary) |
| Headers | Gradient bg + white text | White bg + dark text + border-bottom |
| Typography | Inter / system font | Plus Jakarta Sans / DM Sans / Geist |
| Icons | Emoji (💼🚀🎨) | react-icons (Lucide / Heroicons style) |
| Hover | translateY(-8px) + shadow | border-color change + subtle shadow |
| Spacing | Tight (padding: 20-30px) | Generous (padding: 48-96px sections) |
| Animation | Heavy (pulse, slide, translate) | Minimal (opacity + border transitions) |

---

## Scope
- Only edit files in src/ directory
- Do NOT modify: server.js, routes/, db.json, ads.json, logs.json