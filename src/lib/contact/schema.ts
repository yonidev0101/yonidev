import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "name_min"),
  email: z.string().email("email_invalid"),
  phone: z
    .string()
    .regex(/^[\d\s+\-(). ]{7,20}$/, "phone_invalid")
    .optional()
    .or(z.literal("")),
  projectType: z.enum(["web", "ai", "bot", "api", "other"]),
  budget: z.enum(["lt5", "mid", "high", "top", "unsure"]),
  timeline: z.enum(["asap", "short", "medium", "flexible"]),
  message: z
    .string()
    .min(10, "message_min")
    .max(1500, "message_max"),
  _hp: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
