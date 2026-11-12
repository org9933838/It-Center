module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { name, phone, email } = req.body || {};
  if (!name || !phone || !email) return res.status(400).json({ error: "সব তথ্য দিন।" });

  const site = process.env.SITE_URL;
  const base = process.env.UDDOKTAPAY_URL;
  const key = process.env.UDDOKTAPAY_API_KEY;
  const price = process.env.COURSE_PRICE || "399";
  if (!site || !base || !key) return res.status(500).json({ error: "সার্ভার সেটআপ অসম্পূর্ণ।" });

  try {
    const r = await fetch(`${base}/api/checkout-v2`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "RT-UDDOKTAPAY-API-KEY": key },
      body: JSON.stringify({
        full_name: name,
        email,
        amount: String(price),
        metadata: { phone },
        redirect_url: `${site}/success.html`,
        cancel_url: site,
      }),
    });
    const d = await r.json();
    if (!d.payment_url) return res.status(502).json({ error: d.message || "গেটওয়ে ত্রুটি।" });
    return res.status(200).json({ payment_url: d.payment_url });
  } catch (e) {
    return res.status(500).json({ error: "সার্ভার ত্রুটি।" });
  }
};
