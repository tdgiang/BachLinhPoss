# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

POSS (Point of Sale System) — A comprehensive Vietnamese POS application for managing sales, inventory, staff, customers, and operations across multi-store restaurant/retail chains. Built with React + Vite with a modular architecture based on 11 functional specifications.

## Architecture Overview

The application follows a **module-based architecture** with centralized state management in the root App component. Each major business function is isolated in a separate module component:

- **Core Modules:** POS Sale screen, Payment processing, Shifts management, Accounts/User management
- **Management Modules:** Menu & products, Inventory, Customers & loyalty, Promotions
- **Administrative:** Store management, Reports & analytics, Notifications, Audit logs
- **Infrastructure:** Navigation (Sidebar, Navbar), Mock data, CSS styling

Key architectural patterns:
- **State lifting:** All app state managed in App.jsx, passed down via props
- **Module-based UI:** Each module in `src/components/modules/` handles one spec
- **Spec-driven:** Guided by 11 detailed specifications in `docs/specs/` (numbered 01-11 in Vietnamese)
- **Mock data:** `src/data/mockData.js` provides realistic test data with stores, users, products, orders, etc.
- **Role-based access:** OWNER, MANAGER, STAFF roles with permission-specific UI rendering

## Build & Run

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server (HMR enabled, port 5173 by default)
npm run build                  # Build for production (output: dist/)
npm run preview                # Preview production build locally
```

## Test

Currently no automated test suite. Manual testing is conducted against the 11 spec documents in `docs/specs/`. When adding tests:
```bash
npm test                       # Run all tests (when configured)
npm test -- path/to/file       # Run single test file
```

## Lint / Format

```bash
npm run lint                   # Run Oxlint (code quality checking)
```

Oxlint configuration: `.oxlintrc.json` (Rust-based linter, faster than ESLint)

## Key Files & Directories

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Root component holding all app state and module routing; user authentication logic |
| `src/components/modules/` | Feature modules (PosSale, MenuModule, InventoryModule, etc.); each handles one spec |
| `src/components/Sidebar.jsx` | Navigation sidebar with role-based menu filtering |
| `src/components/Navbar.jsx` | Top navbar with user/store selector, shift info, notifications |
| `src/data/mockData.js` | Mock stores, users (OWNER/MANAGER/STAFF), products, orders, notifications |
| `src/App.css` | Global styling, layout grid, CSS variables (colors, spacing, typography) |
| `docs/specs/` | 11 functional specifications in Vietnamese (01-11) guiding feature implementation |
| `.oxlintrc.json` | Oxlint configuration for code quality |

## Important Development Notes

**State Management:** All state lives in App.jsx and flows down via props. No external state library (Redux/Zustand). This keeps the architecture simple but makes App.jsx large (~420 lines). When splitting modules into separate components, continue lifting state to App.

**Specifications-Driven Development:** Each numbered spec doc (01-11) maps to a feature set. When implementing or debugging:
- Spec 01: Login & permissions (AccountsModule, handleSwitchUser, currentUserRole)
- Spec 04: POS sale screen (PosSale, PaymentModal)
- Spec 05: Payment processing (PaymentModal)
- Other specs: See docs/specs/ for UI/business rules

**Role-Based Access:** Check `currentUserRole` (OWNER/MANAGER/STAFF) before rendering sensitive UI. Example in Sidebar.jsx filters menu items by role.

**Audit Logging:** App maintains `auditLogs` state recording login, logout, account changes, transactions. Displayed in AccountsModule.

**Mobile Responsiveness:** Sidebar supports mobile drawer (isMobileMenuOpen) and desktop collapse (isSidebarCollapsedDesktop). CSS uses media queries.

## UI/UX Pro Max Skill

The repository includes the `ui-ux-pro-max` design intelligence skill configured for both Claude Code and Antigravity:
- **Location:** `.claude/skills/ui-ux-pro-max/` and `.agents/skills/ui-ux-pro-max/`
- **Search design systems & color palettes:**
  ```bash
  python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "<product_name>"
  ```
- **Example for POSS:**
  ```bash
  python .claude/skills/ui-ux-pro-max/scripts/search.py "POS point of sale dashboard" --design-system -p "POSS System"
  ```

## Common Development Patterns

**Opening a New Screen:** Add a module case in App.jsx's main viewport switch statement; pass necessary state as props; add navigation handler in handleNavigate.

**Adding a Feature to an Existing Module:** Edit the module component (e.g., PosSale.jsx), add UI + state handling, pass callbacks back to parent (App) if state needs to persist.

**Updating Mock Data:** Edit `src/data/mockData.js` and re-import in App.jsx to test with new data (users, stores, products, orders, etc.).

**Styling:** Use CSS classes defined in src/App.css with CSS custom properties (--text-primary, --bg-surface, etc.) for consistent theming.
