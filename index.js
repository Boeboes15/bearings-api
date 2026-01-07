const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Health check (Railway loves this)
app.get("/", (req, res) => {
  res.json({ status: "Bearings API running 🚀" });
});

// ✅ Test DB connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ dbTime: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Debug: show current database & schema
app.get("/debug-db", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT current_database(), current_schema();
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all bearing series
app.get("/series", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, series_code
      FROM public.bearing_series
      ORDER BY series_code
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("SERIES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bearings API running on port ${PORT}`);
});
