"use client";

import { useMemo, useState } from "react";

import type { BoardData, Card, Column, CreateCardInput, Priority } from "@/lib/types";

type BoardClientProps = {
  initialBoard: BoardData;
};

type DraftCard = CreateCardInput;

const emptyDraft: DraftCard = {
  title: "",
  company: "",
  contact: "",
  value: "",
  priority: "medium",
  notes: "",
  columnId: "new-leads",
};

const priorityClasses: Record<Priority, string> = {
  high: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30",
  medium: "bg-amber-500/15 text-amber-100 ring-1 ring-amber-500/30",
  low: "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/30",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function BoardClient({ initialBoard }: BoardClientProps) {
  const [board, setBoard] = useState(initialBoard);
  const [draft, setDraft] = useState<DraftCard>(emptyDraft);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Board ready. New cards auto-commit and push when git origin is configured."
  );

  const columnsById = useMemo(
    () => new Map(board.columns.map((column) => [column.id, column])),
    [board.columns]
  );

  async function createCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage("Creating card and syncing git…");

    const response = await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatusMessage(payload.error ?? "Unable to create card.");
      setIsSaving(false);
      return;
    }

    setBoard(payload.board as BoardData);
    setDraft({ ...emptyDraft, columnId: draft.columnId });
    setStatusMessage(payload.git?.message ?? "Card created.");
    setIsSaving(false);
  }

  async function updateCard(cardId: string, updates: Partial<CreateCardInput>) {
    setIsSaving(true);
    setStatusMessage("Saving board changes…");

    const response = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatusMessage(payload.error ?? "Unable to update card.");
      setIsSaving(false);
      return;
    }

    setBoard(payload.board as BoardData);
    setSelectedCard((current) =>
      current && current.id === cardId
        ? ((payload.card as Card | undefined) ?? current)
        : current
    );
    setStatusMessage(payload.git?.message ?? "Card updated.");
    setIsSaving(false);
  }

  async function removeCard(cardId: string) {
    setIsSaving(true);
    setStatusMessage("Removing card and syncing git…");

    const response = await fetch(`/api/cards/${cardId}`, {
      method: "DELETE",
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatusMessage(payload.error ?? "Unable to delete card.");
      setIsSaving(false);
      return;
    }

    setBoard(payload.board as BoardData);
    setSelectedCard(null);
    setStatusMessage(payload.git?.message ?? "Card removed.");
    setIsSaving(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <p className="inline-flex rounded-full bg-cyan-400/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Airbnb management workflow
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {board.business.name}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {board.business.tagline}. Track prospects, active clients, renewals, and
              closed wins in one place.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="open cards"
              value={String(board.cards.length)}
              helper="Across the full client pipeline"
            />
            <MetricCard
              label="high priority"
              value={String(board.cards.filter((card) => card.priority === "high").length)}
              helper="Needs fast follow-up"
            />
            <MetricCard
              label="active clients"
              value={String(
                board.cards.filter((card) => card.columnId === "active-clients").length
              )}
              helper="Current delivery workload"
            />
          </div>
        </div>

        <form onSubmit={createCard} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Add a new card</h2>
              <p className="text-sm text-slate-400">
                Every board change writes to <code>data/board.json</code> and syncs git.
              </p>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
              {isSaving ? "saving" : "ready"}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Task / opportunity" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} />
            <Input label="Company / client" value={draft.company} onChange={(value) => setDraft((current) => ({ ...current, company: value }))} />
            <Input label="Contact" value={draft.contact} onChange={(value) => setDraft((current) => ({ ...current, contact: value }))} />
            <Input label="Value" value={draft.value} onChange={(value) => setDraft((current) => ({ ...current, value: value }))} placeholder="$2,000/mo" />
            <SelectField
              label="Priority"
              value={draft.priority}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  priority: value as Priority,
                }))
              }
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
            <SelectField
              label="Starting column"
              value={draft.columnId}
              onChange={(value) => setDraft((current) => ({ ...current, columnId: value }))}
              options={board.columns.map((column) => ({ value: column.id, label: column.title }))}
            />
          </div>

          <label className="mt-3 block text-sm font-medium text-slate-200">
            Notes
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="What matters most for this lead or client?"
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">{statusMessage}</p>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add card
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-6">
        {board.columns.map((column) => {
          const cards = board.cards.filter((card) => card.columnId === column.id);

          return (
            <ColumnCard
              key={column.id}
              column={column}
              cards={cards}
              allColumns={board.columns}
              onMove={updateCard}
              onSelect={setSelectedCard}
            />
          );
        })}
      </section>

      {selectedCard ? (
        <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${priorityClasses[selectedCard.priority]}`}>
                  {selectedCard.priority} priority
                </span>
                <span className="text-sm text-slate-400">
                  In {columnsById.get(selectedCard.columnId)?.title ?? "Unknown column"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{selectedCard.title}</h2>
                <p className="text-slate-300">{selectedCard.company}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoPill label="contact" value={selectedCard.contact} />
                <InfoPill label="value" value={selectedCard.value || "—"} />
                <InfoPill label="updated" value={formatDate(selectedCard.updatedAt)} />
              </div>
              <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {selectedCard.notes || "No notes yet."}
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:w-80">
              <SelectField
                label="Move card"
                value={selectedCard.columnId}
                onChange={(value) => updateCard(selectedCard.id, { columnId: value })}
                options={board.columns.map((column) => ({ value: column.id, label: column.title }))}
              />
              <SelectField
                label="Priority"
                value={selectedCard.priority}
                onChange={(value) => updateCard(selectedCard.id, { priority: value as Priority })}
                options={[
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
              />
              <button
                type="button"
                onClick={() => removeCard(selectedCard.id)}
                className="rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
              >
                Delete card
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

type ColumnCardProps = {
  column: Column;
  cards: Card[];
  allColumns: Column[];
  onMove: (cardId: string, updates: Partial<CreateCardInput>) => Promise<void>;
  onSelect: (card: Card) => void;
};

function ColumnCard({ column, cards, allColumns, onMove, onSelect }: ColumnCardProps) {
  const currentIndex = allColumns.findIndex((item) => item.id === column.id);

  return (
    <article className="flex min-h-[420px] flex-col rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{column.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{column.description}</p>
        </div>
        <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-semibold text-slate-200">
          {cards.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {cards.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-white/10 px-4 text-center text-sm text-slate-500">
            No cards in this stage yet.
          </div>
        ) : null}

        {cards.map((card) => (
          <button
            type="button"
            key={card.id}
            onClick={() => onSelect(card)}
            className="rounded-[24px] border border-white/10 bg-slate-900/90 p-4 text-left transition hover:border-cyan-400/40 hover:bg-slate-900"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${priorityClasses[card.priority]}`}>
                {card.priority}
              </span>
              <span className="text-xs text-slate-500">{formatDate(card.updatedAt)}</span>
            </div>
            <h4 className="text-base font-semibold text-white">{card.title}</h4>
            <p className="mt-1 text-sm text-cyan-100">{card.company}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{card.notes}</p>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
              <span>{card.contact}</span>
              <span>{card.value || "No value yet"}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  const previous = allColumns[currentIndex - 1];
                  if (previous) {
                    void onMove(card.id, { columnId: previous.id });
                  }
                }}
                className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/30 disabled:opacity-30"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={currentIndex === allColumns.length - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  const next = allColumns[currentIndex + 1];
                  if (next) {
                    void onMove(card.id, { columnId: next.id });
                  }
                }}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-30"
              >
                Forward →
              </button>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-900/90 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <input
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <select
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
