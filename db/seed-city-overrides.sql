-- Housing overrides (comparison_id = 1)
INSERT INTO city_comparison_costs (city_id, comparison_id, cost_per_unit, source_name, source_url) VALUES
  (1, 1, 1350, 'HUD FMR 2024 - Austin', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (2, 1, 1400, 'HUD FMR 2024 - Chicago', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (3, 1, 1100, 'HUD FMR 2024 - Dallas', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (4, 1, 900, 'HUD FMR 2024 - Houston', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (5, 1, 2200, 'HUD FMR 2024 - Los Angeles', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (6, 1, 2800, 'HUD FMR 2024 - New York City', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (7, 1, 1300, 'HUD FMR 2024 - Philadelphia', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (8, 1, 1050, 'HUD FMR 2024 - Phoenix', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (9, 1, 850, 'HUD FMR 2024 - San Antonio', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (10, 1, 1900, 'HUD FMR 2024 - San Diego', 'https://www.huduser.gov/portal/datasets/fmr.html'),
  (11, 1, 2500, 'HUD FMR 2024 - San Jose', 'https://www.huduser.gov/portal/datasets/fmr.html');

-- Therapy overrides (comparison_id = 3)
INSERT INTO city_comparison_costs (city_id, comparison_id, cost_per_unit, source_name, source_url) VALUES
  (1, 3, 145, 'SAMHSA TX 2024', 'https://www.samhsa.gov/mental-health'),
  (2, 3, 160, 'SAMHSA IL 2024', 'https://www.samhsa.gov/mental-health'),
  (3, 3, 135, 'SAMHSA TX 2024', 'https://www.samhsa.gov/mental-health'),
  (4, 3, 120, 'SAMHSA TX 2024', 'https://www.samhsa.gov/mental-health'),
  (5, 3, 220, 'SAMHSA CA 2024', 'https://www.samhsa.gov/mental-health'),
  (6, 3, 250, 'SAMHSA NY 2024', 'https://www.samhsa.gov/mental-health'),
  (7, 3, 155, 'SAMHSA PA 2024', 'https://www.samhsa.gov/mental-health'),
  (8, 3, 130, 'SAMHSA AZ 2024', 'https://www.samhsa.gov/mental-health'),
  (9, 3, 115, 'SAMHSA TX 2024', 'https://www.samhsa.gov/mental-health'),
  (10, 3, 200, 'SAMHSA CA 2024', 'https://www.samhsa.gov/mental-health'),
  (11, 3, 230, 'SAMHSA CA 2024', 'https://www.samhsa.gov/mental-health');
