module.exports = async (req, res) => {
  const id = req.query.invoice_id;
  if (!id) return res.status(400).json({ ok: false });
  const base = process.env.UDDOKTAPAY_URL;
  const key = process.env.UDDOKTAPAY_API_KEY;
  const price = Number(process.env.COURSE_PRICE || "399");
  try {
    const r = await fetch(`${base}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "RT-UDDOKTAPAY-API-KEY": key },
      body: JSON.stringify({ invoice_id: id }),
    });
    const d = await r.json();
    const paid = d.status === "COMPLETED" && Number(d.amount) >= price;
    return res.status(200).json({ ok: paid, courseUrl: paid ? process.env.COURSE_URL : null });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
};
