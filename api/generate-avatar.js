// api/generate-avatar.js
import { InferenceClient } from "@huggingface/inference";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  const client = new InferenceClient(process.env.HF_TOKEN);

  try {
    const image = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
    });

    res.status(200).json({ image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore nella generazione immagine" });
  }
}
