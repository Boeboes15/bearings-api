const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 DATABASE CONNECTION (EXPLICIT + SAFE)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🟢 Health check
app.get("/", (req, res) => {
  res.json({ status: "Bearings API running 🚀" });
});

// 🧪 Test DB connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ dbTime: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Debug database + schema
app.get("/debug-db", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        current_database() AS database,
        current_schema() AS schema
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Debug tables (CONFIRM TABLES EXIST)
app.get("/debug-tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL BEARING SERIES
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

// ✅ GET ALL BEARINGS (THIS IS WHAT FLUTTER USES)
app.get("/bearings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        code,
        name,
        description
      FROM public.bearings_prod
      ORDER BY code
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("BEARINGS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔗 GET ALL CHAINS
app.get("/chains", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        code,
        name,
        description
      FROM public.chains
      ORDER BY code
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("CHAINS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📦 GET PRODUCTS BY CATEGORY (NEW)
app.get("/products", async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const result = await pool.query(
      `
      SELECT
        code,
        name,
        description
      FROM public.bearings_prod
      WHERE category = $1
      ORDER BY code
      `,
      [category]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("PRODUCTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 START SERVER (ALWAYS LAST)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bearings API running on port ${PORT}`);
});
