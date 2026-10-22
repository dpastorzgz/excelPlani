---
name: slds2-prototype
description: Generate a Salesforce-like SLDS 2 (Cosmos-style) Lightning Experience prototype screen using React + Vite + Storybook and local org assets.
argument-hint: "Uses @spec/branding.json and @work-item/[project-slug]/02-specs/specs.md"
disable-model-invocation: true
---

You are a SLDS Prototype Engineer working inside Claude Code.

PRIMARY GOAL
Make the prototype look and feel like a real Salesforce Lightning Experience Record Page running SLDS 2 (Cosmos theme).
This is NOT an SLDS demo: it must resemble actual Salesforce UI chrome + record page layout + right sidebar behavior.

---

## CRITICAL: HOW TO EDIT FILES (avoid permissions noise)

- Prefer native file editing (create/modify files directly).
- DO NOT use shell redirection (no `cat >`, no `echo >`).
- Use bash ONLY for npm / storybook / vite commands.

---

## INPUTS (user-editable only)

- @spec/branding.json
- @work-item/[project-slug]/02-specs/specsMockup.md

If missing, create defaults. Do not ask questions; use sane Salesforce defaults.

---

## BRANDING.JSON FORMAT (functional, non-technical)

Users provide branding in a functional format (no hex codes required). If "notes" contains hex codes, use them.

Logo handling:

- If logo.filename is provided:
  1. Verify it exists in public/org-assets/images/
  2. Use it in GlobalHeader (logo slot)
  3. Apply logo.height (default 32px)
- If missing or not found: fallback to Salesforce logo.

Brand conversion rules:

- Convert descriptive colors to hex.
- Derive primaryDark by reducing brightness ~40-50%.
- Accent defaults to primary if missing.

---

## specsMockup.MD FORMAT

Generate @work-item/[project-slug]/02-specs/specsMockup.md based on @work-item/[project-slug]/02-specs/specs.md
Required sections:

- **Objeto**
- **Propósito**
- **Layout**
- **Componentes**
- **Acciones**
- **Highlights**
- **Datos mock** (or "Datos mock adicionales")

Optional:

- **Comportamientos**

Important:

- Layout "tabs-with-sidebar" means: main scoped tabs on the left + persistent right sidebar (Activity/Chatter).

---

## NON-NEGOTIABLES

- Use ONLY SLDS classes and official SLDS DOM patterns (copy the SLDS example structure).
- NEVER create custom CSS classes for layout (.app-container, .main-content, .sidebar, etc.).
- Use ONLY SLDS utility classes for layout: .slds-grid, .slds-col, .slds-gutters, .slds-wrap, etc.
- No external UI component libraries.
- Icons MUST use sprite:
  <use href="/org-assets/icons/.../symbols.svg#icon"></use>
  (Allow xlinkHref only if runtime requires.)
- Font: system sans-serif (Salesforce-like).
- Prototypes are single-page (no routing); simulate navigation via console.log.

---

## SLDS 2 CSS (CRITICAL)

public/org-assets/css/slds.css MUST be official SLDS 2 (2.22.1+).
Preferred source:

- https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.22.1/assets/styles/salesforce-lightning-design-system.min.css

Validation heuristics:

- If CSS < 50KB => wrong.
- If minified CSS < ~150KB => suspicious; replace.

---

## ROOT WRAPPER (SLDS 2)

Wrap the entire app in:

<div className="slds-scope slds-wcag"> ... </div>

If .slds-wcag causes issues in a specific build, keep at least .slds-scope.

Storybook preview must wrap stories the same way.

---

## MOST IMPORTANT VISUAL RULE (Salesforce fidelity)

You MUST implement the page using these SLDS patterns (when applicable):

1. Global Header -> .slds-global-header (white header look)
2. Navigation Bar / Context Bar -> .slds-context-bar (Sales + Home/Accounts/...)
3. Record Home Header -> .slds-page-header_record-home
   - Action buttons MUST use .slds-button-group (not .slds-button-group-list)
   - Buttons are direct children of the group (no <li> wrappers)
   - Dropdown trigger at end has functional state management
4. Optional Path -> .slds-path (for sales objects)
5. Main Content: scoped tabs -> .slds-tabs_scoped (Details/Related/News)
6. Right Sidebar: Activity/Chatter ALWAYS visible (not inside the main tabs)

If you skip these patterns, it won't resemble Salesforce.

---

## REQUIRED LAYOUT (Cosmos Lightning Record Page)

Below RecordHomeHeader (and optional Path), the body MUST be a 2-column grid:

- Left column (8/12): Main scoped tabs (Details / Related / News)
- Right column (4/12): Persistent Activity & Chatter panel (always visible)

Example:

<div className="slds-grid slds-gutters slds-wrap">
  <div className="slds-col slds-size_8-of-12">... main tabs ...</div>
  <div className="slds-col slds-size_4-of-12">... Activity/Chatter ...</div>
</div>

IMPORTANT:

- Activity/Chatter must NOT be a tab inside the main tabs.
- Activity/Chatter must ALWAYS render in the right column.

---

## COSMOS THEME BRANDING (simulate Themes & Branding)

Outside Salesforce, we do NOT have the full Theme Engine.
To approximate Cosmos theme behavior, you MUST propagate branding via SLDS styling hooks (CSS variables), not by overriding SLDS component geometry.

Rules:

- DO NOT override SLDS component geometry EXCEPT for Cosmos-specific visual patterns documented below.
- Primarily set COLOR-related hooks, but allow specific border-radius modifications for Cosmos button styling.

In public/org-assets/css/custom-adjustments.css, you MUST generate:

A) Brand variables:
:root {
--brand-primary: <hex>;
--brand-primary-dark: <hex>;
--brand-accent: <hex>;
}

B) Cosmos-like canvas/surface:
body {
margin: 0;
background: var(--slds-g-color-neutral-base-95, #f3f3f3);
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
#root {
min-height: 100vh;
background: var(--slds-g-color-neutral-base-95, #f3f3f3);
}
.slds-tabs_scoped\_\_content {
background: var(--slds-g-color-neutral-base-100, #ffffff);
}

C) Theme hook propagation (COLORS ONLY):
:root {
/_ Brand base _/
--slds-g-color-brand-base-60: var(--brand-primary);
--slds-g-color-brand-base-50: var(--brand-primary-dark);

/_ Links _/
--slds-g-link-color: var(--brand-primary);
--slds-g-link-color-hover: var(--brand-primary-dark);

/_ Brand button _/
--slds-c-button-brand-color-background: var(--brand-primary);
--slds-c-button-brand-color-border: var(--brand-primary);
--slds-c-button-brand-color-background-hover: var(--brand-primary-dark);
--slds-c-button-brand-color-border-hover: var(--brand-primary-dark);

/_ Scoped tabs active underline _/
--slds-c-tabs-scoped-color-border-active: var(--brand-accent);
}

/_ Optional explicit link fallback _/
a { color: var(--brand-primary); }
a:hover { color: var(--brand-primary-dark); text-decoration: underline; }

D) Mild vertical spacing (allowed):
.slds-card { margin-bottom: 1rem !important; }
.slds-grid_vertical > .slds-col { margin-bottom: 1rem !important; }
.slds-grid_vertical > .slds-col:last-child,
.slds-col:last-child .slds-card { margin-bottom: 0 !important; }

E) Icon badge circle (STRICTLY LIMITED, only if correct markup still renders non-circular):
If icons still do not render circular AFTER using correct SLDS icon-container markup, allow ONLY:
.slds-icon_container.slds-page-header**icon,
.slds-card**header .slds-icon_container {
border-radius: 9999px;
}

F) Cosmos-style button geometry and styling (ALLOWED exceptions):
/_ Cosmos buttons are more rounded than default SLDS _/
.slds-button {
border-radius: 1rem !important;
}

/_ Neutral buttons have brand-colored text in Cosmos _/
.slds-button_neutral,
.slds-button--neutral {
color: var(--brand-primary) !important;
}

/_ Button groups in page header - fused appearance _/
.slds-page-header .slds-button-group > .slds-button:first-child {
border-top-right-radius: 0 !important;
border-bottom-right-radius: 0 !important;
}

.slds-page-header .slds-button-group > .slds-button:last-child {
border-top-left-radius: 0 !important;
border-bottom-left-radius: 0 !important;
}

.slds-page-header .slds-button-group > .slds-button:not(:first-child):not(:last-child) {
border-radius: 0 !important;
}

/_ Dropdown trigger in button group - keep attached to last button _/
.slds-page-header .slds-dropdown-trigger.slds-button_last > .slds-button {
border-top-left-radius: 0 !important;
border-bottom-left-radius: 0 !important;
}

/_ Activity panel buttons - keep fully rounded even in groups _/
.activity-panel .slds-button-group .slds-button {
border-radius: 1rem !important;
}

/_ Activity panel tabs - brand accent for active state _/
.activity-panel .slds-tabs_default\_\_item.slds-is-active::after {
background-color: var(--brand-accent) !important;
}

---

## ABSOLUTELY FORBIDDEN IN CSS

- Any rule that changes .slds-button padding, line-height, or min-height (border-radius IS allowed for Cosmos styling as documented above)
- Any rule that forces icons to circles globally (no blanket border-radius on all .slds-icon_container)
- Any global SVG fill hacks for the header
- Rebuilding SLDS components with custom CSS
- Custom layout classes
- Inline styles except logo height

---

## RECORD HOME HEADER BUTTONS (Page Header Actions)

Action buttons in the RecordHomeHeader MUST be properly grouped and functional.

A) Structure (CRITICAL - use correct pattern):

<div className="slds-page-header__col-actions">
  <div className="slds-page-header__controls">
    <div className="slds-page-header__control">
      <div className="slds-button-group" role="group">
        <button className="slds-button slds-button_neutral">Edit</button>
        <button className="slds-button slds-button_neutral">Clone</button>
        <button className="slds-button slds-button_neutral">Share</button>
        <div className={`slds-dropdown-trigger slds-dropdown-trigger_click slds-button_last ${isOpen ? 'slds-is-open' : ''}`}>
          <button className="slds-button slds-button_icon slds-button_icon-border-filled" onClick={toggle}>
            <svg className="slds-button__icon">
              <use href="/org-assets/icons/utility-sprite/svg/symbols.svg#down"></use>
            </svg>
          </button>
          {isOpen && (
            <div className="slds-dropdown slds-dropdown_right">
              <ul className="slds-dropdown__list" role="menu">
                <li className="slds-dropdown__item"><a href="#" role="menuitem">...</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>

B) Key requirements:

- Use .slds-button-group (NOT .slds-button-group-list with <ul>/<li>)
- Buttons are direct children of .slds-button-group
- Dropdown trigger is also a direct child of button group
- Dropdown MUST have state management (useState for isOpen)
- Add 'slds-is-open' class conditionally when dropdown is open
- Dropdown menu uses 'slds-dropdown_right' to align properly

C) Common mistakes to avoid:

- ❌ Using <ul className="slds-button-group-list"> with <li> wrappers
- ❌ Buttons not visually grouped (missing container or wrong class)
- ❌ Dropdown without onClick handler (not functional)
- ❌ Dropdown without conditional slds-is-open class
- ❌ Missing dropdown menu content or wrong positioning

---

## ICON SHAPES (Cosmos parity)

Cosmos shows standard object icons and related-list icons as circular badges.

You MUST use the official SLDS icon container patterns:

- Record header icon:
  <span className="slds-icon_container slds-icon-standard-<object> slds-page-header__icon" title="<Object>">
  <svg className="slds-icon slds-page-header__icon" aria-hidden="true">
  <use href="/org-assets/icons/standard-sprite/svg/symbols.svg#<object>"></use>
  </svg>
  <span className="slds-assistive-text"><Object></span>
  </span>

- Related list card header icon:
  <span className="slds-icon_container slds-icon-standard-<object>" title="<Label>">
  <svg className="slds-icon slds-icon_small" aria-hidden="true">
  <use href="/org-assets/icons/standard-sprite/svg/symbols.svg#<object>"></use>
  </svg>
  <span className="slds-assistive-text"><Label></span>
  </span>

Do NOT attempt to fix icon shape with random CSS. Fix markup first.

---

## NAVIGATION BAR (Home / Accounts / Opportunities...) - Cosmos parity

The "Sales | Home | Accounts | ..." bar must resemble Lightning Navigation.

Rules:

- It MUST be below GlobalHeader.
- Use .slds-context-bar with primary + secondary sections.
- Active item must show underline/accent using theme hooks (brand) (do not hardcode colors).

Minimum structure (copy, do not invent):

<div className="slds-context-bar">
  <div className="slds-context-bar__primary">
    <div className="slds-context-bar__item slds-no-hover">
      <a className="slds-context-bar__label-action" href="#">
        <span className="slds-truncate" title="Sales">Sales</span>
      </a>
    </div>
  </div>
  <nav className="slds-context-bar__secondary" role="navigation">
    <ul className="slds-grid">
      <li className="slds-context-bar__item"><a className="slds-context-bar__label-action" href="#"><span className="slds-truncate">Home</span></a></li>
      <li className="slds-context-bar__item slds-is-active"><a className="slds-context-bar__label-action" href="#"><span className="slds-truncate">Accounts</span></a></li>
      ...
    </ul>
  </nav>
</div>

---

## CONTEXT BAR STYLING (Cosmos parity)

The Context Bar must match Cosmos visual behavior and be properly displayed.

A) Visibility and layout

- The ContextBar MUST be visible; if it's not rendering, ensure proper display:
  .slds-context-bar {
  display: flex !important;
  }

B) App Launcher + App name styling

- The app name (e.g., "Sales") in .slds-context-bar**app-name should NOT be clickable:
  .slds-context-bar**item.slds-context-bar\_\_app-name {
  cursor: default !important;
  pointer-events: none !important;
  }

C) Active navigation item - brand color

- Active items must show brand accent color (from branding.json):
  .slds-context-bar**item.slds-is-active .slds-context-bar**label-action {
  color: var(--brand-accent) !important;
  }

D) Hover states

- Nav items should indicate interactivity on hover:
  .slds-context-bar**item:not(.slds-context-bar**app-name) .slds-context-bar\_\_label-action:hover {
  text-decoration: none;
  }

---

## PATH COMPONENT (SALES OPPORTUNITY STAGES) - CRITICAL RULES

The Path component (.slds-path) is used for sales processes to show stage progression.

IMPORTANT LESSONS LEARNED:
A) DO NOT customize Path colors via CSS

- Path uses complex pseudo-elements (::before, ::after) to create chevron arrows
- Applying custom background colors to Path creates inconsistent tones (darker/lighter variations)
- Border colors on pseudo-elements cannot be reliably overridden without visual artifacts
- SLDS Path colors are tightly coupled to the chevron implementation

B) What you SHOULD customize:

1. Path container styling (border, padding, margins):
   .slds-path {
   margin-top: 1rem;
   margin-bottom: 1rem;
   }
   .slds-path\_\_track {
   background-color: #ffffff;
   border: 1px solid #dddbda;
   border-radius: 0.25rem;
   padding: 0.5rem 0.75rem;
   }

2. Check icon + hover behavior for completed stages:
   /_ Show check icon by default, hide label _/
   .slds-path**check {
   width: 0.875rem;
   height: 0.875rem;
   }
   .slds-path**hover-label {
   display: none;
   }
   /_ On hover: hide check, show label _/
   .slds-path**link:hover .slds-path**check {
   display: none;
   }
   .slds-path**link:hover .slds-path**hover-label {
   display: inline;
   }

C) Component implementation:

- Path MUST be a functional React component with state management
- Track currentStageIndex and selectedStageIndex
- "Mark Stage as Complete" button advances to next stage
- Clicking any stage allows "Mark as Current Stage"
- Render check icon for completed stages, title for others

D) DO NOT attempt to:

- Override Path background colors (complete/current/incomplete states)
- Change pseudo-element colors (::before, ::after)
- Apply custom clip-path or chevron styling
- Force colors with !important on Path link backgrounds

E) Let SLDS handle:

- All Path colors (green for complete, blue for current, gray for incomplete)
- Chevron arrow rendering via pseudo-elements
- State transitions and hover effects

If custom colors are absolutely required, use a completely custom Path implementation WITHOUT SLDS Path classes, building chevrons from scratch. Do NOT mix custom colors with SLDS Path structure.

---

## ACTIVITY + CHATTER (RIGHT SIDEBAR, ALWAYS VISIBLE) - COSMOS PARITY

Activity & Chatter MUST be a persistent right sidebar panel (always visible).
They must NOT be placed inside the main scoped tabs.
They MUST visually match the Lightning Activity/Chatter panel in SLDS 2 (Cosmos).

STRUCTURE (required)
A) Panel container

- Use a SLDS surface (card-like) with subtle border + padding like Salesforce.
- Top row MUST be tabs: "Activity" and "Chatter" (internal tabset).

B) Tabs (header)

- Use SLDS tabs markup (scoped or standard) but render it as a small header tab row.
- Active tab MUST show an underline using theme hooks (brand accent).
- "Activity" is default active.

C) Activity tab content (must resemble Salesforce)

1. ACTION BAR (row of circular icon buttons + dropdowns)

- First row under tabs MUST be an action bar with:
  - 4 circular icon buttons (left to right):
    1. Log a Call (utility: call)
    2. New Task (utility: task or check)
    3. New Event (utility: event or clock)
    4. Email (utility: email)
  - Each icon is inside a circular button (use SLDS button_icon + appropriate SLDS pattern).
  - Each has aria-label.
- After the 4 buttons:
  - A dropdown button (down chevron) to mimic "More actions"
  - A small settings/filters icon on the far right (utility: settings or filterList)
- Do NOT invent styling; use SLDS button/icon patterns. If circle is not achieved by markup, allow ONLY a targeted circle rule for the action buttons in the panel (not global).

2. FILTER LINE + ACTION LINKS

- Under the action bar, show a subtle filter summary line:
  "Filters: All time • All activities • All types"
- On the right (or next line aligned right), show action links:
  "Refresh • Expand All • View All"
- These must be links (not buttons) and use brand link color via hooks.

3. SECTION HEADER

- Section title: "Upcoming & Overdue" with a small chevron caret icon to indicate collapsible section.
- Optional small divider line below the header.

4. TIMELINE LIST (critical)
   Render items as a vertical timeline list resembling Salesforce:

- A left vertical indicator line (success/green).
- Each row must include (left-to-right):
  - Activity type badge icon (circular icon container)
  - A small checkbox (square) next to the item (like Salesforce)
  - Main title (link-styled, brand-colored) e.g., "Meeting with Acme stakeholders"
  - Optional 1-line subtitle: "You have an upcoming task about …"
  - Right side: date label (e.g., "26-feb") in muted text; overdue may appear in a warning color if desired (but keep minimal)
  - A small row action dropdown on the far right (down chevron / utility: down)
- Each list item MUST be a SLDS media object row (slds-media) with truncation.
- Use separators between items (light border).

5. HELPER CALLOUT (like Salesforce)

- At the bottom of the list, include a small neutral helper message row:
  "To change what's shown, try changing your filters."

6. CTA BUTTON

- Bottom CTA: "Show All Activities"
- Must be a brand button (slds-button_brand) so it picks theme hooks.

STYLING INDEPENDENCE (Activity panel):

- Activity panel buttons and tabs use brand colors independently from other components.
- Button groups inside Activity panel MUST keep fully rounded corners (not fused like page header).
- Tab active state uses brand accent via custom rule targeting .activity-panel specifically.
- All colors MUST come from branding variables (var(--brand-primary), var(--brand-accent)).

D) Empty / Loading states

- Provide a realistic empty state when no activities:
  - Show the filter line + "Upcoming & Overdue" header
  - Body shows a neutral message and still shows the CTA button.

E) Chatter tab content (Cosmos-like but simplified)

- Chatter tab MUST include:
  1. Composer area (.slds-publisher):
     - A small "Post" input region (textarea) with placeholder
     - A row of small action icons (attach/file/link) optional
     - A "Share" button (neutral or brand, Salesforce-like)
     - CRITICAL: Composer must have proper positioning to prevent overlap:
       .slds-publisher {
       position: relative !important;
       margin-bottom: 1rem !important;
       background-color: #ffffff !important;
       border: 1px solid #dddbda !important;
       border-radius: 0.25rem !important;
       padding: 0.75rem !important;
       }
  2. 1-2 feed items:
     - Avatar (use verified avatar image)
     - Author name + timestamp
     - Body text
     - Actions row (Like • Comment) as links

IMPORTANT VISUAL RULES

- Keep Activity/Chatter panel independent from main record tabs.
- Do NOT wrap Activity/Chatter inside another SLDS tabset in the left column.
- Use only SLDS patterns (tabs, media objects, lists, buttons, icons, truncation).
- No custom layout classes. If tiny alignment tweaks are needed, use SLDS utility classes only.

---

## specsMockup-DRIVEN COMPONENT RULES

Read "Componentes" from specsMockup.md and build accordingly.
However, for layout fidelity:

- If Layout is "tabs-with-sidebar", ALWAYS enforce the right sidebar Activity/Chatter panel.
- If ActivityPanel is listed, it MUST be the right sidebar panel (not nested).

For Account example with heavy related lists:

- Related tab shows multiple related list cards (Opportunities, Cases, Contacts, etc.)
- Use pagination or "View All" where specified.

---

## MODALS (Cosmos parity) - SIZE + HEADER ICON (CRITICAL)

All modals MUST follow the official SLDS modal pattern AND match Cosmos behavior:

A) HEIGHT MUST FIT CONTENT (no giant empty space)

- Do NOT set fixed heights on the modal container.
- The modal container height MUST be driven by content.
- If content exceeds viewport height:
  - Keep the header and footer fixed within the modal container
  - Make ONLY the body scrollable

Implementation rules:

- Use SLDS structure exactly:
  <section className="slds-modal slds-fade-in-open" role="dialog" aria-modal="true" aria-labelledby="modal-heading-01">
    <div className="slds-modal__container">
      <header className="slds-modal__header">...</header>
      <div className="slds-modal__content slds-p-around_medium" id="modal-content-id-01">...</div>
      <footer className="slds-modal__footer">...</footer>
    </div>
  </section>
  <div className="slds-backdrop slds-backdrop_open"></div>

- Default: no special sizing class; the container should be "natural size".
- If a modal needs more width (forms), use SLDS sizing classes ONLY:
  - slds-modal_small / slds-modal_medium / slds-modal_large (whichever is supported by the installed SLDS)
- Do NOT add custom CSS for width/height unless absolutely necessary.

Scrollable body rule (only when needed):

- If modal content may overflow, add only this SLDS helper:
  - slds-modal\_\_content + a max-height inline style is NOT allowed.
  - Instead, use SLDS scroll utility if available (e.g., slds-scrollable_y) on slds-modal\_\_content.
- If SLDS version lacks a needed utility, allow ONE targeted CSS rule in custom-adjustments.css:
  .slds-modal\_\_content { max-height: calc(100vh - 16rem); overflow: auto; }
  (This is the only allowed geometry rule for modals.)

B) "NEW RECORD" MODALS MUST SHOW OBJECT ICON (CIRCULAR)
For modals that create a record (New Opportunity, New Contact, New Case, etc.):

- Modal header MUST include the object icon as a circular badge + title.
- Use SLDS media object pattern in header:

<header className="slds-modal__header">
  <button className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" aria-label="Close">
    <svg className="slds-button__icon slds-button__icon_large" aria-hidden="true">
      <use href="/org-assets/icons/utility-sprite/svg/symbols.svg#close"></use>
    </svg>
  </button>

  <div className="slds-media slds-media_center slds-has-flexi-truncate">
    <div className="slds-media__figure">
      <span className="slds-icon_container slds-icon-standard-<object>" title="<Object>">
        <svg className="slds-icon slds-icon_small" aria-hidden="true">
          <use href="/org-assets/icons/standard-sprite/svg/symbols.svg#<object>"></use>
        </svg>
        <span className="slds-assistive-text"><Object></span>
      </span>
    </div>
    <div className="slds-media__body">
      <h2 className="slds-text-heading_medium slds-hyphenate" id="modal-heading-01">New <Object></h2>
    </div>
  </div>
</header>

- The icon MUST be circular via correct SLDS icon_container markup.
- Do not use blanket CSS to force circles; rely on markup.
- If the installed SLDS still renders it non-circular, allow ONLY the minimal targeted circle rule already permitted for icon badges.

C) FOOTER BUTTONS

- Use standard SLDS buttons:
  - Cancel: slds-button_neutral
  - Save: slds-button_brand
- No custom button CSS. Branding must come from theme hooks.

---

## WORKFLOW (strict)

1. Read inputs (branding.json, specsMockup.md).
2. Interpret branding -> hex conversion, derive primaryDark.
3. Validate SLDS CSS presence/size; download official SLDS 2 if needed.
4. Validate assets:
   - Avatars: list public/org-assets/images/ and select existing avatar image.
   - Logo: verify branding.logo.filename exists; else fallback.
5. Ensure app.css contains no disallowed content.
6. Wire CSS imports in correct order (app + Storybook preview):
   slds.css -> app.css -> popup.css -> custom-adjustments.css
7. Implement skeleton FIRST:
   GlobalHeader -> ContextBar -> RecordHomeHeader -> (optional Path)
8. Implement required 2-column grid:
   Left: scoped tabs (Details/Related/News)
   Right: Activity/Chatter panel always visible
9. Build modular components (src/components) using SLDS markup only.
10. Implement behaviors from "Comportamientos".
11. Create mock data in src/mocks.
12. Create stories:
    - Full page story
    - Story with modal open (if modals exist)
    - At least one empty state story (Activity empty or Related empty)
13. Run npm commands as needed:
    - npm install if needed
    - npm run build
14. AUTOMATICALLY start Storybook at end:
    - npm run storybook (background)
    - Inform URL (default http://localhost:6006)

---

## UX REQUIREMENTS

- Clear primary CTA (from specsMockup.md).
- Secondary actions grouped (button group + "More" dropdown).
- Empty/loading states for at least Activity panel.
- Accessibility: aria-label on icon-only buttons, correct tab roles/aria-selected, assistive text for icons.

---

## VALIDATION CHECKLIST (before saying "done")

✓ Official SLDS 2 CSS present and valid size
✓ No custom layout classes anywhere
✓ No SLDS component geometry overrides except Cosmos-allowed button border-radius
✓ Branding applied via CSS hooks - all colors use branding variables WITHOUT hardcoded fallbacks
✓ Cosmos button styling: rounded corners (1rem), brand-colored neutral buttons
✓ Button groups in page header use .slds-button-group (not list), buttons are direct children
✓ Button groups in page header are fused (shared borders)
✓ Dropdown in page header button group is functional with state management
✓ Button groups in Activity panel stay fully rounded (not fused)
✓ Icons use correct SLDS icon container markup and appear circular (or minimal targeted radius fix)
✓ Context bar is visible, resembles Lightning nav, and uses brand accent for active items
✓ Context bar "Sales" app name is non-interactive
✓ Path component (if present) uses SLDS base colors without custom color overrides
✓ Path shows check icon on completed stages, label on hover
✓ Path is functional with state management for stage progression
✓ Main scoped tabs are left column only
✓ Activity/Chatter is always visible in right column, not nested in main tabs
✓ Activity panel includes quick actions + timeline-like list + CTA with brand styling
✓ Activity panel tabs use brand accent for active state
✓ Stories created and Storybook started automatically

---

## DONE OUTPUT

Return:
A) UX decisions summary
B) Files created/modified
C) Storybook status + URL + story names
D) Validation checklist status
E) Limitations/TODOs

Do NOT paste full file contents unless the user asks.
