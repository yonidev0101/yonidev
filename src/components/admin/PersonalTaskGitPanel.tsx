"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  branchUrlFromRepo,
  pullRequestUrlFromRepo,
  shortSha,
} from "@/lib/admin/format";

export interface GitCommit {
  id: number;
  sha: string;
  url: string | null;
  summary: string;
  happenedAt: string;
}

/**
 * Ties a task to its git work: the branch it lives on (with tree/PR shortcuts)
 * and the commits already logged against it via the journal. Commits are read
 * from journal entries that carry a SHA — this panel doesn't create them.
 */
export default function PersonalTaskGitPanel({
  taskId,
  branchName,
  repoUrl,
  commits,
}: {
  taskId: number;
  branchName: string | null;
  repoUrl: string | null;
  commits: GitCommit[];
}) {
  const router = useRouter();
  const [branch, setBranch] = useState(branchName ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const saved = branchName ?? "";
  const branchUrl = branchUrlFromRepo(repoUrl, saved);
  const prUrl = pullRequestUrlFromRepo(repoUrl, saved);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/personal-tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchName: branch.trim() || null }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      toast.success("הענף עודכן");
      router.refresh();
    } else {
      toast.error("עדכון נכשל");
    }
  }

  return (
    <div dir="rtl" className="space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">גיט</div>

      {/* Branch row */}
      {editing ? (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="feature/my-branch"
            dir="ltr"
            className="flex-1 min-w-[200px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px] font-mono"
          />
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[12px] font-semibold px-4 py-2"
          >
            {saving ? "שומר…" : "שמור"}
          </button>
          <button
            onClick={() => {
              setBranch(saved);
              setEditing(false);
            }}
            className="text-[12px] text-[#64748B] hover:text-[#0F172A] px-1"
          >
            ביטול
          </button>
        </div>
      ) : saved ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 text-[13px] font-mono px-2.5 py-1 rounded bg-[#F1F5F9] text-[#0F172A]"
            dir="ltr"
          >
            <GitBranchIcon /> {saved}
          </span>
          {branchUrl && (
            <a
              href={branchUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[12px] font-semibold text-[#2B7FFF] hover:underline"
            >
              פתח ב-GitHub ↗
            </a>
          )}
          {prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[12px] font-semibold text-[#2B7FFF] hover:underline"
            >
              פתח PR ↗
            </a>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-[12px] text-[#94A3B8] hover:text-[#0F172A]"
          >
            ✎
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-[13px] text-[#2B7FFF] hover:underline font-semibold"
        >
          + הצמד ענף git
        </button>
      )}

      {/* Commits pulled from the journal */}
      {commits.length > 0 && (
        <ul className="space-y-1.5 pt-1">
          {commits.map((c) => (
            <li key={c.id} className="flex items-baseline gap-2 text-[13px]">
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="shrink-0 font-mono text-[12px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#2B7FFF] hover:bg-[#EFF6FF]"
                  dir="ltr"
                >
                  {shortSha(c.sha)}
                </a>
              ) : (
                <span
                  className="shrink-0 font-mono text-[12px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]"
                  dir="ltr"
                >
                  {shortSha(c.sha)}
                </span>
              )}
              <span className="text-[#475569] leading-snug truncate">{c.summary}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GitBranchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}
