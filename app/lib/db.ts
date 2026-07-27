export type City = {
  id: number;
  name: string;
  state: string;
  cost_per_officer_per_hour: number;
  cost_per_commander_per_hour: number;
  cost_per_vehicle_per_hour: number;
  cost_per_helicopter_per_hour: number;
  cost_per_motorcycle_per_hour: number;
  source_url: string | null;
  source_year: number | null;
};

export type ReportRecord = {
  id: string;
  city_id: number | null;
  custom_city: string | null;
  report_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location_description: string;
  latitude: number | null;
  longitude: number | null;
  officer_count: number;
  commander_count: number;
  vehicle_count: number;
  helicopter_count: number;
  motorcycle_count: number;
  estimated_total_cost: number;
  notes: string | null;
  city_name: string | null;
  city_state: string | null;
};

export type ReportComparisonRecord = {
  id: number;
  report_id: string;
  comparison_id: number | null;
  label: string;
  icon: string | null;
  cost_per_unit_used: number;
  count_equivalent: number;
  source_name: string | null;
  source_url: string | null;
  was_city_specific: number;
  description: string | null;
  plural_label: string | null;
};

export async function getCities(db: D1Database) {
  const result = await db.prepare("SELECT * FROM cities ORDER BY name ASC").all<City>();
  return result.results;
}

export async function getCityById(db: D1Database, id: number) {
  const result = await db.prepare("SELECT * FROM cities WHERE id = ?").bind(id).first<City>();
  return result;
}

export async function getComparisons(db: D1Database) {
  const result = await db
    .prepare("SELECT * FROM comparisons WHERE active = 1 ORDER BY id ASC")
    .all();
  return result.results;
}

export async function getComparisonsForCity(db: D1Database, cityId: number) {
  const result = await db
    .prepare(
      `SELECT
        c.id,
        c.label,
        c.description,
        c.icon,
        COALESCE(cco.cost_per_unit, c.cost_per_unit) AS cost_per_unit,
        c.unit_label,
        c.plural_label,
        COALESCE(cco.source_name, c.source_name) AS source_name,
        COALESCE(cco.source_url, c.source_url) AS source_url,
        CASE WHEN cco.cost_per_unit IS NULL THEN 0 ELSE 1 END AS was_city_specific
      FROM comparisons c
      LEFT JOIN city_comparison_costs cco
        ON c.id = cco.comparison_id
       AND cco.city_id = ?
      WHERE c.active = 1
      ORDER BY c.id ASC`,
    )
    .bind(cityId)
    .all();
  return result.results;
}

export async function saveReport(
  db: D1Database,
  report: {
    id: string;
    city_id: number | null;
    custom_city: string | null;
    report_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    location_description: string;
    latitude: number | null;
    longitude: number | null;
    officer_count: number;
    commander_count: number;
    vehicle_count: number;
    helicopter_count: number;
    motorcycle_count: number;
    estimated_total_cost: number;
    notes: string | null;
    share_token: string;
  },
) {
  await db
    .prepare(
      `INSERT INTO reports (
        id, city_id, custom_city, report_date, start_time, end_time, duration_minutes,
        location_description, latitude, longitude, officer_count, commander_count,
        vehicle_count, helicopter_count, motorcycle_count, estimated_total_cost, notes, share_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      report.id,
      report.city_id,
      report.custom_city,
      report.report_date,
      report.start_time,
      report.end_time,
      report.duration_minutes,
      report.location_description,
      report.latitude,
      report.longitude,
      report.officer_count,
      report.commander_count,
      report.vehicle_count,
      report.helicopter_count,
      report.motorcycle_count,
      report.estimated_total_cost,
      report.notes,
      report.share_token,
    )
    .run();
}

export async function saveComparisonSnapshot(
  db: D1Database,
  reportId: string,
  snapshots: Array<{
    comparison_id: number;
    label: string;
    icon: string | null;
    cost_per_unit_used: number;
    count_equivalent: number;
    source_name: string | null;
    source_url: string | null;
    was_city_specific: number;
  }>,
) {
  const statements = snapshots.map((snapshot) =>
    db
      .prepare(
        `INSERT INTO report_comparisons_snapshot (
          report_id, comparison_id, label, icon, cost_per_unit_used,
          count_equivalent, source_name, source_url, was_city_specific
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        reportId,
        snapshot.comparison_id,
        snapshot.label,
        snapshot.icon,
        snapshot.cost_per_unit_used,
        snapshot.count_equivalent,
        snapshot.source_name,
        snapshot.source_url,
        snapshot.was_city_specific,
      ),
  );

  await db.batch(statements);
}

export async function getReportBySlug(db: D1Database, slug: string) {
  return db
    .prepare(
      `SELECT
        r.*,
        c.name AS city_name,
        c.state AS city_state
      FROM reports r
      LEFT JOIN cities c ON c.id = r.city_id
      WHERE r.id = ?`,
    )
    .bind(slug)
    .first<ReportRecord>();
}

export async function getReportComparisons(db: D1Database, reportId: string) {
  const result = await db
    .prepare(
      `SELECT
        rs.*,
        c.description,
        c.plural_label
      FROM report_comparisons_snapshot rs
      LEFT JOIN comparisons c ON c.id = rs.comparison_id
      WHERE rs.report_id = ?
      ORDER BY rs.count_equivalent DESC`,
    )
    .bind(reportId)
    .all<ReportComparisonRecord>();
  return result.results;
}
