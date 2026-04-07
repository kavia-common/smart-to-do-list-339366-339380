# Frontend (React)

This container includes a React UI and table-resizing CSS to ensure table headers and values do not overflow their cells.

## Key styles

- `table-layout: fixed` on `.costTable`
- wrapped headers (`th`)
- constrained body cells (`td` overflow + ellipsis + title)
- `.tableScroll` wrapper providing horizontal scrolling when needed
