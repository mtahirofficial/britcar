const express = require("express");
const router = express.Router();
const path = require("path");

router.use(
  "/static",
  express.static(path.join(__dirname, "../client/build/static")),
);
router.get("*", function (req, res) {
  const { shop } = req.query;
  res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors https://${encodeURIComponent(
      shop,
    )} https://admin.shopify.com`,
  );
  res.sendFile(
    "index.html",
    { root: path.join(__dirname, "../client/build/") },
    (err) => {
      if (err)
        res.send(
          `<div style="text-align: center;font-size: xxx-large;color: red;margin-top: 100px;">Maintenance in progress...</div>`,
        );
      res.end();
    },
  );
});

module.exports = router;
