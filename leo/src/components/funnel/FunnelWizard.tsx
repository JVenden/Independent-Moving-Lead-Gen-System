"use client";

import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inboundSchema, stepSchemas, type InboundInput } from "@/lib/inbound/schema";
import type { Estimate } from "@/lib/inbound/pricing";
import { BRAND, telHref } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StepContact, StepGoals, StepProject } from "./Steps";

type Step = 1 | 2 | 3;
const TOTAL = 3;
const STEP_FIELDS: Record<Step, (keyof InboundInput)[]> = {
  1: ["projectType", "industry", "currentWebsite"],
  2: ["primaryGoal", "timeline"],
  3: ["businessName", "fullName", "phone", "email", "smsConsent", "nickname"],
};

export function FunnelWizard({ refSlug = "", businessName = "" }: { refSlug?: string; businessName?: string }) {
  const [step, setStep] = useState<Step | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [est, setEst] = useState<Estimate | null>(null);

  const form = useForm<InboundInput>({
    resolver: zodResolver(inboundSchema),
    defaultValues: {
      projectType: "lead_gen_funnel",
      industry: "",
      currentWebsite: "",
      primaryGoal: "more_leads",
      timeline: "within_30_days",
      businessName,
      fullName: "",
      phone: "",
      email: "",
      smsConsent: false,
      ref: refSlug,
      nickname: "",
    },
  });

  useEffect(() => {
    const sub = form.watch((_, { name }) => {
      if (name) form.clearErrors(name as keyof InboundInput);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const validateStep = (s: Step) => {
    form.clearErrors(STEP_FIELDS[s]);
    const result = stepSchemas[s].safeParse(form.getValues());
    if (result.success) return true;
    const seen = new Set<string>();
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof InboundInput;
      if (seen.has(field)) continue;
      form.setError(field, { type: "manual", message: issue.message }, { shouldFocus: seen.size === 0 });
      seen.add(field);
    }
    return false;
  };

  const next = () => {
    if (step === 4 || step === TOTAL) return;
    if (validateStep(step)) setStep((step + 1) as Step);
  };

  const onSubmit = async (data: InboundInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Something went wrong.");
      setEst(body.estimate);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = (errors: FieldErrors<InboundInput>) => {
    const s = ([1, 2, 3] as Step[]).find((x) => STEP_FIELDS[x].some((f) => errors[f]));
    if (s) setStep(s);
  };

  const pct = (Math.min(step, TOTAL) / TOTAL) * 100;

  return (
    <Card className="mx-auto w-full max-w-xl border-slate-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold text-slate-800">
          {step <= TOTAL ? "Get Your Instant Project Estimate" : "Your Estimate Is Ready"}
        </CardTitle>
        {step <= TOTAL && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Step {step} of {TOTAL}</span>
              <span>Takes about 60 seconds</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {step === 4 ? (
          <Success est={est} />
        ) : (
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && step < TOTAL && (e.target as HTMLElement).tagName === "INPUT") {
                e.preventDefault();
                next();
              }
            }}
          >
            {step === 1 && <StepProject form={form} />}
            {step === 2 && <StepGoals form={form} />}
            {step === 3 && <StepContact form={form} />}

            {error && step === TOTAL && (
              <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error} You can also call{" "}
                <a href={telHref(BRAND.phone)} className="font-semibold underline">{BRAND.phone}</a>.
              </div>
            )}

            <div className="mt-8 flex justify-between border-t border-slate-100 pt-4">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep((step - 1) as Step)}>Back</Button>
              ) : (
                <div />
              )}
              {step < TOTAL ? (
                <Button type="button" onClick={next} className="bg-blue-600 text-white hover:bg-blue-700">Next Step</Button>
              ) : (
                <Button type="submit" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {submitting ? "Building your estimate..." : "See My Estimate"}
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Success({ est }: { est: Estimate | null }) {
  if (!est) {
    return <p className="py-6 text-center text-slate-600">Thanks! We&apos;ll be in touch shortly.</p>;
  }
  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-600">✓</div>
      <p className="text-slate-600">
        Based on what you told us, the <strong>{est.packageLabel}</strong> package fits best:
      </p>
      <div className="mx-auto max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-3xl font-extrabold text-blue-600">
          ${est.setupMin.toLocaleString()}–${est.setupMax.toLocaleString()}
        </div>
        <p className="mt-1 text-sm text-slate-600">one-time setup, then <strong>${est.monthly}/mo</strong></p>
        <ul className="mt-3 space-y-1 text-left text-sm text-slate-700">
          {est.includes.map((i) => (
            <li key={i}>✓ {i}</li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-slate-500">
        Your details just hit {BRAND.ownerFirstName}&apos;s phone. Expect a call or text soon to walk through a live demo.
        Want to talk now?{" "}
        <a href={telHref(BRAND.phone)} className="font-semibold text-blue-600 underline">Call {BRAND.phone}</a>
      </p>
    </div>
  );
}
