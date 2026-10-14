export default async function LinkProPage() {
  const apiBase = (process.env.WRITEBOLT_PRO_API_URL ?? "").replace(/\/$/, "");
  const apiKey = process.env.WRITEBOLT_PRO_API_KEY ?? "";

  if (!apiBase || !apiKey) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-xl font-bold">Link Pro</h1>
        <p className="text-sm text-gray-600">
          Set <code>WRITEBOLT_PRO_API_URL</code> and <code>WRITEBOLT_PRO_API_KEY</code> to
          manage pages in the Writebolt citation network.
        </p>
      </div>
    );
  }

  const res = await fetch(`${apiBase}/api/pro/link-pro`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  const pages = Array.isArray(data.pages) ? data.pages : [];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">Link Pro</h1>
      {!res.ok && <p className="text-sm text-red-600">{data.error ?? "Could not load pages"}</p>}
      <ul className="space-y-3">
        {pages.map((page: { id: string; title: string; url: string; times_placed?: number }) => (
          <li key={page.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="font-semibold">{page.title}</p>
            <a className="text-sm text-blue-700" href={page.url}>{page.url}</a>
            <p className="text-xs text-gray-500">Cited {page.times_placed ?? 0} times</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
