# Interactive Patterns

Read this reference only when a page uses a searchable table or inline detail reveal.

## Searchable tables

- Keep `18px` between `.filter-field` and the table.
- Use `14px 16px` cell padding and `8px` row spacing.
- Lift only unselected rows. A selected row stays still, uses `var(--rust-soft)` with a `var(--rust)` border, and never inherits the hover transform or shadow.

## Inline detail reveal

- Place the single detail row immediately after the selected row. Never use a shared panel at the bottom or auto-scroll the viewport.
- Animate `.detail-reveal` from `grid-template-rows:0fr` to `1fr`, with opacity and a `4px` translate. Never animate table-row height or detach the detail row.
- Hide the row after the close transition. Cancel any pending close timer before reopening, then force one layout read before adding `.open` so an old close cannot hide new content.

## Motion

- Respect `prefers-reduced-motion` for every hover and reveal transition.
