import { NextResponse } from "next/server";

import { commitAndPushBoard } from "@/lib/git-sync";
import { createCard, readBoard } from "@/lib/board-store";
import type { CreateCardInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const board = await readBoard();

  return NextResponse.json({ board });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateCardInput;
    const { board, card } = await createCard(payload);
    const git = await commitAndPushBoard(`feat(board): add ${card.title}`);

    return NextResponse.json({ board, card, git });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create card.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
