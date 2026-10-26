import { z } from "zod";

export const understandSchema = z.object({
  product: z.object({
    name: z.string(),
    summary: z.string(),
    audience: z.string(),
    pricing: z.string(),
    main_flow: z.string(),
  }),
  clarity: z.object({
    score: z.number().min(0).max(10),
    verdict: z.string(),
    reason: z.string(),
  }),
});

export const actionSchema = z.object({
  previous_outcome: z.enum(["ok", "warn", "fail"]).nullable(),
  previous_note: z.string().nullable(),
  action: z.enum(["click", "type", "done"]),
  index: z.number().nullable(),
  text: z.string().nullable(),
  title: z.string(),
  reason: z.string(),
});

export const severity = z.enum(["critical", "high", "medium", "low"]);

export const finalSchema = z.object({
  summary: z.string(),
  works: z.array(z.string()),
  issues: z.array(
    z.object({
      severity,
      title: z.string(),
      detail: z.string(),
      where: z.string(),
      fix: z.string(),
    }),
  ),
});

export type Understand = z.infer<typeof understandSchema>;
export type Report = Understand & z.infer<typeof finalSchema>;
export type Issue = Report["issues"][number];
