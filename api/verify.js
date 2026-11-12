module.exports = async (req, res) => {
  const id = req.query.transaction_id;
  if (!id) return res.status(400).json({ ok: false });
  const key = process.env.RUPANTORPAY_API_KEY;
  const base = process.env.RUPANTORPAY_URL || "https://payment.rupantorpay.com";
  const price = Number(process.env.COURSE_PRICE || "399");
  try {
    const r = await fetch(`${base}/api/payment/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-API-KEY": key },
      body: JSON.stringify({ transaction_id: id }),
    });
    const d = await r.json();
    const status = String(d.status || (d.data && d.data.status) || "").toUpperCase();
    const amount = Number(d.amount || (d.data && d.data.amount) || price);
    const paid = ["COMPLETED", "PAID", "SUCCESS", "SUCCESSFUL"].includes(status) && amount >= price;
    return res.status(200).json({ ok: paid, status, courseUrl: paid ? process.env.COURSE_URL : null });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
};
