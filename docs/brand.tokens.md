# Brand Tokens — ChurchSuite Ghana

## Brand Colors

### Primary Colors
**Burgundy** — Faith, Strength, Tradition
- `#800020` (HSL: 350, 75%, 25%) — Primary brand color
- Use for: Primary buttons, links, active states, key UI elements

### Secondary Colors  
**Bronze** — Warmth, Tradition, Elegance
- `#CD7F32` (HSL: 32, 60%, 50%) — Secondary brand color
- Use for: Accent elements, highlights, call-to-action elements

### Supporting Colors
**Olive Green** — Growth, Stability, Nature
- `#556B2F` (HSL: 82, 39%, 30%) — Success and growth states

**Slate Blue** — Calm, Trust, Wisdom
- `#6A5ACD` (HSL: 248, 53%, 58%) — Trust and calm elements

### Color Palette

#### Burgundy Scale
```css
--church-burgundy-50: #fdf2f3
--church-burgundy-100: #fce7e8
--church-burgundy-200: #f9d3d6
--church-burgundy-300: #f4b1b6
--church-burgundy-400: #ec8691
--church-burgundy-500: #e0596b
--church-burgundy-600: #cc3f56
--church-burgundy-700: #ab2e46
--church-burgundy-800: #800020  /* Primary */
--church-burgundy-900: #661a1c
--church-burgundy-950: #4d1316
```

#### Bronze Scale  
```css
--church-bronze-50: #faf8f0
--church-bronze-100: #f4f0e1
--church-bronze-200: #e8e0c3
--church-bronze-300: #dbcd9f
--church-bronze-400: #d1be8a
--church-bronze-500: #CD7F32  /* Secondary */
--church-bronze-600: #b8722d
--church-bronze-700: #9a5f26
--church-bronze-800: #7f4f22
--church-bronze-900: #68411e
--church-bronze-950: #4a2e15
```

#### Olive Green Scale
```css
--church-olive-50: #f8f9f4
--church-olive-100: #f1f4e8
--church-olive-200: #e2e8d1
--church-olive-300: #cdd7b4
--church-olive-400: #b4c492
--church-olive-500: #9bb06f
--church-olive-600: #7e9354
--church-olive-700: #6b7e44
--church-olive-800: #556B2F  /* Supporting */
--church-olive-900: #485a29
--church-olive-950: #253123
```

#### Slate Blue Scale
```css
--church-slate-50: #f3f3ff
--church-slate-100: #ebeafe
--church-slate-200: #d9d8fe
--church-slate-300: #beb9fd
--church-slate-400: #9d93fa
--church-slate-500: #7b6af6
--church-slate-600: #6A5ACD  /* Supporting */
--church-slate-700: #5b4bb8
--church-slate-800: #4c3e96
--church-slate-900: #3f3778
--church-slate-950: #262046
```

#### Status Colors
```css
--success: #556B2F    /* Olive Green - Growth, Life */
--warning: #CD7F32    /* Bronze - Caution */  
--error: #ef4444      /* Red - Attention needed */
```

## Typography

### Font Families
- **Primary**: Inter (clean, modern, readable)
- **Serif**: Georgia (traditional, formal documents)
- **Mono**: JetBrains Mono (code, technical content)

### Font Sizes
```css
--text-xs: 0.75rem     /* 12px */
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem   /* 30px */
--text-4xl: 2.25rem    /* 36px */
```

## Spacing Scale
```css
--space-1: 0.25rem     /* 4px */
--space-2: 0.5rem      /* 8px */
--space-3: 0.75rem     /* 12px */
--space-4: 1rem        /* 16px */
--space-5: 1.25rem     /* 20px */
--space-6: 1.5rem      /* 24px */
--space-8: 2rem        /* 32px */
--space-10: 2.5rem     /* 40px */
--space-12: 3rem       /* 48px */
--space-16: 4rem       /* 64px */
--space-20: 5rem       /* 80px */
--space-24: 6rem       /* 96px */
```

## Border Radius
```css
--radius-none: 0px
--radius-sm: 0.125rem   /* 2px */
--radius-base: 0.25rem  /* 4px */
--radius-md: 0.375rem   /* 6px */
--radius-lg: 0.5rem     /* 8px */
--radius-xl: 0.75rem    /* 12px */
--radius-2xl: 1rem      /* 16px */
--radius-full: 9999px   /* Pill shape */
```

## Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

## Logo Usage

### Logo File
- **Location**: `/public/brand/logo.png`
- **Usage**: Church logo for headers, footers, and branding

### Logo Guidelines
- **Minimum size**: 24px × 24px
- **Preferred sizes**: 
  - Mobile header: 32px × 32px
  - Desktop header: 40px × 40px
  - Print/large displays: 80px × 80px
- **Clear space**: Minimum 8px around logo
- **Background**: Works on light and dark backgrounds

## Dark Mode

All colors have dark mode variants defined in CSS custom properties:
- Primary burgundy becomes lighter and more vibrant
- Backgrounds become dark navy/black
- Text becomes light for readability
- Maintains brand recognition in both modes

## Usage in Code

### CSS Custom Properties
```css
.my-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

### Tailwind Classes
```html
<div class="bg-primary text-primary-foreground">
<div class="bg-church-burgundy-800 text-white">
<div class="bg-church-bronze-100 border-church-bronze-500">
```

### Brand-Specific Classes
```html
<!-- Church-specific color combinations -->
<button class="bg-church-burgundy-800 hover:bg-church-burgundy-700">
<span class="text-church-bronze-600">
<div class="bg-church-olive-50 text-church-olive-800">
```

---

*This updated brand system reflects the elegant, traditional values of ChurchSuite Ghana with sophisticated burgundy and bronze tones that convey faith, strength, and warmth.*