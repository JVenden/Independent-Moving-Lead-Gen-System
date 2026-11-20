"use client";

import type { UseFormReturn } from "react-hook-form";
import type { InboundInput } from "@/lib/inbound/schema";
import { Field, inputClass } from "./Field";

type Props = { form: UseFormReturn<InboundInput> };

function Choice({
  form,
  name,
  value,
  title,
  desc,
}: Props & { name: "projectType" | "primaryGoal" | "timeline"; value: string; title: string; desc?: string }) {
  const selected = form.watch(name) === value;
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
        selected ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <input type="radio" value={value} {...form.register(name)} className="mt-1 h-4 w-4 accent-blue-600" />
      <span>
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        {desc && <span className="block text-xs text-slate-500">{desc}</span>}
      </span>
    </label>
  );
}

export function StepProject({ form }: Props) {
  const { errors } = form.formState;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">1. What should we build for your business?</h3>
      <div className="grid gap-2">
        <Choice form={form} name="projectType" value="lead_gen_funnel" title="Website + instant quotes + lead texts" desc="Most popular: customers get a price, you get a text in seconds" />
        <Choice form={form} name="projectType" value="full_website" title="Full multi-page website" />
        <Choice form={form} name="projectType" value="landing_page" title="Single high-converting landing page" />
        <Choice form={form} name="projectType" value="local_seo_marketing" title="Local Google SEO & Maps ranking" />
      </div>
      {errors.projectType && <p className="text-xs text-red-600" role="alert">{errors.projectType.message}</p>}

      <Field id="industry" label="What kind of business? (optional)">
        <input id="industry" placeholder="e.g. roofing, moving, HVAC" {...form.register("industry")} className={inputClass} />
      </Field>
      <Field id="currentWebsite" label="Current website (optional)" hint="Leave blank if you don't have one yet">
        <input id="currentWebsite" placeholder="yourbusiness.com" {...form.register("currentWebsite")} className={inputClass} />
      </Field>
    </div>
  );
}

export function StepGoals({ form }: Props) {
  const { errors } = form.formState;
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-800">2. Goals & timeline</h3>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">What&apos;s your #1 priority?</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Choice form={form} name="primaryGoal" value="more_leads" title="More exclusive leads" desc="Stop paying lead brokers" />
          <Choice form={form} name="primaryGoal" value="automate_booking" title="Automate quotes" desc="Less phone tag" />
          <Choice form={form} name="primaryGoal" value="rank_on_google" title="Rank on Google & Maps" />
          <Choice form={form} name="primaryGoal" value="modernize_brand" title="Replace an outdated site" />
        </div>
        {errors.primaryGoal && <p className="mt-1 text-xs text-red-600" role="alert">{errors.primaryGoal.message}</p>}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">When do you want to launch?</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Choice form={form} name="timeline" value="asap" title="ASAP" desc="Ready this week" />
          <Choice form={form} name="timeline" value="within_30_days" title="Within 30 days" />
          <Choice form={form} name="timeline" value="1_to_3_months" title="1–3 months" />
          <Choice form={form} name="timeline" value="just_exploring" title="Just pricing options" />
        </div>
        {errors.timeline && <p className="mt-1 text-xs text-red-600" role="alert">{errors.timeline.message}</p>}
      </div>
    </div>
  );
}

export function StepContact({ form }: Props) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">3. Where should we send your estimate?</h3>
      <Field id="businessName" label="Business name" error={errors.businessName?.message}>
        <input id="businessName" autoComplete="organization" placeholder="Acme Roofing LLC" {...register("businessName")} className={inputClass} />
      </Field>
      <Field id="fullName" label="Your name" error={errors.fullName?.message}>
        <input id="fullName" autoComplete="name" placeholder="Jane Smith" {...register("fullName")} className={inputClass} />
      </Field>
      <Field id="phone" label="Cell phone" error={errors.phone?.message}>
        <input id="phone" type="tel" autoComplete="tel" placeholder="(555) 555-0199" {...register("phone")} className={inputClass} />
      </Field>
      <Field id="email" label="Email" error={errors.email?.message}>
        <input id="email" type="email" autoComplete="email" placeholder="jane@yourbusiness.com" {...register("email")} className={inputClass} />
      </Field>

      {/* SMS consent (TCPA): opt-in, unchecked by default */}
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" {...register("smsConsent")} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
        <span>Text me about my estimate. Msg &amp; data rates may apply. Reply STOP to opt out.</span>
      </label>

      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="nickname">Nickname</label>
        <input id="nickname" type="text" tabIndex={-1} autoComplete="off" {...register("nickname")} />
      </div>
    </div>
  );
}
