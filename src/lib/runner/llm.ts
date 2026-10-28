import OpenAI from "openai";
import type { ZodType } from "zod";

const client = new OpenAI();
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export type Shot = { base64: string };

/** Pergunta ao modelo e valida a resposta JSON com zod. Uma nova tentativa se vier inválida. */
export async function askJson<T>(opts: {
  system: string;
  prompt: string;
  shots?: Shot[];
  schema: ZodType<T>;
  maxTokens?: number;
}): Promise<T> {
  const content: OpenAI.Chat.ChatCompletionContentPart[] = [
    ...(opts.shots ?? []).map(
      (s): OpenAI.Chat.ChatCompletionContentPart => ({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${s.base64}`, detail: "low" },
      }),
    ),
    { type: "text", text: opts.prompt },
  ];

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.chat.completions.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${opts.system}\nResponda SOMENTE com um objeto JSON válido.` },
        { role: "user", content },
      ],
    });
    const text = res.choices[0]?.message?.content ?? "";
    try {
      return opts.schema.parse(JSON.parse(text));
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`Resposta da IA inválida: ${lastError.slice(0, 200)}`);
}
