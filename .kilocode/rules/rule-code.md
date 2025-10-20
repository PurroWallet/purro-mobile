# rule-code.md

# AI Coding Guidelines for React/React Native Project
## 1. Tooling
- Using MCP for find the information to empower the response, leveraging project-specific knowledge.
## 2. Form Handling
- All forms **must**:
  - Use **zod** schemas for validation.
  - Use **react-hook-form** for state, validation, and submit logic.
  - Use shared, reusable input components (e.g., `Input`, `PasswordInput`) from `@components`, never handcraft inline.
- **Avoid**:
  - Managing form state or validation using `useState`, `useEffect` (unless special logic is truly needed).

## 3. Multi-language & Theming
- All UI content **must**:
  - Use built-in i18n system, **never** hardcode text.
  - When adding new features, always provide translation keys.
- All components **must**:
  - Support dark/light theme by leveraging the theme context/provider—**never** hardcode colors.

## 4. State Management & Data Fetching
- **Do not** use Context API/Redux unless required by project lead.
- **All global/business state** must be in **zustand** stores.
- **All server data fetching/caching** must be handled using **react-query** (TanStack Query).
  - **Never** fetch data via `useEffect` if react-query can be used.

## 5. Component Structure & Styling
- Keep components as **stateless** as possible; only allow local UI state.
- Extract all duplicated UI patterns (inputs, buttons, fields) into reusable components in `@components`.
- Use variables from the theme provider/context for all styles—**never** hardcode style values.

## 6. General Best Practices
- All code must be clean, readable, and follow the team’s coding conventions.
- Always check for and integrate multi-language and theming support in new features.
- Clearly comment complex or uncommon logic; use descriptive variable and function names.
- No copy-paste ad hoc code; always follow best practices and established patterns.

---
**All AI-generated code must strictly follow these project rules and patterns.**
