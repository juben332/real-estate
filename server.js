import http from "http";
import fs from "fs";
import Stripe from "stripe";

// Load .env.local
const env = fs.readFileSync(".env.local", "utf-8");
env.split("\n").forEach((line) => {
  const eq = line.indexOf("=");
  if (eq > 0) {
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    process.env[key] = val;
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/api/create-payment-intent") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { amount, currency = "usd" } = JSON.parse(body);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency,
          automatic_payment_methods: { enabled: true },
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ clientSecret: paymentIntent.client_secret }));
      } catch (err) {
        console.error("Stripe error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(3001, () => console.log("API server running on http://localhost:3001"));
