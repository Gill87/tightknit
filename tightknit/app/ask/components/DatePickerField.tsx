"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CalendarIcon, ChevronDownIcon } from "./icons";
import { cn, tkAsk } from "../formStyles";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const MONTHS_AHEAD = 12;

function startOfToday(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toIsoLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromIsoLocal(iso: string): Date | null {
  const [y, mo, day] = iso.split("-").map(Number);
  if (!y || !mo || !day) return null;
  return new Date(y, mo - 1, day);
}

function formatSelectedDay(iso: string): string {
  const dt = fromIsoLocal(iso);
  if (!dt) return iso;
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type MonthSpec = { year: number; month: number };

function monthsFrom(start: Date, count: number): MonthSpec[] {
  const y = start.getFullYear();
  const m = start.getMonth();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(y, m + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
}

function buildMonthCells(year: number, month: number): Array<
  | { kind: "empty" }
  | { kind: "day"; date: Date }
> {
  const first = new Date(year, month, 1);
  const pad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ kind: "empty" } | { kind: "day"; date: Date }> = [];
  for (let i = 0; i < pad; i++) cells.push({ kind: "empty" });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ kind: "day", date: new Date(year, month, d) });
  }
  while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
  return cells;
}

type DatePickerFieldProps = {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
};

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "Pick a day",
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const todayStart = useMemo(() => startOfToday(), []);

  const monthSpecs = useMemo(
    () => monthsFrom(todayStart, MONTHS_AHEAD),
    [todayStart],
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) close();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const handlePick = (iso: string) => {
    onChange(iso);
    close();
  };

  return (
    <div ref={rootRef} className={tkAsk.dateFieldRoot}>
      <button
        id={id}
        type="button"
        className={tkAsk.dateTrigger}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarIcon className="shrink-0 text-tk-terracotta" />
        <span className={tkAsk.dateTriggerLabel}>
          <span className={value ? "" : tkAsk.datePlaceholder}>
            {value ? formatSelectedDay(value) : placeholder}
          </span>
          <ChevronDownIcon
            className={cn(
              "shrink-0 text-tk-muted transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open ? (
        <div
          className={tkAsk.calendarPopover}
          role="dialog"
          aria-modal="true"
          aria-label="Choose a date"
        >
          <p className={tkAsk.calendarPopoverHint}>Scroll to browse months</p>
          <div className={tkAsk.calendarScroll}>
            {monthSpecs.map(({ year, month }) => (
              <MonthBlock
                key={`${year}-${month}`}
                year={year}
                month={month}
                todayStart={todayStart}
                selectedIso={value}
                onSelectDay={handlePick}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MonthBlock({
  year,
  month,
  todayStart,
  selectedIso,
  onSelectDay,
}: {
  year: number;
  month: number;
  todayStart: Date;
  selectedIso: string;
  onSelectDay: (iso: string) => void;
}) {
  const title = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const cells = useMemo(
    () => buildMonthCells(year, month),
    [year, month],
  );

  return (
    <div className={tkAsk.calendarMonthBlock}>
      <p className={tkAsk.calendarMonthTitle}>{title}</p>
      <div className={tkAsk.calendarWeekdays}>
        {WEEKDAY_LABELS.map((w) => (
          <span key={w} className={tkAsk.calendarWeekday}>
            {w}
          </span>
        ))}
      </div>
      <div className={tkAsk.calendarGrid}>
        {cells.map((cell, i) => {
          if (cell.kind === "empty") {
            return <span key={`e-${i}`} className={tkAsk.calendarCellEmpty} />;
          }
          const iso = toIsoLocal(cell.date);
          const disabled =
            cell.date.getTime() < todayStart.getTime();
          const selected = iso === selectedIso;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDay(iso)}
              className={cn(
                tkAsk.calendarDayBtn,
                selected && tkAsk.calendarDaySelected,
              )}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
