"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { contactSchema, type ContactFormData } from "@/lib/contact/schema";
import { useT } from "@/lib/i18n/LocaleProvider";
import SuccessState from "./SuccessState";

type Status = "idle" | "submitting" | "success" | "error";

const MAX_MSG = 1500;

export default function ContactForm() {
  const t = useT();
  const f = t.contact.form;
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { projectType: "web", timeline: "flexible", budget: "unsure", _hp: "" },
  });

  const msgLen = watch("message")?.length ?? 0;
  const projectType = watch("projectType");
  const budget = watch("budget");
  const timeline = watch("timeline");

  function getErrorMessage(code: string | undefined): string {
    if (!code) return "";
    const map: Record<string, string> = {
      name_min: f.errors.required,
      email_invalid: f.errors.email,
      phone_invalid: f.errors.phone,
      message_min: f.errors.messageMin,
      message_max: f.errors.messageMax,
    };
    return map[code] ?? f.errors.generic;
  }

  async function onSubmit(data: ContactFormData) {
    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
    } catch {
      setStatus("error");
      setServerError(f.serverError);
    }
  }

  function handleReset() {
    reset();
    setStatus("idle");
    setServerError("");
  }

  const isDisabled = status === "submitting";

  const inputClass =
    "w-full h-12 rounded-xl border border-border px-4 text-sm text-heading placeholder:text-muted-text focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all disabled:opacity-60";
  const inputErrorClass = "border-red-400 focus:border-red-400 focus:ring-red-400/20";
  const labelClass = "block mb-2 text-sm font-semibold text-heading";

  const projectTypes = ["web", "ai", "bot", "api", "other"] as const;
  const budgets = ["lt5", "mid", "high", "top", "unsure"] as const;
  const timelines = ["asap", "short", "medium", "flexible"] as const;

  return (
    <div className="rounded-3xl bg-white border border-border shadow-[0_8px_32px_-12px_rgba(15,23,42,0.08)] p-8 md:p-10">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <SuccessState onReset={handleReset} />
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-7"
          >
            {/* Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute opacity-0 pointer-events-none"
              {...register("_hp")}
            />

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  {f.name} <span className="text-brand-500">{f.requiredMark}</span>
                </label>
                <input
                  type="text"
                  dir="auto"
                  placeholder={f.namePlaceholder}
                  disabled={isDisabled}
                  className={`${inputClass} ${errors.name ? inputErrorClass : ""}`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {getErrorMessage(errors.name.message)}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  {f.email} <span className="text-brand-500">{f.requiredMark}</span>
                </label>
                <input
                  type="email"
                  dir="auto"
                  placeholder={f.emailPlaceholder}
                  disabled={isDisabled}
                  className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {getErrorMessage(errors.email.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>
                {f.phone}{" "}
                <span className="text-muted-text text-xs font-normal">({f.phoneOptional})</span>
              </label>
              <input
                type="tel"
                dir="auto"
                placeholder={f.phonePlaceholder}
                disabled={isDisabled}
                className={`${inputClass} ${errors.phone ? inputErrorClass : ""}`}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {getErrorMessage(errors.phone.message)}
                </p>
              )}
            </div>

            <hr className="border-border-soft" />

            {/* Project type */}
            <div>
              <label className={labelClass}>
                {f.projectType.label} <span className="text-brand-500">{f.requiredMark}</span>
              </label>
              <div className="flex flex-wrap gap-2.5 mt-1">
                {projectTypes.map((key) => (
                  <label key={key} className="cursor-pointer">
                    <input type="radio" className="sr-only" value={key} {...register("projectType")} />
                    <span
                      className={`inline-flex px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                        projectType === key
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-bg-soft text-body border-border hover:border-brand-500/50"
                      }`}
                    >
                      {f.projectType.options[key]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className={labelClass}>
                {f.budget.label} <span className="text-brand-500">{f.requiredMark}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
                {budgets.map((key) => (
                  <label key={key} className="cursor-pointer">
                    <input type="radio" className="sr-only" value={key} {...register("budget")} />
                    <span
                      className={`flex items-center justify-center px-3 py-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        budget === key
                          ? "bg-brand-500/10 text-brand-500 border-brand-500"
                          : "bg-bg-soft text-body border-border hover:border-brand-500/50"
                      }`}
                    >
                      {f.budget.options[key]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className={labelClass}>
                {f.timeline.label} <span className="text-brand-500">{f.requiredMark}</span>
              </label>
              <div className="flex flex-wrap gap-2.5 mt-1">
                {timelines.map((key) => (
                  <label key={key} className="cursor-pointer">
                    <input type="radio" className="sr-only" value={key} {...register("timeline")} />
                    <span
                      className={`inline-flex px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                        timeline === key
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-bg-soft text-body border-border hover:border-brand-500/50"
                      }`}
                    >
                      {f.timeline.options[key]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-border-soft" />

            {/* Message */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className={labelClass}>
                  {f.message} <span className="text-brand-500">{f.requiredMark}</span>
                </label>
                <span className="text-xs text-muted-text tabular-nums">
                  {f.charCount.replace("{n}", String(msgLen)).replace("{max}", String(MAX_MSG))}
                </span>
              </div>
              <textarea
                rows={6}
                dir="auto"
                placeholder={f.messagePlaceholder}
                disabled={isDisabled}
                maxLength={MAX_MSG}
                className={`w-full rounded-xl border border-border px-4 py-3 text-sm text-heading placeholder:text-muted-text focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none transition-all disabled:opacity-60 ${
                  errors.message ? inputErrorClass : ""
                }`}
                {...register("message")}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">
                  {getErrorMessage(errors.message.message)}
                </p>
              )}
            </div>

            {/* Server error */}
            {status === "error" && serverError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all shadow-[0_4px_16px_rgba(43,127,255,0.3)] hover:shadow-[0_8px_24px_rgba(43,127,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {f.sending}
                </>
              ) : (
                <>
                  {f.submit}
                  <ArrowRight size={16} className="rtl:-scale-x-100" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
