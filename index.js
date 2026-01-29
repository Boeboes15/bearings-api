const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 DATABASE CONNECTION
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

// 🔍 Debug tables
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

// 🔩 BEARINGS
app.get("/bearings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT code, name, description
      FROM public.bearings_prod
      ORDER BY code
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔗 CHAINS
app.get("/chains", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT code, name, description
      FROM public.chains
      ORDER BY code
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔩 COUPLINGS
app.get("/couplings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT code, name, description, size
      FROM public.couplings
      ORDER BY code
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bearings API running on port ${PORT}`);
});
