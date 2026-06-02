# CV Generator - Design & Layout Documentation

## 1. Design Concept & Aesthetics
The application adopts a **Modern Minimalist & Professional Dashboard** aesthetic, tailored for users building premium, ATS-friendly CVs. The design prioritizes readability, data density, and effortless navigation over flashy graphics.

- **Color Palette:** Grayscale-heavy (Zinc/Slate) with stark black (`bg-zinc-900`) accents for primary actions. Minimal use of semantic colors (Red for destructive actions/errors, Green for success toasts).
- **Typography:** Sans-serif (Inter/Geist) for clean readability. Extensive use of small, bold, uppercase tracking-widest text (e.g., `text-[11px] uppercase tracking-widest`) for labels and metadata to create a "technical/premium" feel.
- **Borders & Radii:** Sharp or very subtle rounded corners (`rounded-sm`) to maintain a structured, professional document-like vibe rather than a playful app vibe.

## 2. Layout Structure

### 2.1. Global App Layout (Dashboard)
The application utilizes a classic sidebar-navigation layout, fully responsive across devices:
- **Desktop (`md:flex-row`):** A fixed left sidebar (Width: ~64/16rem) and a fluid main content area taking up the remaining width.
- **Mobile (`flex-col`):** The sidebar collapses into a top navigation bar (or hamburger menu), allowing the main content to use the full screen width.

### 2.2. Sidebar Component
- **Top:** Logo and primary navigation links (Master Profile, Resumes, Cover Letters).
- **Bottom:** 
  - **Language Switcher:** A clean toggle for switching between English (EN) and Vietnamese (VI).
  - **User Profile & Plan:** Displays the current user's email, their active package (e.g., FREE), and a Logout button.

### 2.3. Master Profile Form (Main Content)
The core data entry interface is divided into functional blocks:
- **Header Section:**
  - Page Title & Subtitle.
  - **Action Buttons:** AI Import (Sparkles icon) and Save (Save icon).
- **AI Import Panel (Collapsible):**
  - Appears below the header when activated.
  - Features a split layout: A drag-and-drop zone for PDF upload on the left, and a `textarea` for raw text paste on the right.
- **Horizontal Tabs Navigation:**
  - Scrollable (hide scrollbar) tabs to categorize heavy data entry: *Personal, Skills, Experience, Projects, Education, Certifications.*
  - Active tabs are highlighted with a dark bottom border (`border-zinc-900`).

## 3. UI Components & Patterns

### 3.1. Data Cards (`cardCls`)
Each section's content is wrapped in a clean, bordered white card (`bg-white rounded-sm border border-zinc-200 p-6`). This groups related fields (e.g., a single Job Experience or a single Project) clearly.

### 3.2. Form Inputs & Labels
- **Labels (`lbl`):** Consistent `text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-1.5`.
- **Inputs (`inpBox`):** Simple borders (`border-zinc-200`) that darken on focus (`focus:border-zinc-400 focus:ring-1`).
- **Pill Inputs (Tags/Skills):** For array data (e.g., "React", "TypeScript"). Users type and hit Enter/Comma to create removable pill-shaped tags.

### 3.3. Nested Dynamic Fields (e.g., Experience Roles)
For complex hierarchical data (e.g., A company with multiple roles):
- The outer card represents the Company.
- Inner blocks (indented with a left border) represent specific Roles.
- "Remove" buttons (`X` icon) are positioned absolutely in the top-right corner of repeatable cards.

### 3.4. Avatar Upload
A dedicated square dropzone (`w-24 h-24 border-dashed`) inside the Personal tab. Displays a preview image immediately via `FileReader`, and uploads to Supabase Storage upon saving.

## 4. Interaction & Feedback
- **Toasts:** Floating notifications for success or error messages (e.g., "Saved successfully" or "RLS Error"), auto-dismissing after 3 seconds.
- **Loading States:** Buttons disable and show text like "Saving..." or "Analyzing..." during async operations (DB save, AI parse) to prevent duplicate submissions.
- **Cache Invalidation:** Utilizes `router.refresh()` in Next.js App Router to instantly sync UI with freshly saved Database state.
