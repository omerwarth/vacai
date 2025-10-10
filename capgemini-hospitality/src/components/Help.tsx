'use client';

export default function Help() {
  return (
    <main className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow relative">
        {/* Top-right return link for when this is rendered as a standalone page */}
        <a
          href="/"
          className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-sky-50 text-sky-700 border border-sky-100 shadow-sm"
          aria-label="Return to main menu"
        >
          Main menu
        </a>

        <h1 className="text-3xl font-bold mb-4">Help & FAQ</h1>
        <p className="text-gray-700 mb-6">
          Welcome to the help page. Here you can find answers to common questions about using VACAI.
        </p>

        <section className="space-y-4">
          <details className="p-4 border rounded">
            <summary className="font-medium">How do I start planning a trip?</summary>
            <p className="mt-2 text-gray-600">Click the "Start Planning Your Journey" button on the homepage or dashboard to begin.</p>
          </details>

          <details className="p-4 border rounded">
            <summary className="font-medium">How do I sign out?</summary>
            <p className="mt-2 text-gray-600">Open the Profile menu in the top-right and click "Sign Out".</p>
          </details>

          <details className="p-4 border rounded">
            <summary className="font-medium">Still need help?</summary>
            <p className="mt-2 text-gray-600">Contact support at <a className="text-sky-600 underline" href="mailto:support@vacai.example">support@vacai.example</a>.</p>
          </details>
        </section>
      </div>
    </main>
  );
}
