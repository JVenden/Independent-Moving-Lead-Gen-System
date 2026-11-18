/** Shown on every page while NEXT_PUBLIC_DEMO_MODE=true (see netlify.toml). */
export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;
  return (
    <div className="bg-amber-100 text-amber-900 text-center text-sm px-4 py-2">
      <strong>Demo:</strong> prices are placeholders and quote requests aren&apos;t saved or sent.
    </div>
  );
}
