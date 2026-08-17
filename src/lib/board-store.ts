import { promises as fs } from "node:fs";
import path from "node:path";

import type { BoardData, Card, CreateCardInput, UpdateCardInput } from "@/lib/types";

const boardPath = path.join(process.cwd(), "data", "board.json");

function cleanText(value: string) {
  return value.trim();
}

function validateRequired(value: string, field: string) {
  if (!cleanText(value)) {
    throw new Error(`${field} is required.`);
  }
}

export async function readBoard(): Promise<BoardData> {
  const raw = await fs.readFile(boardPath, "utf8");
  return JSON.parse(raw) as BoardData;
}

async function writeBoard(board: BoardData) {
  await fs.writeFile(boardPath, `${JSON.stringify(board, null, 2)}\n`, "utf8");
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
