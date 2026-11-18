"use client";

import type { UseFormReturn } from "react-hook-form";
import type { LeadFormInput } from "@/lib/schema";
import { Field, inputClass } from "./Field";

const HEAVY_ITEM_OPTIONS = [
  { value: "piano", label: "Piano" },
  { value: "safe", label: "Gun safe / safe" },
  { value: "pool_table", label: "Pool table" },
  { value: "hot_tub", label: "Hot tub" },
  { value: "other", label: "Other heavy item" },
] as const;

function todayLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function StepScope({ form }: { form: UseFormReturn<LeadFormInput> }) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">2. Home Size & Timeline</h3>

      <Field id="homeSize" label="Home Size / Scope" error={errors.homeSize?.message}>
        <select id="homeSize" {...register("homeSize")} className={inputClass}>
          <option value="studio_1bed">Studio / 1-Bedroom</option>
          <option value="2bed">2-Bedroom Home/Apartment</option>
          <option value="3bed">3-Bedroom Home</option>
          <option value="4plus_bed">4+ Bedroom Home / Large Office</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id="stairs" label="Stairs" error={errors.stairs?.message}>
          <select id="stairs" {...register("stairs")} className={inputClass}>
            <option value="none">None / ground floor</option>
            <option value="1flight">1 flight</option>
            <option value="2plus">2+ flights</option>
            <option value="elevator">Elevator</option>
          </select>
        </Field>

        <Field id="packing" label="Packing help" error={errors.packing?.message}>
          <select id="packing" {...register("packing")} className={inputClass}>
            <option value="none">No, I&apos;ll pack</option>
            <option value="partial">Some packing</option>
            <option value="full">Pack everything</option>
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-2">
          Any heavy or specialty items? <span className="font-normal text-slate-500">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {HEAVY_ITEM_OPTIONS.map((item) => (
            <label key={item.value} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                value={item.value}
                {...register("heavyItems")}
                className="h-4 w-4 rounded border-slate-300"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="moveDate" label="Target Move Date" error={errors.moveDate?.message}>
        <input
          id="moveDate"
          type="date"
          min={todayLocalISO()}
          {...register("moveDate")}
          className={inputClass}
        />
      </Field>
    </div>
  );
}
