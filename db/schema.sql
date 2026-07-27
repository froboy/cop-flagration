CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  cost_per_officer_per_hour REAL,
  cost_per_commander_per_hour REAL,
  cost_per_vehicle_per_hour REAL,
  cost_per_helicopter_per_hour REAL,
  cost_per_motorcycle_per_hour REAL,
  source_url TEXT,
  source_year INTEGER,
  notes TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  cost_per_unit REAL NOT NULL CHECK (cost_per_unit > 0),
  unit_label TEXT NOT NULL,
  plural_label TEXT,
  source_name TEXT,
  source_url TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS city_comparison_costs (
  city_id INTEGER NOT NULL REFERENCES cities(id),
  comparison_id INTEGER NOT NULL REFERENCES comparisons(id),
  cost_per_unit REAL NOT NULL CHECK (cost_per_unit > 0),
  source_name TEXT,
  source_url TEXT,
  PRIMARY KEY (city_id, comparison_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id),
  custom_city TEXT,
  report_date TEXT,
  start_time TEXT,
  end_time TEXT,
  duration_minutes INTEGER,
  location_description TEXT,
  latitude REAL,
  longitude REAL,
  officer_count INTEGER DEFAULT 0,
  commander_count INTEGER DEFAULT 0,
  vehicle_count INTEGER DEFAULT 0,
  helicopter_count INTEGER DEFAULT 0,
  motorcycle_count INTEGER DEFAULT 0,
  estimated_total_cost REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS report_comparisons_snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL REFERENCES reports(id),
  comparison_id INTEGER REFERENCES comparisons(id),
  label TEXT NOT NULL,
  icon TEXT,
  cost_per_unit_used REAL NOT NULL,
  count_equivalent INTEGER NOT NULL,
  source_name TEXT,
  source_url TEXT,
  was_city_specific INTEGER DEFAULT 0
);
