"use client";

import type { UseFormReturn } from "react-hook-form";
import { needsDestination, type LeadFormInput } from "@/lib/schema";
import { Field, inputClass } from "./Field";

export function StepLocation({ form }: { form: UseFormReturn<LeadFormInput> }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const serviceType = watch("serviceType");
  const laborType = watch("laborType");
  const isLabor = serviceType === "labor_only";
  const showToZip = needsDestination({ serviceType, laborType });

  const fromLabel = !isLabor || laborType === "both"
    ? "Moving From (Zip)"
    : laborType === "unload"
      ? "Unloading Address (Zip)"
      : "Loading Address (Zip)";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">1. Service Type & Locations</h3>

      <Field id="serviceType" label="Select Service" error={errors.serviceType?.message}>
        <select id="serviceType" {...register("serviceType")} className={inputClass}>
          <option value="labor_only">Labor Only (You provide the truck)</option>
          <option value="full_service">Full Service (Truck & Crew provided)</option>
        </select>
      </Field>

      {isLabor && (
        <Field id="laborType" label="What do you need help with?" error={errors.laborType?.message}>
          <select
            id="laborType"
            {...register("laborType", { setValueAs: (v) => v || undefined })}
            className={inputClass}
          >
            <option value="">Choose one…</option>
            <option value="load">Loading only</option>
            <option value="unload">Unloading only</option>
            <option value="both">Loading & unloading</option>
          </select>
        </Field>
      )}

      <div className={showToZip ? "grid grid-cols-2 gap-4" : ""}>
        <Field id="fromZip" label={fromLabel} error={errors.fromZip?.message}>
          <input
            id="fromZip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="53925"
            {...register("fromZip")}
            className={inputClass}
          />
        </Field>

        {showToZip && (
          <Field id="toZip" label="Moving To (Zip)" error={errors.toZip?.message}>
            <input
              id="toZip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="53538"
              {...register("toZip")}
              className={inputClass}
            />
          </Field>
        )}
      </div>
    </div>
  );
}
