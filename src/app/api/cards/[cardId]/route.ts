import { NextResponse } from "next/server";

import { commitAndPushBoard } from "@/lib/git-sync";
import { deleteCard, updateCard } from "@/lib/board-store";
import type { UpdateCardInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/cards/[cardId]">
) {
  const { cardId } = await context.params;

  try {
    const payload = (await request.json()) as UpdateCardInput;
    const { board, card } = await updateCard(cardId, payload);
    const git = await commitAndPushBoard(`chore(board): update ${card.title}`);

    return NextResponse.json({ board, card, git });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update card.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/cards/[cardId]">
) {
  const { cardId } = await context.params;

  try {
    const { board } = await deleteCard(cardId);
    const git = await commitAndPushBoard(`chore(board): remove ${cardId}`);

    return NextResponse.json({ board, git });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete card.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
