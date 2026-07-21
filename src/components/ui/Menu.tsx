"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface MenuOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

interface MenuProps<T extends string | number> {
  label: string;
  options: MenuOption<T>[];
  value: T;
  onChange: (value: T) => void;
  trigger: ReactNode;
  align?: "left" | "right";
}

/**
 * Accessible popover menu (listbox pattern): focus trap, arrow-key roving,
 * Home/End, Escape restore. Used by player quality/speed/subtitle menus.
 */
export function Menu<T extends string | number>({
  label,
  options,
  value,
  onChange,
  trigger,
  align = "right",
}: MenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listId = useId();

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    listRef.current?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, options, value, close]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        e.stopPropagation();
        close();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const opt = options[activeIndex];
        if (opt) {
          onChange(opt.value);
          close();
        }
        break;
      }
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        title={label}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-pill px-2.5 text-caption text-ink-dim transition-colors duration-[var(--duration-fast)] hover:bg-graphite-800 hover:text-ink"
      >
        {trigger}
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${listId}-${activeIndex}`}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className={`glass absolute bottom-full z-50 mb-2 min-w-40 rounded-card p-1.5 shadow-card outline-none ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((opt, i) => {
            const selected = opt.value === value;
            return (
              <li
                key={String(opt.value)}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onChange(opt.value);
                  close();
                }}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-caption transition-colors duration-[var(--duration-instant)] ${
                  i === activeIndex ? "bg-graphite-800 text-ink" : "text-ink-dim"
                }`}
              >
                <span>{opt.label}</span>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
