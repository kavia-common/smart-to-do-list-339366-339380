import React from "react";
import "./styles/tableResize.css";

/**
 * Minimal UI to ensure the table resizing guidance is applied in the React frontend.
 * This includes: scroll wrapper, fixed-layout table, wrapped headers, and safe cell overflow rules.
 */
export default function App() {
  // Example data shaped like the "cost table" described in the guidance doc
  const columns = [
    { key: "model", label: "Model", widthClass: "costColModel" },
    { key: "chat", label: "Chat environment", widthClass: "costColNarrow" },
    { key: "new", label: "New environment", widthClass: "costColNarrow" },
    { key: "uat", label: "UAT environment", widthClass: "costColNarrow" },
    { key: "qa", label: "QA environment", widthClass: "costColNarrow" },
    { key: "dev", label: "Develop environment", widthClass: "costColNarrow" },
    { key: "total", label: "Total", widthClass: "costColTotal" }
  ];

  const rows = [
    {
      model: "claude-3-5-sonnet-20241022 (very long model name to force wrapping)",
      chat: 1234567.89,
      new: 9876543.21,
      uat: 120.0,
      qa: 99999.12,
      dev: 531.4,
      total: 11111111.11
    },
    {
      model: "claude-3-opus-20240229",
      chat: 12.34,
      new: 56.78,
      uat: 0.0,
      qa: 91.01,
      dev: 2345.67,
      total: 251? /* intentionally odd to show ellipsis+title behaviour */
    }
  ];

  return (
    <div style={{ maxWidth: 980, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ margin: "0 0 12px", fontSize: 20, color: "#111827" }}>Table Resizing: Values Stay Within Cells</h1>
      <p style={{ margin: "0 0 16px", color: "#4b5563", fontSize: 14, lineHeight: 1.4 }}>
        This table applies: <code>table-layout: fixed</code>, wrapped headers, constrained body cells, and a horizontal scroll wrapper.
        Long values will not paint outside their cells.
      </p>

      <div className="tableScroll" aria-label="Cost table scroll container">
        <table className="costTable" aria-label="Example cost table">
          <colgroup>
            {columns.map((c) => (
              <col key={c.key} className={c.widthClass} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                {columns.map((c) => {
                  const value = r[c.key];
                  const display =
                    c.key === "model"
                      ? String(value)
                      : typeof value === "number"
                        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : String(value);

                  // Provide full visibility on hover when ellipsis occurs
                  return (
                    <td key={c.key} title={display}>
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
