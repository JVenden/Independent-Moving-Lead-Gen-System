"use client";

import type { UseFormReturn } from "react-hook-form";
import type { LeadFormInput } from "@/lib/schema";
import { Field, inputClass } from "./Field";

export function StepContact({ form }: { form: UseFormReturn<LeadFormInput> }) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">3. Where should we send your estimate?</h3>

      <Field id="fullName" label="Full Name" error={errors.fullName?.message}>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          {...register("fullName")}
          className={inputClass}
        />
      </Field>

      <Field id="phone" label="Cell Phone Number" error={errors.phone?.message}>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(555) 000-0000"
          {...register("phone")}
          className={inputClass}
        />
      </Field>

      <Field id="email" label="Email Address (optional)" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="john@example.com"
          {...register("email")}
          className={inputClass}
        />
      </Field>

      <Field id="referralSource" label="How did you hear about us? (optional)">
        <select id="referralSource" {...register("referralSource")} className={inputClass}>
          <option value="">Choose one…</option>
          <option value="google">Google search / Maps</option>
          <option value="facebook">Facebook</option>
          <option value="nextdoor">Nextdoor</option>
          <option value="referral">Friend / family</option>
          <option value="realtor">Realtor / property manager</option>
          <option value="repeat">Used you before</option>
          <option value="other">Other</option>
        </select>
      </Field>

      {/* SMS consent (TCPA): must be opt-in, unchecked by default */}
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" {...register("smsConsent")} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
        <span>
          Text me about my estimate and booking. Msg &amp; data rates may apply. Reply STOP to opt out.
        </span>
      </label>

      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
    </div>
  );
}
