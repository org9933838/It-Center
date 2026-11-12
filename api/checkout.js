module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { name, phone, email } = req.body || {};
  if (!name || !phone || !email) return res.status(400).json({ error: "সব তথ্য দিন।" });

  const site = process.env.SITE_URL;
  const key = process.env.RUPANTORPAY_API_KEY;
  const base = process.env.RUPANTORPAY_URL || "https://payment.rupantorpay.com";
  const price = process.env.COURSE_PRICE || "399";
  if (!site || !key) return res.status(500).json({ error: "সার্ভার সেটআপ অসম্পূর্ণ।" });

  try {
    const r = await fetch(`${base}/api/payment/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-API-KEY": key },
      body: JSON.stringify({
        fullname: name,
        email,
        amount: String(price),
        metadata: { phone },
        success_url: `${site}/success.html`,
        cancel_url: site,
      }),
    });
    const d = await r.json();
    const url = d.payment_url || d.paymentURL || d.payment_link || d.url || (d.data && (d.data.payment_url || d.data.url));
    if (!url) return res.status(502).json({ error: d.message || "গেটওয়ে ত্রুটি।" });
    return res.status(200).json({ payment_url: url });
  } catch (e) {
    return res.status(500).json({ error: "সার্ভার ত্রুটি।" });
  }
};
