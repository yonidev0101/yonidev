"use client";

import { Toaster } from "sonner";
import ConfirmDialogHost from "./ConfirmDialog";

export default function AdminToaster() {
  return (
    <>
      <ConfirmDialogHost />
      <Toaster
      position="top-center"
      dir="rtl"
      richColors
      closeButton
      expand
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "!font-[var(--font-heebo)] !rounded-xl !border !border-[#E2E8F0] !shadow-[0_8px_32px_-12px_rgba(15,23,42,0.18)]",
          title: "!font-bold !text-[14px] !text-[#0F172A]",
          description: "!text-[13px] !text-[#64748B]",
          success: "!bg-white !text-[#0F172A]",
          error: "!bg-white !text-[#0F172A]",
        },
      }}
    />
    </>
  );
}
