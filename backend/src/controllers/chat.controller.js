import fetch from "node-fetch";

const LLM_API_URL = process.env.LLM_API_URL || "http://localhost:11434/api/generate";

export const sendMessage = async (req, res) => {
    const { message } = req.body;
    console.log("Message reçu:", message);

    try {
        const response = await fetch(LLM_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-oss",
                prompt: message,
                stream: false,
                options: {
                    thinking: false,
                    reasoning: false,
                    num_predict: 150,
                    temperature: 0.1,
                    top_k: 45,
                    top_p: 0.92,
                    repeat_penalty: 1.1
                }
            }),
        });

        const data = await response.json();
        console.log("Raw response:", data);

        const reply = data.response || data.completion || "No response";

        res.json({ reply });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error" });
    }
};
