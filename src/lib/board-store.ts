import { promises as fs } from "node:fs";
import path from "node:path";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { defaultBoard } from "@/lib/default-board";
import type {
  BoardData,
  Card,
  CreateCardInput,
  ReorderCardPosition,
  UpdateCardInput,
} from "@/lib/types";

const boardPath = path.join(process.cwd(), "data", "board.json");
const boardKey = "board";

type BoardKvBinding = {
  get(key: string, type: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type BoardStorage =
  | { kind: "kv"; kv: BoardKvBinding }
  | { kind: "file"; path: string };

function cloneDefaultBoard(): BoardData {
  return structuredClone(defaultBoard);
}

async function getBoardStorage(): Promise<BoardStorage> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const board = (env as { BOARD?: BoardKvBinding }).BOARD;

    if (board) {
      return { kind: "kv", kv: board };
    }
  } catch {
    // Local Node execution falls back to the filesystem.
  }

  return { kind: "file", path: boardPath };
}

function cleanText(value: string) {
  return value.trim();
}

function validateRequired(value: string, field: string) {
  if (!cleanText(value)) {
    throw new Error(`${field} is required.`);
  }
}

function parseBoard(raw: string | null): BoardData {
  if (!raw) {
    return cloneDefaultBoard();
  }

  return JSON.parse(raw) as BoardData;
}

export async function readBoard(): Promise<BoardData> {
  const storage = await getBoardStorage();

  if (storage.kind === "kv") {
    const raw = await storage.kv.get(boardKey, "text");

    if (!raw) {
      const seeded = cloneDefaultBoard();
      await storage.kv.put(boardKey, JSON.stringify(seeded));
      return seeded;
    }

    return parseBoard(raw);
  }

  try {
    const raw = await fs.readFile(/* turbopackIgnore: true */ storage.path, "utf8");
    return parseBoard(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seeded = cloneDefaultBoard();
      await fs.mkdir(path.dirname(storage.path), { recursive: true });
      await fs.writeFile(storage.path, `${JSON.stringify(seeded, null, 2)}\n`, "utf8");
      return seeded;
    }

    throw error;
  }
}

async function writeBoard(board: BoardData) {
  const storage = await getBoardStorage();

  if (storage.kind === "kv") {
    await storage.kv.put(boardKey, JSON.stringify(board));
    return;
  }

  await fs.mkdir(path.dirname(storage.path), { recursive: true });
  await fs.writeFile(storage.path, `${JSON.stringify(board, null, 2)}\n`, "utf8");
}

export async function createCard(input: CreateCardInput) {
  validateRequired(input.title, "Title");
  validateRequired(input.company, "Company");
  validateRequired(input.contact, "Contact");

  const board = await readBoard();
  const now = new Date().toISOString();

  const card: Card = {
    id: `card-${crypto.randomUUID()}`,
    title: cleanText(input.title),
    company: cleanText(input.company),
    contact: cleanText(input.contact),
    value: cleanText(input.value),
    priority: input.priority,
    notes: cleanText(input.notes),
    columnId: input.columnId,
    createdAt: now,
    updatedAt: now,
  };

  board.cards.unshift(card);
  await writeBoard(board);

  return { board, card };
}

export async function updateCard(cardId: string, updates: UpdateCardInput) {
  const board = await readBoard();
  const card = board.cards.find((item) => item.id === cardId);

  if (!card) {
    throw new Error("Card not found.");
  }

  if (updates.title !== undefined) {
    validateRequired(updates.title, "Title");
    card.title = cleanText(updates.title);
  }

  if (updates.company !== undefined) {
    validateRequired(updates.company, "Company");
    card.company = cleanText(updates.company);
  }

  if (updates.contact !== undefined) {
    validateRequired(updates.contact, "Contact");
    card.contact = cleanText(updates.contact);
  }

  if (updates.value !== undefined) {
    card.value = cleanText(updates.value);
  }

  if (updates.priority !== undefined) {
    card.priority = updates.priority;
  }

  if (updates.notes !== undefined) {
    card.notes = cleanText(updates.notes);
  }

  if (updates.columnId !== undefined) {
    card.columnId = updates.columnId;
  }

  card.updatedAt = new Date().toISOString();
  await writeBoard(board);

  return { board, card };
}

export async function reorderCards(
  cards: ReorderCardPosition[],
  movedCardId?: string
) {
  const board = await readBoard();

  if (cards.length !== board.cards.length) {
    throw new Error("Reorder payload does not match board card count.");
  }

  const byId = new Map(board.cards.map((card) => [card.id, card]));
  const seenIds = new Set<string>();
  const now = new Date().toISOString();

  const nextCards = cards.map(({ id, columnId }) => {
    const original = byId.get(id);

    if (!original) {
      throw new Error(`Unknown card id: ${id}`);
    }

    if (seenIds.has(id)) {
      throw new Error(`Duplicate card id: ${id}`);
    }

    seenIds.add(id);

    return {
      ...original,
      columnId,
      updatedAt:
        movedCardId && movedCardId === id ? now : original.updatedAt,
    } satisfies Card;
  });

  board.cards = nextCards;
  await writeBoard(board);

  return { board };
}

export async function deleteCard(cardId: string) {
  const board = await readBoard();
  const nextCards = board.cards.filter((item) => item.id !== cardId);

  if (nextCards.length === board.cards.length) {
    throw new Error("Card not found.");
  }

  board.cards = nextCards;
  await writeBoard(board);

  return { board };
}
