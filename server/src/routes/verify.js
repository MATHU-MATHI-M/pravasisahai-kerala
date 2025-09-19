const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.post("/", async (req, res) => {
  const { health_id, barcode_id } = req.body;
  const snapshot = await db.collection("migrants").get();
  const users = snapshot.docs.map(doc => doc.data());

  const user = users.find(u =>
    (health_id && u.health_id === health_id) ||
    (barcode_id && u.barcode_id === barcode_id)
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    status: "success",
    verified: user.verified,
    health_id: user.health_id,
    barcode_id: user.barcode_id
  });
});

module.exports = router;