export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
          <span className="text-[#2563EB]" aria-hidden="true">⚡</span> Writebolt Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Production-ready, SEO-optimized blog template powered by Supabase and
          Next.js.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/blog"
            className="rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            View Blog
          </a>
          <a
            href="/admin"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            Admin Panel
          </a>
        </div>
      </div>
    </main>
  );
}
