export default async function IdeasPage() {
  const apiBase = (process.env.WRITEBOLT_PRO_API_URL ?? "").replace(/\/$/, "");
  const apiKey = process.env.WRITEBOLT_PRO_API_KEY ?? "";

  if (!apiBase || !apiKey) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-xl font-bold">Today’s desk</h1>
        <p className="text-sm text-gray-600">
          Set <code>WRITEBOLT_PRO_API_URL</code> and <code>WRITEBOLT_PRO_API_KEY</code> to
          load the 2–3 daily stories from Writebolt Pro.
        </p>
      </div>
    );
  }

  const res = await fetch(`${apiBase}/api/pro/ideas`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  const ideas = Array.isArray(data.ideas) ? data.ideas : [];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">Today’s desk</h1>
      {!res.ok && <p className="text-sm text-red-600">{data.error ?? "Could not load ideas"}</p>}
      {ideas.map((idea: { id: string; headline: string; description?: string; story_type?: string }) => (
        <article key={idea.id} className="rounded-xl border border-gray-200 bg-white p-4">
          {idea.story_type && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{idea.story_type}</p>
          )}
          <h2 className="font-semibold">{idea.headline}</h2>
          {idea.description && <p className="mt-1 text-sm text-gray-600">{idea.description}</p>}
        </article>
      ))}
    </div>
  );
}
