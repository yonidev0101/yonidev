"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function SuccessState({ onReset }: { onReset: () => void }) {
  const t = useT();
  const f = t.contact.form;

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center py-16 px-4 gap-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center"
      >
        <CheckCircle2 size={40} className="text-brand-500" />
      </motion.div>

      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-bold text-heading">{f.success.heading}</h3>
        <p className="text-body text-sm">{f.success.body}</p>
      </div>

      <button
        onClick={onReset}
        className="text-sm text-brand-500 font-semibold hover:underline underline-offset-2"
      >
        {f.success.again}
      </button>
    </motion.div>
  );
}
