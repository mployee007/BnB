import { getCloudflareContext } from "@opennextjs/cloudflare";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

async function git(args: string[]) {
  return execFile("git", ["-C", process.cwd(), ...args], {
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
}

async function isCloudflareRuntime() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const runtimeEnv = env as {
      CF_ACCOUNT_ID?: string;
      BOARD?: unknown;
      ASSETS?: unknown;
    };

    return Boolean(runtimeEnv.CF_ACCOUNT_ID || runtimeEnv.BOARD || runtimeEnv.ASSETS);
  } catch {
    return false;
  }
}

async function hasOriginRemote() {
  try {
    await git(["remote", "get-url", "origin"]);
    return true;
  } catch {
    return false;
  }
}

export async function commitAndPushBoard(changeSummary: string) {
  if (await isCloudflareRuntime()) {
    return {
      committed: false,
      pushed: false,
      message:
        "Board saved to Cloudflare KV. Git auto-push runs only in the local Node deployment.",
    };
  }

  await git(["add", "data/board.json"]);

  try {
    await git(["diff", "--cached", "--quiet"]);
    return {
      committed: false,
      pushed: false,
      message: "No board changes to commit.",
    };
  } catch {
    // A non-zero exit here means there is a staged diff to commit.
  }

  await git(["commit", "-m", changeSummary]);

  if (!(await hasOriginRemote())) {
    return {
      committed: true,
      pushed: false,
      message: "Committed locally. Push skipped because origin is not configured yet.",
    };
  }

  try {
    await git(["push", "origin", "main"]);
    return {
      committed: true,
      pushed: true,
      message: "Committed and pushed board changes.",
    };
  } catch (error) {
    console.error("git push failed", error);
    return {
      committed: true,
      pushed: false,
      message: "Committed locally, but push failed. Check git credentials or remote access.",
    };
  }
}
