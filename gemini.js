// gemini.js 코드 (다시 확인!)
export default async (req, context) => {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    try {
        const body = await req.json();
        const apiKey = Netlify.env.get("GEMINI_API_KEY");
        if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: body.prompt }] }] })
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};