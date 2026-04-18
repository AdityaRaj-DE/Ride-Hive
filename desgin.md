# Design System: Glassmorphism SaaS (React + Tailwind CSS)

## 1. Design Principles
*   **Clarity & Hierarchy:** Content is king. Use depth (blur and opacity) to create layers, not just decoration.
*   **Functional Glassmorphism:** Use glass effects only for elevated surfaces (cards, modals, navbars) to maintain high performance and readability.
*   **Minimalist Sharpness:** Inspired by Linear and Vercel. High-contrast text, thin borders (1px), and generous whitespace.
*   **Avoid:** Heavy drop shadows, loud gradient backgrounds, over-saturation, and "frosted" text backgrounds that reduce contrast.

---

## 2. Color System
Semantic tokens designed for Tailwind CSS. Use `dark:` variants for theme switching.

| Token | Light Mode (Default) | Dark Mode (`.dark`) | Tailwind Class (Base) |
| :--- | :--- | :--- | :--- |
| **Background** | `#FFFFFF` | `#000000` | `bg-background` |
| **Surface** | `#F9FAFB` | `#0A0A0A` | `bg-surface` |
| **Card (Glass)** | `rgba(255, 255, 255, 0.7)` | `rgba(0, 0, 0, 0.4)` | `bg-card-glass backdrop-blur-md` |
| **Text Primary** | `#111827` | `#EDEDED` | `text-primary` |
| **Text Secondary** | `#4B5563` | `#A1A1AA` | `text-secondary` |
| **Text Muted** | `#9CA3AF` | `#52525B` | `text-muted` |
| **Border** | `rgba(0, 0, 0, 0.1)` | `rgba(255, 255, 255, 0.1)` | `border-border` |
| **Accent** | `#3B82F6` (Blue) | `#60A5FA` | `bg-accent` / `text-accent` |
| **Success** | `#10B981` | `#34D399` | `text-success` |
| **Error** | `#EF4444` | `#F87171` | `text-error` |

---

## 3. Typography System
System fonts preferred (Inter, SF Pro).

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | 36px (2.25rem) | 700 (Bold) | 1.2 | Page Titles |
| **H2** | 30px (1.875rem) | 600 (Semibold) | 1.3 | Section Headers |
| **H3** | 24px (1.5rem) | 600 | 1.4 | Card Titles |
| **Body** | 16px (1rem) | 400 (Regular) | 1.6 | General Reading |
| **Caption** | 14px (0.875rem) | 400 | 1.5 | Metadata / Labels |

---

## 4. Spacing System
**8px Grid System.** Multiples of 4px for fine-tuning.

*   **Scale:** `4px (1), 8px (2), 16px (4), 24px (6), 32px (8), 48px (12), 64px (16)`
*   **Section Padding:** `py-12` to `py-24` (48px - 96px).
*   **Component Gap:** `gap-4` (16px) for standard grids.

---

## 5. Component System

### Button
*   **Base:** `px-4 py-2 rounded-lg font-medium transition-all duration-200`
*   **Primary:** `bg-primary text-background hover:opacity-90` (Inverted for contrast)
*   **Secondary:** `border border-border bg-transparent hover:bg-surface`
*   **Ghost:** `text-secondary hover:text-primary hover:bg-surface`
*   **States:** `disabled:opacity-50 disabled:cursor-not-allowed`

### Input
*   **Style:** `bg-surface/50 border border-border px-3 py-2 rounded-md outline-none transition-colors`
*   **Focus:** `focus:border-accent ring-1 ring-accent/20`
*   **Error:** `border-error text-error placeholder:text-error/50`

### Card (Glass)
*   **Style:** `bg-card-glass backdrop-blur-xl border border-border rounded-xl p-6 shadow-sm`
*   **Elevated:** `hover:border-border/50 hover:shadow-lg transition-shadow`

### Navbar
*   **Style:** `sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border w-full h-16`

### Table
*   **Structure:** `w-full text-left border-collapse`
*   **Row:** `border-b border-border hover:bg-surface/30 transition-colors`

---

## 6. Layout System
*   **Max-Width:** `max-w-7xl` (1280px) for main content.
*   **Sidebar Width:** `240px` fixed, responsive collapse to bottom nav on mobile.
*   **Grid:** Standard 12-column CSS Grid for dashboards.

---

## 7. Dark / Light Mode Strategy
*   **Implementation:** Use `class` strategy in Tailwind.
*   **Logic:** Wrap root with `<div className="dark">`. Use `dark:` prefix for every color token.
*   **Contrast:** Ensure AA accessibility (4.5:1) for all body text. Dark mode uses `#EDEDED` (off-white) instead of pure `#FFFFFF` to reduce eye strain.

---

## 8. Interaction & Motion
*   **Hover:** Subtle opacity shift (0.8) or background tint.
*   **Focus:** Distinct ring (`ring-2 ring-accent/30`) for keyboard navigation.
*   **Transitions:** `transition-all duration-200 ease-in-out`. Avoid bouncy transitions for SaaS.

---

## 9. Do’s and Don’ts
*   **DO:** Use `backdrop-blur-md` on overlapping elements.
*   **DO:** Keep borders thin (1px) and subtle (10-15% opacity).
*   **DON'T:** Use heavy black shadows in dark mode; use border highlights instead.
*   **DON'T:** Overuse glass effects on static, non-floating elements.
