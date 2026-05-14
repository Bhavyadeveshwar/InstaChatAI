import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runSmartAI({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content?.trim() ??
      "Thanks for reaching out! I'll get back to you shortly."
    );
  } catch (err) {
    console.error("OpenAI error:", err);
    return "Thanks for your message! I'll respond shortly.";
  }
}
