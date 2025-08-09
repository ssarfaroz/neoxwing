import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER,
    "X-Title": process.env.OPENROUTER_X_TITLE,
  },
});

const analysisPrompt = `
You are a world-class trading analyst specializing in technical analysis of financial charts.
Your task is to analyze the provided trading chart image and return a structured JSON object with your findings.

The JSON object must conform to the following structure:
{
  "direction": "'long' or 'short'",
  "entry": "[entry_low, entry_high] (a range of two numbers)",
  "stop": "stop_loss_price (a single number)",
  "takeProfits": "[tp1, tp2] (an array of one or two numbers)",
  "rr": "risk_reward_ratio (a single number, calculated based on the primary take profit)",
  "confidence": "a number between 0 and 1 representing your confidence in this trade setup",
  "reasoning": "['a brief, bullet-point justification for the trade idea']",
  "timeframe": "'1h', '4h', '1d', etc. (your best guess of the chart's timeframe)"
}

Analyze the chart provided by the user and return only the JSON object. Do not include any other text, greetings, or explanations.
The user's trading horizon is:
`;

export async function analyzeChart(imageUrl: string, horizon: string) {
  const response = await openrouter.chat.completions.create({
    model: process.env.QWEN_VL_MODEL || "qwen/qwen2.5-vl-72b-instruct:free",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: analysisPrompt + horizon,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
  });

  if (response.choices[0].message.content) {
    return JSON.parse(response.choices[0].message.content);
  }

  throw new Error("Failed to get a valid response from the model.");
}
