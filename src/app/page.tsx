import { BoardClient } from "@/components/board-client";
import { readBoard } from "@/lib/board-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const board = await readBoard();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)]">
      <BoardClient initialBoard={board} />
    </main>
  );
}
