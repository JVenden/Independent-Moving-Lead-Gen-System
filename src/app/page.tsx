import { LeadFormWizard } from "@/components/lead-form/LeadFormWizard";

export default function Home() {
  return (
    <main className="px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Local Movers. Instant Price.
        </h1>
        <p className="mt-3 text-slate-600">
          Answer a few quick questions and see your estimate in under a minute. No account needed.
        </p>
      </div>
      <LeadFormWizard />
    </main>
  );
}
