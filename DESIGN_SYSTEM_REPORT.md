# Phrames Design System - Complete Report

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Shadows & Elevation](#shadows--elevation)
7. [Animations & Transitions](#animations--transitions)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)

---

## Brand Identity

### Brand Colors
```css
--phrames-primary: #002400    /* Deep Forest Green */
--phrames-secondary: #00dd78  /* Vibrant Mint Green */
--phrames-bg: #F2FFF2         /* Light Mint Background */
--phrames-foreground: #ffffff /* White */
```

### Logo Usage
- **Primary Logo**: `/logos/Logo-black.svg` (for light backgrounds)
- **Secondary Logo**: `/logos/Logo-white.svg` (for dark backgrounds)
- **Dimensions**: Height 28-32px (desktop), 24px (mobile)

### Brand Voice
- Friendly and approachable
- Clear and concise
- Action-oriented
- Community-focused

---

## Color System

### Primary Colors
```javascript
primary: {
  DEFAULT: '#002400',
  50: '#e6f2e6',
  100: '#ccf5cc',
  200: '#99eb99',
  300: '#66e066',
  400: '#33d633',
  500: '#002400',  // Base
  600: '#001d00',
  700: '#001600',
  800: '#000f00',
  900: '#000800',
}
```

### Secondary Colors
```javascript
secondary: {
  DEFAULT: '#00dd78',
  50: '#e6fff5',
  100: '#ccffeb',
  200: '#99ffd7',
  300: '#66ffc3',
  400: '#33ffaf',
  500: '#00dd78',  // Base
  600: '#00b160',
  700: '#008548',
  800: '#005830',
  900: '#002c18',
}
```

### Gray Scale (Untitled UI)
```javascript
gray: {
  25: '#fcfcfd',
  50: '#f9fafb',
  100: '#f2f4f7',
  200: '#eaecf0',
  300: '#d0d5dd',
  400: '#98a2b3',
  500: '#667085',
  600: '#475467',
  700: '#344054',
  800: '#1d2939',
  900: '#101828',
}
```

### Semantic Colors
```javascript
destructive: 'hsl(0 84.2% 60.2%)'  // Red for errors/delete
muted: 'hsl(140 100% 96%)'         // Light green for backgrounds
accent: 'hsl(158 100% 43%)'        // Secondary green for highlights
```

### Background Colors
```css
--background: hsl(140 100% 98%)     /* Light mint */
--foreground: hsl(0 0% 100%)        /* White */
--card: hsl(0 0% 100%)              /* White */
--popover: hsl(0 0% 100%)           /* White */
--muted: hsl(140 100% 96%)          /* Light mint */
```

### Usage Guidelines
- **Primary (#002400)**: Main text, headings, primary buttons on light backgrounds
- **Secondary (#00dd78)**: CTAs, highlights, active states, success messages
- **Gray Scale**: Supporting text, borders, disabled states
- **White**: Backgrounds, text on dark backgrounds

---

## Typography

### Font Family
```css
font-family: 'Mona Sans', system-ui, sans-serif;
```

### Font Weights
- **200**: Extra Light
- **300**: Light
- **400**: Regular (body text)
- **500**: Medium
- **600**: Semibold (subheadings)
- **700**: Bold (headings)
- **800**: Extra Bold
- **900**: Black

### Type Scale

#### Headings
```css
/* H1 - Hero */
font-size: 56px (desktop) / 32px (mobile)
font-weight: 700
line-height: tight
color: primary

/* H2 - Section Titles */
font-size: 48px (desktop) / 28px (mobile)
font-weight: 700
line-height: tight
color: primary

/* H3 - Card Titles */
font-size: 24px (desktop) / 20px (mobile)
font-weight: 600
line-height: tight
color: primary

/* H4 - Component Titles */
font-size: 20px (desktop) / 18px (mobile)
font-weight: 600
line-height: normal
color: primary
```

#### Body Text
```css
/* Large Body */
font-size: 18px (desktop) / 16px (mobile)
font-weight: 400
line-height: relaxed
color: primary/80

/* Regular Body */
font-size: 16px (desktop) / 14px (mobile)
font-weight: 400
line-height: relaxed
color: primary/80

/* Small Text */
font-size: 14px (desktop) / 12px (mobile)
font-weight: 400
line-height: normal
color: primary/60
```

### Text Rendering
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

---

## Spacing & Layout

### Spacing Scale (Tailwind)
```
0.5 = 2px
1   = 4px
2   = 8px
3   = 12px
4   = 16px
5   = 20px
6   = 24px
8   = 32px
10  = 40px
12  = 48px
16  = 64px
20  = 80px
24  = 96px
```

### Container
```css
max-width: 1400px (2xl breakpoint)
padding: 2rem (32px)
margin: 0 auto
```

### Section Padding
```css
/* Desktop */
padding-y: 96px - 128px

/* Tablet */
padding-y: 64px - 80px

/* Mobile */
padding-y: 48px - 64px
```

### Grid System
```css
/* 4-column grid (desktop) */
grid-cols-4
gap: 32px

/* 2-column grid (tablet) */
grid-cols-2
gap: 24px

/* 1-column grid (mobile) */
grid-cols-1
gap: 16px
```

---

## Components

### Buttons

#### Primary Button
```jsx
className="bg-secondary hover:bg-secondary/90 text-primary 
           px-6 sm:px-8 py-3 sm:py-4 rounded-xl 
           text-base sm:text-lg font-semibold 
           transition-all shadow-lg hover:shadow-xl 
           active:scale-95"
```

#### Secondary Button
```jsx
className="bg-primary hover:bg-primary/90 text-white 
           px-6 sm:px-8 py-3 sm:py-4 rounded-xl 
           text-base sm:text-lg font-semibold 
           transition-all shadow-md hover:shadow-lg 
           active:scale-95"
```

#### Outline Button
```jsx
className="bg-white hover:bg-gray-50 text-primary 
           border-2 border-gray-200 
           px-6 sm:px-8 py-3 sm:py-4 rounded-xl 
           text-base sm:text-lg font-semibold 
           transition-all shadow-sm hover:shadow-md 
           active:scale-95"
```

#### Ghost Button
```jsx
className="text-primary hover:bg-gray-50 
           px-4 py-2 rounded-lg 
           text-sm font-medium 
           transition-colors"
```

#### Icon Button
```jsx
className="bg-white/95 hover:bg-white 
           backdrop-blur-sm border border-[#00240020] 
           hover:border-[#00240040] 
           p-2 sm:p-3 rounded-lg sm:rounded-xl 
           transition-all shadow-sm 
           active:scale-95"
```

#### Disabled State
```jsx
disabled:opacity-50 
disabled:cursor-not-allowed
```

### Cards

#### Standard Card
```jsx
className="bg-white rounded-2xl 
           border border-[#00240010] 
           overflow-hidden 
           hover:border-[#00240020] 
           transition-all shadow-sm hover:shadow-md"
```

#### Pricing Card
```jsx
className="relative flex flex-col bg-white rounded-2xl 
           border-2 p-6 sm:p-8 
           transition-all hover:shadow-xl
           border-secondary shadow-lg scale-105" // Popular
           border-gray-200 hover:border-secondary/50" // Regular
```

#### Campaign Card
```jsx
<div className="bg-white rounded-2xl border border-[#00240010] 
                overflow-hidden hover:border-[#00240020] 
                transition-all shadow-sm hover:shadow-md">
  {/* Image Container */}
  <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
    {/* Action Buttons Overlay */}
  </div>
  
  {/* Content */}
  <div className="flex flex-col p-4 sm:p-6">
    {/* Title & Description */}
    {/* Stats & Status */}
  </div>
</div>
```

### Forms

#### Input Field
```jsx
className="flex-1 px-4 py-3 
           border border-[#00240020] rounded-xl 
           text-base text-primary 
           placeholder:text-primary/40 
           focus:outline-none focus:ring-2 
           focus:ring-secondary focus:border-secondary 
           transition-all"
```

#### Input with Prefix
```jsx
<div className="flex">
  <span className="inline-flex items-center px-3 
                   rounded-l-xl border border-r-0 
                   border-[#00240020] bg-gray-50 
                   text-primary/60 text-sm">
    @
  </span>
  <input className="flex-1 px-4 py-3 
                    border border-[#00240020] rounded-r-xl 
                    text-base text-primary 
                    placeholder:text-primary/40 
                    focus:outline-none focus:ring-2 
                    focus:ring-secondary focus:border-secondary 
                    transition-all" />
</div>
```

#### Label
```jsx
className="block text-sm font-medium text-primary mb-2"
```

#### Helper Text
```jsx
className="text-xs text-primary/50 mt-2"
```

### Badges

#### Status Badge - Active
```jsx
className="inline-flex items-center gap-1.5 
           px-2.5 py-1 rounded-full 
           text-xs font-semibold 
           bg-secondary/10 text-secondary"
```

#### Status Badge - Inactive
```jsx
className="inline-flex items-center gap-1.5 
           px-2.5 py-1 rounded-full 
           text-xs font-semibold 
           bg-gray-100 text-gray-600"
```

#### Discount Badge
```jsx
className="bg-red-500 text-white 
           text-xs font-bold 
           px-2 py-1 rounded"
```

#### Popular Badge
```jsx
className="absolute -top-4 left-1/2 -translate-x-1/2 
           bg-secondary text-primary 
           px-4 py-1 rounded-full 
           text-sm font-semibold"
```

### Modals

#### Modal Overlay
```jsx
className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
```

#### Modal Panel
```jsx
className="w-full max-w-4xl transform overflow-hidden 
           rounded-2xl bg-white p-6 sm:p-8 
           text-left align-middle shadow-xl 
           transition-all"
```

#### Bottom Sheet (Mobile)
```jsx
className="fixed inset-0 bg-black/60 backdrop-blur-sm 
           flex items-end sm:items-center 
           justify-center z-50 p-0 sm:p-4"

className="bg-white rounded-t-3xl sm:rounded-2xl 
           max-w-md w-full p-6 sm:p-8 
           animate-slide-up sm:animate-none 
           shadow-2xl"
```

### Navigation

#### Navbar
```jsx
className="sticky top-0 z-40 bg-white 
           shadow-sm border-b border-gray-200 
           backdrop-blur-sm bg-white/95"
```

#### Nav Link
```jsx
className="text-gray-700 hover:text-secondary 
           px-3 py-2 rounded-md 
           text-sm font-medium 
           transition-colors"
```

#### Mobile Menu
```jsx
className="md:hidden border-t border-gray-200 bg-white"
```

### Toast Notifications

#### Toast Container
```jsx
className="fixed top-4 right-4 left-4 sm:left-auto 
           z-[9999] space-y-3 sm:w-96 max-w-full 
           pointer-events-none"
```

#### Toast - Success
```jsx
className="flex items-start gap-3 p-4 
           rounded-xl border shadow-2xl bg-white 
           animate-slide-in-right pointer-events-auto
           border-green-200 bg-green-50"
```

#### Toast - Error
```jsx
className="flex items-start gap-3 p-4 
           rounded-xl border shadow-2xl bg-white 
           animate-slide-in-right pointer-events-auto
           border-red-200 bg-red-50"
```

#### Toast - Info
```jsx
className="flex items-start gap-3 p-4 
           rounded-xl border shadow-2xl bg-white 
           animate-slide-in-right pointer-events-auto
           border-blue-200 bg-blue-50"
```

### Loading States

#### Spinner
```jsx
<div className="animate-spin rounded-full 
                h-12 w-12 border-b-2 border-primary"></div>
```

#### Skeleton Loader
```jsx
className="skeleton" // Uses skeleton animation from globals.css
```

#### Loading Text
```jsx
<p className="mt-4 text-gray-600 text-center text-sm sm:text-base">
  Loading...
</p>
```

### Range Slider
```css
input[type="range"].slider {
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
}

input[type="range"].slider::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00dd78;
  border: 3px solid #002400;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"].slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 6px rgba(0, 221, 120, 0.2);
}
```

---

## Shadows & Elevation

### Untitled UI Shadow System
```css
/* XS - Subtle */
.untitled-ui-shadow-xs {
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
}

/* SM - Cards */
.untitled-ui-shadow-sm {
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.06), 
              0px 1px 3px 0px rgba(16, 24, 40, 0.10);
}

/* MD - Elevated Cards */
.untitled-ui-shadow-md {
  box-shadow: 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 
              0px 4px 8px -2px rgba(16, 24, 40, 0.10);
}

/* LG - Modals */
.untitled-ui-shadow-lg {
  box-shadow: 0px 4px 6px -2px rgba(16, 24, 40, 0.03), 
              0px 12px 16px -4px rgba(16, 24, 40, 0.08);
}

/* XL - Overlays */
.untitled-ui-shadow-xl {
  box-shadow: 0px 8px 8px -4px rgba(16, 24, 40, 0.03), 
              0px 20px 25px -5px rgba(16, 24, 40, 0.10);
}
```

### Tailwind Shadows
```css
shadow-sm    /* Subtle card shadow */
shadow-md    /* Standard elevation */
shadow-lg    /* Prominent elements */
shadow-xl    /* Modals and overlays */
shadow-2xl   /* Maximum elevation */
```

### Usage Guidelines
- **shadow-sm**: Default cards, inputs
- **shadow-md**: Hover states, active cards
- **shadow-lg**: Buttons, important CTAs
- **shadow-xl**: Modals, dropdowns
- **shadow-2xl**: Toast notifications, overlays

---

## Animations & Transitions

### Transition Timing
```css
transition-duration: 150ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

#### Fade In
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in { animation: fade-in 0.4s ease-out; }
```

#### Fade In Up
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
```

#### Slide In Right
```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
```

#### Slide Up
```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up { animation: slide-up 0.3s ease-out; }
```

#### Scale In
```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-in { animation: scale-in 0.4s ease-out; }
```

#### Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

#### Skeleton Loading
```css
@keyframes skeleton-loading {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 0px, #f8f8f8 40px, #f0f0f0 80px);
  animation: skeleton-loading 1.4s ease-in-out infinite;
}
```

#### Accordion
```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
.animate-accordion-down { animation: accordion-down 0.2s ease-out; }

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
.animate-accordion-up { animation: accordion-up 0.2s ease-out; }
```

### Hover Effects

#### Button Hover
```css
hover:bg-secondary/90
hover:shadow-lg
active:scale-95
```

#### Card Hover
```css
@media (hover: hover) and (pointer: fine) {
  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 36, 0, 0.15);
  }
}
```

#### Touch Feedback (Mobile)
```css
@media (hover: none) and (pointer: coarse) {
  button:active,
  a:active,
  [role="button"]:active {
    opacity: 0.7;
  }
}
```

---

## Responsive Design

### Breakpoints
```javascript
sm: '640px'   // Small devices (phones landscape)
md: '768px'   // Medium devices (tablets)
lg: '1024px'  // Large devices (desktops)
xl: '1280px'  // Extra large devices
2xl: '1400px' // Container max-width
```

### Mobile-First Approach
All styles are mobile-first, with larger breakpoints adding complexity:
```jsx
className="text-base sm:text-lg md:text-xl lg:text-2xl"
className="p-4 sm:p-6 md:p-8 lg:p-12"
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

### Touch Targets (Mobile)
```css
@media (max-width: 768px) {
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Prevent Zoom on Input Focus
```css
@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px; /* Prevents iOS zoom */
  }
}
```

### Safe Area Insets (Notched Devices)
```css
@supports (padding: env(safe-area-inset-top)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

### Smooth Scrolling
```css
html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

* {
  -webkit-overflow-scrolling: touch;
}
```

### Prevent Pull-to-Refresh
```css
body {
  overscroll-behavior-y: contain;
}
```

---

## Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--phrames-secondary);
  outline-offset: 2px;
}
```

### ARIA Labels
```jsx
aria-label="Close modal"
aria-label="Edit campaign"
aria-label="Toggle menu"
```

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>`, `<main>`, `<section>`, `<footer>` landmarks

### Color Contrast
- Primary text on white: 21:1 (AAA)
- Secondary on white: 4.5:1 (AA)
- All interactive elements meet WCAG AA standards

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows visual flow
- Escape key closes modals
- Enter/Space activates buttons

### Screen Reader Support
- Descriptive alt text for images
- ARIA labels for icon buttons
- Status messages announced
- Loading states communicated

### Reduced Motion
```css
@media (prefers-reduced-motion: no-preference) {
  * {
    transition-property: background-color, border-color, color, 
                         fill, stroke, opacity, box-shadow, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
}
```

---

## Design Tokens Summary

### Border Radius
```javascript
sm: 'calc(0.75rem - 4px)'  // 8px
md: 'calc(0.75rem - 2px)'  // 10px
lg: '0.75rem'              // 12px
xl: '0.75rem'              // 12px
2xl: '1rem'                // 16px
3xl: '1.5rem'              // 24px
full: '9999px'             // Fully rounded
```

### Border Widths
```css
border: 1px
border-2: 2px
border-3: 3px (custom for sliders)
```

### Opacity Scale
```css
/10  = 10%
/20  = 20%
/40  = 40%
/50  = 50%
/60  = 60%
/70  = 70%
/80  = 80%
/90  = 90%
/95  = 95%
```

### Z-Index Scale
```css
z-40   = Sticky navbar
z-50   = Modals, overlays
z-[9999] = Toast notifications (highest)
```

---

## Component Patterns

### Hero Section
```jsx
<section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
      {/* Content */}
      {/* Image */}
    </div>
  </div>
</section>
```

### Section with Background
```jsx
<section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 
                    bg-primary">
  <div className="max-w-7xl mx-auto">
    {/* Content */}
  </div>
</section>
```

### Grid Layout
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                gap-6 lg:gap-8">
  {/* Grid items */}
</div>
```

### Centered Content
```jsx
<div className="text-center mb-12 sm:mb-16">
  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold 
                 text-primary mb-4">
    Title
  </h2>
  <p className="text-base sm:text-lg text-primary/80 
                max-w-2xl mx-auto">
    Description
  </p>
</div>
```

---

## Best Practices

### Do's
✅ Use semantic HTML elements
✅ Follow mobile-first responsive design
✅ Maintain consistent spacing using Tailwind scale
✅ Use primary color for text, secondary for CTAs
✅ Add hover and active states to interactive elements
✅ Include loading and error states
✅ Test on mobile devices
✅ Ensure 44px minimum touch targets on mobile
✅ Use toast notifications for feedback
✅ Add transitions for smooth interactions

### Don'ts
❌ Don't use inline styles
❌ Don't mix color systems
❌ Don't forget disabled states
❌ Don't use small touch targets on mobile
❌ Don't skip loading states
❌ Don't use low contrast colors
❌ Don't forget keyboard navigation
❌ Don't use animations without reduced-motion check
❌ Don't hardcode colors (use design tokens)
❌ Don't forget error handling

---

## File Structure

```
app/
├── globals.css          # Global styles, animations, custom CSS
├── layout.tsx           # Root layout with fonts and metadata
└── page.tsx             # Landing page

components/
├── ui/
│   └── toaster.tsx      # Toast notification system
├── Navbar.tsx           # Navigation component
├── Footer.tsx           # Footer component
├── PricingSection.tsx   # Pricing cards
├── CampaignCard.tsx     # Campaign display card
├── PaymentModal.tsx     # Payment modal
├── LoadingSpinner.tsx   # Loading state
└── FAQSection.tsx       # FAQ accordion

tailwind.config.js       # Tailwind configuration
```

---

## Version History
- **v1.0** - Initial design system documentation
- Based on Phrames production codebase (November 2024)

---

## Maintenance Notes
- Design system uses Tailwind CSS v3
- Custom animations defined in globals.css
- Untitled UI shadow system for elevation
- Mona Sans font family
- Mobile-first responsive approach
- Accessibility-compliant (WCAG AA)
