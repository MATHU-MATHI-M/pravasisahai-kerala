const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.get("/", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const health_id = token?.replace("mock-token-", "");

  const snapshot = await db.collection("migrants").get();
  const users = snapshot.docs.map(doc => doc.data());
  const user = users.find(u => u.health_id === health_id);

  if (!user) return res.status(401).json({ message: "Invalid token" });

  res.json({
    health_id: user.health_id,
    name: user.name,
    aadhaar_last4: user.aadhaar_number?.slice(-4),
    phone: user.phone,
    kms_id: user.kms_id,
    dob: user.dob,
    age: user.age,
    from_state: user.from_state,
    work_place: user.work_place,
    verified: user.verified
  });
});

module.exports = router;