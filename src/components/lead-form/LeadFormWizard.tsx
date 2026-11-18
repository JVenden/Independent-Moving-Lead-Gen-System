"use client";

import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema, stepSchemas, type LeadFormInput } from "@/lib/schema";
import { submitLead } from "@/lib/submitLead";
import type { Quote } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { StepLocation } from "./StepLocation";
import { StepScope } from "./StepScope";
import { StepContact } from "./StepContact";
import { StepSuccess } from "./StepSuccess";

type FormStep = 1 | 2 | 3;
const TOTAL_STEPS = 3;

const STEP_FIELDS: Record<FormStep, (keyof LeadFormInput)[]> = {
  1: ["serviceType", "laborType", "fromZip", "toZip"],
  2: ["homeSize", "stairs", "packing", "heavyItems", "moveDate"],
  3: ["fullName", "phone", "email", "smsConsent", "referralSource", "website"],
};

const BUSINESS_PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE;

export function LeadFormWizard() {
  const [currentStep, setCurrentStep] = useState<FormStep | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      serviceType: "labor_only",
      laborType: undefined,
      fromZip: "",
      toZip: "",
      homeSize: "2bed",
      stairs: "none",
      packing: "none",
      heavyItems: [],
      moveDate: "",
      fullName: "",
      phone: "",
      email: "",
      smsConsent: false,
      referralSource: "",
      website: "",
    },
  });

  // Clear a field's error as soon as the user edits it
  useEffect(() => {
    const sub = form.watch((_, { name }) => {
      if (name) form.clearErrors(name.split(".")[0] as keyof LeadFormInput);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const progressPercentage = (Math.min(currentStep, TOTAL_STEPS) / TOTAL_STEPS) * 100;

  /** Validate only the current step, so conditional rules show on the step that owns the field. */
  const validateStep = (step: FormStep) => {
    form.clearErrors(STEP_FIELDS[step]);
    const result = stepSchemas[step].safeParse(form.getValues());
    if (result.success) return true;

    const seen = new Set<string>();
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LeadFormInput;
      if (seen.has(field)) continue; // keep the first (most specific) message per field
      form.setError(field, { type: "manual", message: issue.message }, { shouldFocus: seen.size === 0 });
      seen.add(field);
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep === 4 || currentStep === TOTAL_STEPS) return;
    if (validateStep(currentStep)) setCurrentStep((currentStep + 1) as FormStep);
  };

  const handlePrev = () => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as FormStep) : prev));

  const onSubmit = async (data: LeadFormInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitLead(data);
      setQuote(res.quote);
      setCurrentStep(4);
    } catch (error) {
      console.error("Submission failed", error);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** If final validation finds a problem on an earlier step, jump back to it. */
  const onInvalid = (errors: FieldErrors<LeadFormInput>) => {
    const step = ([1, 2, 3] as FormStep[]).find((s) => STEP_FIELDS[s].some((f) => errors[f]));
    if (step) setCurrentStep(step);
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center text-slate-800">
          {currentStep <= TOTAL_STEPS ? "Get Your Instant Moving Estimate" : "Request Received"}
        </CardTitle>
        {currentStep <= TOTAL_STEPS && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span>{Math.round(progressPercentage)}% Completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          onKeyDown={(e) => {
            // Enter on steps 1–2 should mean "Next", not submit the whole form
            if (e.key === "Enter" && currentStep < TOTAL_STEPS && (e.target as HTMLElement).tagName === "INPUT") {
              e.preventDefault();
              handleNext();
            }
          }}
        >
          {currentStep === 1 && <StepLocation form={form} />}
          {currentStep === 2 && <StepScope form={form} />}
          {currentStep === 3 && <StepContact form={form} />}
          {currentStep === 4 && <StepSuccess quote={quote} serviceType={form.getValues("serviceType")} />}

          {submitError && currentStep === TOTAL_STEPS && (
            <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
              {BUSINESS_PHONE && (
                <>
                  {" "}You can also call us at{" "}
                  <a href={`tel:${BUSINESS_PHONE.replace(/\D/g, "")}`} className="font-semibold underline">
                    {BUSINESS_PHONE}
                  </a>
                  .
                </>
              )}
            </div>
          )}

          {currentStep <= TOTAL_STEPS && (
            <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <Button type="button" onClick={handlePrev} variant="outline" className="text-slate-600">
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < TOTAL_STEPS ? (
                <Button type="button" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? "Calculating..." : "Reveal Instant Estimate & Lock Date"}
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
