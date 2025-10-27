// api/generate-avatar.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      prompt,
      seed = 123456,
      width = 1024,
      height = 1024,
      steps = 32,
      guidance = 5.5,
      negative_prompt
    } = req.body || (await req.json?.()); // compat JSON body

    const MODEL_VERSION = process.env.REPLICATE_MODEL_VERSION; // es. "bytedance/seedream-4:xxxx"
    const TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!TOKEN || !MODEL_VERSION) {
      return res.status(500).json({ error: "Missing Replicate env vars" });
    }

    const safePrompt =
      `${prompt}, cinematic lighting, elegant, adult (18+), tasteful, not resembling real persons`;

    const input = {
      prompt: safePrompt,
      width,
      height,
      num_inference_steps: steps,
      guidance_scale: guidance,
      seed,
      negative_prompt: negative_prompt ?? "nudity, explicit, minors, deformed, low quality"
    };

    // 1 chiamata con "Prefer: wait" per attendere il risultato
    const r = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait"
      },
      body: JSON.stringify({ version: MODEL_VERSION, input })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: err });
    }

    const data = await r.json();
    const out = Array.isArray(data.output) ? data.output[data.output.length - 1] : data.output;
    return res.status(200).json({ image_url: out });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "generation_failed" });
  }
}