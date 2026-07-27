import { describe, expect, it } from "vitest";
import { buildComparisonSnapshots, calculateDeploymentCost, formatCurrency, formatDuration } from "./cost-calculator";

describe("calculateDeploymentCost", () => {
  it("multiplies each unit count by its hourly rate and the deployment duration", () => {
    const cost = calculateDeploymentCost({
      officerCount: 2,
      commanderCount: 1,
      vehicleCount: 2,
      helicopterCount: 0,
      motorcycleCount: 0,
      durationMinutes: 120,
      costPerOfficerPerHour: 60,
      costPerCommanderPerHour: 90,
      costPerVehiclePerHour: 30,
      costPerHelicopterPerHour: 2000,
      costPerMotorcyclePerHour: 40,
    });

    // 2 hrs * (2*60 + 1*90 + 2*30) = 2 * 270 = 540
    expect(cost).toBe(540);
  });

  it("returns 0 when duration is 0", () => {
    const cost = calculateDeploymentCost({
      officerCount: 5,
      commanderCount: 5,
      vehicleCount: 5,
      helicopterCount: 5,
      motorcycleCount: 5,
      durationMinutes: 0,
      costPerOfficerPerHour: 60,
      costPerCommanderPerHour: 90,
      costPerVehiclePerHour: 30,
      costPerHelicopterPerHour: 2000,
      costPerMotorcyclePerHour: 40,
    });

    expect(cost).toBe(0);
  });

  it("clamps negative unit counts to 0 instead of producing a negative cost", () => {
    const cost = calculateDeploymentCost({
      officerCount: -10,
      commanderCount: 0,
      vehicleCount: 0,
      helicopterCount: 0,
      motorcycleCount: 0,
      durationMinutes: 60,
      costPerOfficerPerHour: 60,
      costPerCommanderPerHour: 90,
      costPerVehiclePerHour: 30,
      costPerHelicopterPerHour: 2000,
      costPerMotorcyclePerHour: 40,
    });

    expect(cost).toBe(0);
  });

  it("clamps negative duration to 0", () => {
    const cost = calculateDeploymentCost({
      officerCount: 3,
      commanderCount: 0,
      vehicleCount: 0,
      helicopterCount: 0,
      motorcycleCount: 0,
      durationMinutes: -60,
      costPerOfficerPerHour: 60,
      costPerCommanderPerHour: 0,
      costPerVehiclePerHour: 0,
      costPerHelicopterPerHour: 0,
      costPerMotorcyclePerHour: 0,
    });

    expect(cost).toBe(0);
  });
});

describe("buildComparisonSnapshots", () => {
  const baseComparison = {
    id: 1,
    label: "month of supportive housing",
    description: "for a person experiencing homelessness",
    icon: "🏠",
    cost_per_unit: 1200,
    unit_label: "month",
    plural_label: "months",
    source_name: "NLIHC",
    source_url: "https://example.com",
  };

  it("floors the equivalent count for each comparison", () => {
    const [snapshot] = buildComparisonSnapshots(3000, [baseComparison]);
    expect(snapshot.count_equivalent).toBe(2);
    expect(snapshot.cost_per_unit_used).toBe(1200);
  });

  it("marks city-specific overrides", () => {
    const [snapshot] = buildComparisonSnapshots(1200, [{ ...baseComparison, was_city_specific: 1 }]);
    expect(snapshot.was_city_specific).toBe(1);
  });

  it("excludes comparisons with a non-positive cost_per_unit instead of dividing by zero", () => {
    const snapshots = buildComparisonSnapshots(1000, [
      { ...baseComparison, cost_per_unit: 0 },
      { ...baseComparison, id: 2, cost_per_unit: -50 },
      baseComparison,
    ]);

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].comparison_id).toBe(1);
  });
});

describe("formatCurrency", () => {
  it("formats whole-dollar USD amounts with no decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });
});

describe("formatDuration", () => {
  it("formats minutes under an hour", () => {
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(125)).toBe("2 hrs 5 min");
  });
});
