import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-xs text-zinc-500 sm:px-6 dark:text-zinc-500">
        <p>
          A portfolio project demonstrating interpretable forecasting and
          AI-assisted development. Probabilities are demo estimates — not
          betting advice, and not affiliated with or endorsed by FIFA.
        </p>
        <p>
          Tournament fixtures/results are fetched from a FIFA website data
          endpoint and stored as a static snapshot. Team strength inputs are
          placeholder demo values —{" "}
          <Link
            href="/limitations"
            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 dark:decoration-zinc-700 dark:hover:text-zinc-300"
          >
            read the limitations
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
