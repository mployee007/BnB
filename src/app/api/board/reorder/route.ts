import { NextResponse } from "next/server";

import { reorderCards } from "@/lib/board-store";
import { commitAndPushBoard } from "@/lib/git-sync";
import type { ReorderCardsInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReorderCardsInput;
    const { board } = await reorderCards(payload.cards, payload.movedCardId);
    const git = await commitAndPushBoard("chore(board): reorder cards");

    return NextResponse.json({ board, git });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reorder cards.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
