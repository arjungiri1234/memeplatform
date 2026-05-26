# SKILLS.md — UI/UX Design System

## Design philosophy
Anti-slop. Every screen should feel intentional, fast, and slightly
opinionated. Take inspiration from Linear, Vercel, and Raycast —
not from generic Tailwind starter templates.
Memes are playful content but the UI around them should be clean
and serious. Let the memes be the color. The UI is the frame.

## References to study before building any component
- linear.app — spacing, typography, dark mode, button states
- vercel.com — layout, hero sections, card design
- raycast.com — dark cards, accent color usage
- read.cv — profile pages, minimal social feed
- cosmos.so — feed layout, content cards
- mobbin.com — filter by component type for real app patterns

## Color system

### Dark mode (default — primary experience)
Background:       #0a0a0a   (near black, not pure black)
Surface:          #111111   (cards, modals)
Surface elevated: #1a1a1a   (hover states, dropdowns)
Border:           #2a2a2a   (subtle dividers)
Border strong:    #3a3a3a   (active borders, focused inputs)

Text primary:     #ededed   (headlines, important text)
Text secondary:   #a1a1a1   (body, descriptions)
Text muted:       #555555   (placeholders, disabled)

Accent:           #7c3aed   (purple — primary CTA, links, active states)
Accent hover:     #6d28d9
Accent subtle:    #1e1030   (accent background tints)

Success:          #22c55e
Warning:          #f59e0b
Danger:           #ef4444
Info:             #3b82f6

### Light mode (secondary — system preference only)
Background:       #ffffff
Surface:          #f9f9f9
Border:           #e5e5e5
Text primary:     #111111
Text secondary:   #555555
Accent:           #7c3aed

## Typography
Font family:      Inter (primary), system-ui fallback
Font for meme text on canvas: Impact, Anton (Google Fonts)
Scale:
  xs:   11px / 1.4
  sm:   13px / 1.5
  base: 15px / 1.6
  lg:   17px / 1.5
  xl:   20px / 1.4
  2xl:  24px / 1.3
  3xl:  32px / 1.2
  4xl:  48px / 1.1

Weight: 400 regular, 500 medium, 600 semibold only
Never use 700+ weight except for display headings

## Spacing
Use 4px base unit. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
Apply consistently — never use arbitrary values like 13px or 22px
Component internal padding: 12px (compact) or 16px (comfortable)
Section spacing: 48px or 64px between major sections

## Border radius
Buttons:   6px
Cards:     10px
Modals:    14px
Avatars:   full circle
Tags/pills: 999px (full round)

## Shadows
Avoid drop shadows except:
  Card hover: 0 0 0 1px #2a2a2a (border glow, not shadow)
  Modal:      0 0 0 1px #2a2a2a, 0 24px 48px rgba(0,0,0,0.4)
No box-shadow on flat surfaces. Use borders instead.

## Component rules

### Buttons
Primary:   bg accent, text white, hover bg accent-hover
Secondary: bg transparent, border #2a2a2a, hover bg surface-elevated
Ghost:     no border, no bg, hover bg surface-elevated
Danger:    bg transparent, text danger, border danger on hover
All buttons: height 36px (default), 32px (small), 40px (large)
All buttons: must have hover + focus + active + disabled states
Never use rounded-full on buttons — use 6px radius only
Loading state: replace text with spinner, keep same width

### Cards
Background: #111111
Border: 1px solid #2a2a2a
Radius: 10px
Hover: border color lifts to #3a3a3a
No shadows — border change is the hover signal

### Meme feed card
Aspect ratio: preserve original image ratio, max-width 600px
Username + avatar: top left overlay or below image
Reaction bar: below image — clean icon + count, no labels
Language tag: small pill top right of image
No watermark ever

### Inputs / forms
Height: 36px
Background: #111111
Border: 1px solid #2a2a2a
Focus: border color #7c3aed, no glow ring
Placeholder: text-muted (#555555)
Font size: 14px
Radius: 6px
Error state: border danger, small error text below

### Navigation
Height: 56px
Background: #0a0a0a with 1px bottom border #2a2a2a
Backdrop blur: blur(12px) with slight transparency for scroll
Logo: left — simple wordmark, no heavy branding
Nav links: center or right, text-secondary, hover text-primary
Language picker: icon button with dropdown
Auth buttons: right side

### Avatar
Sizes: 24px (micro), 32px (small), 40px (default), 56px (large)
Shape: always circle
Fallback: initials on accent background, 500 weight

### Language picker dropdown
Show flag emoji + language name in native script
Example: 🇳🇵 नेपाली, 🇮🇳 हिन्दी, 🇬🇧 English
Dropdown: surface card, max 5 items, current item has accent dot

## Motion / animation
Philosophy: fast and functional. Animation should confirm actions,
not entertain.
Duration: 120ms (micro), 200ms (standard), 300ms (page transitions)
Easing: ease-out for enters, ease-in for exits
Allowed: opacity fade, translate Y (8px max), scale (0.97–1.0)
Never: bounce, elastic, spin on UI elements
Loading skeleton: pulse opacity 0.4 → 0.8, 1.2s, infinite

## What NOT to do — anti-patterns
- No rainbow gradient backgrounds
- No glassmorphism blurs on every surface (one use max)
- No card shadows on dark backgrounds — use border instead
- No colored backgrounds on every card — use borders + surface
- No more than 2 font families total
- No inline styles — Tailwind classes only
- No magic numbers — use spacing scale
- No empty states without illustration or helpful text
- No loading state that just shows a blank screen
- No form without validation feedback
- No button without a disabled + loading state
- No mobile layout that requires horizontal scroll

## Canvas editor specific rules
Background: pure black (#000000) to make meme content pop
Text tool default: Impact font, white, stroke black (classic meme)
Font size default: 32px
Panel UI (tools sidebar): #111111, compact, icon-first
Color picker: simple — white / black / yellow / red presets + custom
No floating toolbars — dock everything to left sidebar or bottom bar

## Responsive breakpoints
Mobile:  < 640px   — single column, bottom nav
Tablet:  640–1024px — two column feed
Desktop: > 1024px  — three column feed, side panel editor

## Accessibility
Color contrast: minimum 4.5:1 for text
Focus rings: visible on all interactive elements (accent color)
Font size minimum: 12px, never smaller
Touch targets: minimum 44x44px on mobile
All images: alt text required