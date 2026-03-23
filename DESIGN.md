# Design System Specification

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Architect"**

This design system moves beyond the generic "SaaS dashboard" aesthetic to embrace a high-end editorial feel specifically tailored for developers. The goal is to present code and components not just as tools, but as architectural elements.

We break the "template" look by utilizing **intentional asymmetry** and **tonal layering**. By rejecting standard 1px borders and rigid grids, we create a layout that feels fluid, premium, and breathable. The interface should feel like a well-composed technical journal: authoritative, clean, and intellectually stimulating.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette transitions from deep indigos to ethereal violets, anchored by a sophisticated off-white base.

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited for sectioning.**
Boundaries must be defined solely through background color shifts. To separate a sidebar from a main content area, use `surface-container-low` (`#f6f3f2`) against the main `surface` (`#fcf9f8`). This creates a "soft edge" that feels integrated rather than partitioned.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine paper.
- **Base Layer:** `surface` (`#fcf9f8`)
- **Sectioning:** `surface-container-low` (`#f6f3f2`)
- **Component Cards:** `surface-container-lowest` (`#ffffff`)
- **Active/Hover States:** `surface-container-high` (`#eae7e7`)

### Glass & Gradient Signature
To provide "visual soul," primary CTAs and Hero sections should utilize a subtle linear gradient:
`linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)`.
For floating navigation or overlays, use **Glassmorphism**:
- Background: `rgba(252, 249, 248, 0.7)`
- Backdrop-blur: `12px`
- This ensures the UI feels layered and modern, letting the brand colors bleed through the frosted surface.

---

## 3. Typography: The Editorial Scale
We use **Inter** exclusively, but we manipulate weight and scale to create a "Technical Editorial" hierarchy.

* **Display (lg/md):** Used for hero statements. High-contrast sizing creates an immediate premium feel.
* **Headlines:** Reserved for section starts. Always use `on-surface` (`#1c1b1b`) to maintain authority.
* **Body:** Optimized for readability. `body-md` (0.875rem) is the workhorse for documentation.
* **Labels:** Small, all-caps or high-tracking labels (`label-sm`) should be used for metadata to mimic architectural blueprints.

**The Typographic Soul:** Pair a `display-lg` headline with a `body-lg` introductory paragraph. The drastic jump in scale signals a "curated" experience rather than a "templated" one.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are a fallback, not a standard. We achieve depth through the **Layering Principle**.

### Tonal Stacking
Instead of a shadow, place a `surface-container-lowest` (#ffffff) card on top of a `surface-container` (#f0eded) background. The subtle 2% shift in brightness provides a natural, sophisticated lift.

### Ambient Shadows
When a component must "float" (e.g., a Modal or Popover):
- **Blur:** 32px to 64px.
- **Opacity:** 4% - 6%.
- **Color:** Use a tinted version of the surface: `rgba(70, 72, 212, 0.08)` (Primary-tinted shadow). This mimics natural light refracting through the brand's color palette.

### The Ghost Border
If accessibility requires a container definition in high-glare environments, use a **Ghost Border**: `outline-variant` (`#c7c4d7`) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components: Architectural Primitives

### Buttons
- **Primary:** Gradient fill (Primary to Primary-Container). Roundedness: `md` (0.375rem). No border.
- **Secondary:** `secondary-container` fill with `on-secondary-container` text.
- **Tertiary:** No fill, no border. `on-surface` text. Use a `primary-fixed-dim` background on hover.

### Cards & Lists
**Forbid the use of divider lines.**
Separate list items using `spacing-4` (1rem) of vertical white space or a subtle background toggle between `surface-container-low` and `surface-container-lowest`.

### Input Fields
- **Background:** `surface-container-low`.
- **Active State:** 2px bottom-border only using `primary`.
- **Error State:** Background shifts to `error-container`, text to `on-error-container`.

### Code Blocks (App Specific)
As a developer-centric library, code blocks are first-class citizens.
- **Surface:** `inverse-surface` (#313030).
- **In-line Highlights:** Use `secondary-fixed` with `on-secondary-fixed` text for high-contrast emphasis.

---

## 6. Do's and Don'ts

### Do:
- **Use Negative Space:** Use `spacing-12` (3rem) and `spacing-16` (4rem) generously between sections to let the "Editorial" feel breathe.
- **Layer Surfaces:** Always ask "Can I define this area with a background color shift instead of a line?"
- **Embrace Asymmetry:** Align text to the left but offset imagery or code samples to the right using unconventional grid columns (e.g., a 5-column / 7-column split).

### Don't:
- **No Pure Black Shadows:** Never use `#000000` for shadows. Always tint them with the primary or surface-variant colors.
- **No 1px Borders:** Avoid them for layout. Only use them for `Ghost Borders` at low opacity when strictly necessary.
- **No Default Inter:** Don't just use Inter at 400 weight for everything. Use the full range of the scale—from `display-lg` for impact to `label-sm` for utility.

---

## 7. Signature Textures
To finalize the "High-End" feel, apply a very fine noise texture (2% opacity) over the `surface` layer. This removes the "sterile" digital look and replaces it with a tactile, paper-like quality that feels premium to the touch and eye.
