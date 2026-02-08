const path = require("path");
const express = require("express");

const app = express();

/**
 * STEP A: Static files serve করা
 * কেন?
 * - CSS / JS / Images যেন URL দিয়ে access করা যায়
 * - home.html এর সাথে home.css, home.js যুক্ত করা যাবে
 *
 * Example:
 * /css/home.css  -> frontend/public/css/home.css
 * /js/home.js    -> frontend/public/js/home.js
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * STEP B: Home page route
 * কেন?
 * - "/" হিট করলে home.html ফাইল রিটার্ন করবে
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

/**
 * STEP C: Health route (Optional কিন্তু helpful)
 * কেন?
 * - সার্ভার চলতেছে কিনা দ্রুত চেক করা যায়
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "mentora-frontend" });
});

/**
 * STEP D: Server start
 * কেন?
 * - port configurable রাখলে deploy সহজ হয়
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Mentora Frontend running at http://localhost:${PORT}`);
});
