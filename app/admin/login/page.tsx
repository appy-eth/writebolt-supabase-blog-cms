import { loginAdmin } from "./actions";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
          Admin sign in
        </h1>
        {searchParams.error === "1" && (
          <p className="mb-4 text-center text-sm text-red-600">
            Invalid username or password.
          </p>
        )}
        <form action={loginAdmin} className="space-y-4">
          <div>
            <input
              name="username"
              type="text"
              placeholder="Username"
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
