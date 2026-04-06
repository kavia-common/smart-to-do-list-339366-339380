import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "smart-todo-list:v1";
const FILTERS = /** @type {const} */ (["all", "active", "completed"]);

/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/** Create a stable random id without external deps. */
function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Load todos from localStorage with safety checks. */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: String(t.id ?? makeId()),
        text: String(t.text ?? "").trim(),
        completed: Boolean(t.completed),
        createdAt: Number(t.createdAt ?? Date.now()),
        updatedAt: Number(t.updatedAt ?? Date.now())
      }))
      .filter((t) => t.text.length > 0);
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// PUBLIC_INTERFACE
export default function App() {
  /** Main application component for the Todo List SPA. */
  const [todos, setTodos] = useState(() => loadTodos());
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    // Focus add input on first load for faster UX.
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (editingId) {
      // Focus edit input when editing starts.
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingId]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      case "all":
      default:
        return todos;
    }
  }, [todos, filter]);

  function addTodo() {
    const text = draft.trim();
    if (!text) return;

    /** @type {Todo} */
    const todo = {
      id: makeId(),
      text,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setTodos((prev) => [todo, ...prev]);
    setDraft("");
    inputRef.current?.focus();
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
      )
    );
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEditing(todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingText("");
  }

  function commitEditing() {
    const text = editingText.trim();
    if (!editingId) return;

    if (!text) {
      // If user clears the text, interpret as delete to keep list clean.
      deleteTodo(editingId);
      cancelEditing();
      return;
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, text, updatedAt: Date.now() } : t))
    );
    cancelEditing();
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  function toggleAllVisible() {
    const visible = filteredTodos;
    if (visible.length === 0) return;
    const allCompleted = visible.every((t) => t.completed);
    const visibleIds = new Set(visible.map((t) => t.id));
    setTodos((prev) =>
      prev.map((t) =>
        visibleIds.has(t.id) ? { ...t, completed: !allCompleted, updatedAt: Date.now() } : t
      )
    );
  }

  return (
    <div className="page">
      <div className="bg-gradient" aria-hidden="true" />
      <main className="container">
        <header className="header">
          <div>
            <h1 className="title">Todo List</h1>
            <p className="subtitle">
              Clean, fast, and persistent. <span className="badge">localStorage</span>
            </p>
          </div>

          <div className="meta">
            <div className="stat">
              <div className="statValue">{stats.active}</div>
              <div className="statLabel">Active</div>
            </div>
            <div className="stat">
              <div className="statValue">{stats.completed}</div>
              <div className="statLabel">Completed</div>
            </div>
            <div className="stat">
              <div className="statValue">{stats.total}</div>
              <div className="statLabel">Total</div>
            </div>
          </div>
        </header>

        <section className="card" aria-label="Add a todo">
          <div className="addRow">
            <div className="inputWrap">
              <span className="inputIcon" aria-hidden="true">
                +
              </span>
              <input
                ref={inputRef}
                className="textInput"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a new todo…"
                aria-label="Todo text"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo();
                }}
              />
            </div>

            <button className="btn btnPrimary" onClick={addTodo} type="button">
              Add
            </button>
          </div>

          <div className="toolbar">
            <div className="filters" role="tablist" aria-label="Todo filters">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`chip ${filter === f ? "chipActive" : ""}`}
                  onClick={() => setFilter(f)}
                  role="tab"
                  aria-selected={filter === f}
                >
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="toolbarActions">
              <button className="btn btnGhost" type="button" onClick={toggleAllVisible}>
                Toggle all
              </button>
              <button
                className="btn btnGhost"
                type="button"
                onClick={clearCompleted}
                disabled={stats.completed === 0}
                title={stats.completed === 0 ? "No completed todos to clear" : "Clear completed"}
              >
                Clear completed
              </button>
            </div>
          </div>
        </section>

        <section className="listCard" aria-label="Todo list">
          {filteredTodos.length === 0 ? (
            <div className="empty">
              <div className="emptyTitle">No todos here.</div>
              <div className="emptyHint">
                {filter === "completed"
                  ? "Complete a task to see it here."
                  : filter === "active"
                    ? "All caught up — nice work."
                    : "Add your first todo above."}
              </div>
            </div>
          ) : (
            <ul className="list" aria-label="Todos">
              {filteredTodos.map((todo) => {
                const isEditing = editingId === todo.id;
                return (
                  <li key={todo.id} className={`item ${todo.completed ? "itemCompleted" : ""}`}>
                    <button
                      type="button"
                      className={`check ${todo.completed ? "checkOn" : ""}`}
                      aria-label={todo.completed ? "Mark as not completed" : "Mark as completed"}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      <span className="checkInner" aria-hidden="true" />
                    </button>

                    <div className="itemMain">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          className="editInput"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          aria-label="Edit todo text"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEditing();
                            if (e.key === "Escape") cancelEditing();
                          }}
                          onBlur={() => commitEditing()}
                        />
                      ) : (
                        <button
                          type="button"
                          className="textBtn"
                          onClick={() => startEditing(todo)}
                          title="Click to edit"
                        >
                          <span className="itemText">{todo.text}</span>
                        </button>
                      )}

                      <div className="itemSub">
                        {todo.completed ? "Completed" : "Active"} •{" "}
                        {new Date(todo.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="itemActions">
                      {!isEditing ? (
                        <button
                          type="button"
                          className="iconBtn"
                          onClick={() => startEditing(todo)}
                          aria-label="Edit todo"
                          title="Edit"
                        >
                          ✎
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="iconBtn"
                          onClick={cancelEditing}
                          aria-label="Cancel editing"
                          title="Cancel"
                        >
                          ↩
                        </button>
                      )}

                      <button
                        type="button"
                        className="iconBtn danger"
                        onClick={() => deleteTodo(todo.id)}
                        aria-label="Delete todo"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <footer className="footer">
            <div className="footerLeft">
              Showing <strong>{filteredTodos.length}</strong> of{" "}
              <strong>{todos.length}</strong>
            </div>
            <div className="footerRight">
              <span className="dot" aria-hidden="true" />
              <span className="small">
                Tip: click a todo to edit. Press <kbd>Esc</kbd> to cancel.
              </span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
