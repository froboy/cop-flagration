export type DeploymentCostInput = {
  officerCount: number;
  commanderCount: number;
  vehicleCount: number;
  helicopterCount: number;
  motorcycleCount: number;
  durationMinutes: number;
  costPerOfficerPerHour: number;
  costPerCommanderPerHour: number;
  costPerVehiclePerHour: number;
  costPerHelicopterPerHour: number;
  costPerMotorcyclePerHour: number;
};

export type ComparisonInput = {
  id: number;
  label: string;
  description: string;
  icon: string | null;
  cost_per_unit: number;
  unit_label: string;
  plural_label: string | null;
  source_name: string | null;
  source_url: string | null;
  was_city_specific?: number;
};

function clampCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculateDeploymentCost(params: DeploymentCostInput) {
  const hours = Math.max(params.durationMinutes, 0) / 60;
  return (
    clampCount(params.officerCount) * params.costPerOfficerPerHour * hours +
    clampCount(params.commanderCount) * params.costPerCommanderPerHour * hours +
    clampCount(params.vehicleCount) * params.costPerVehiclePerHour * hours +
    clampCount(params.helicopterCount) * params.costPerHelicopterPerHour * hours +
    clampCount(params.motorcycleCount) * params.costPerMotorcyclePerHour * hours
  );
}

export function buildComparisonSnapshots(totalCost: number, comparisons: ComparisonInput[]) {
  return comparisons
    .filter((comparison) => comparison.cost_per_unit > 0)
    .map((comparison) => ({
      comparison_id: comparison.id,
      label: comparison.label,
      icon: comparison.icon,
      cost_per_unit_used: comparison.cost_per_unit,
      count_equivalent: Math.floor(totalCost / comparison.cost_per_unit),
      source_name: comparison.source_name,
      source_url: comparison.source_url,
      was_city_specific: comparison.was_city_specific ? 1 : 0,
    }));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} min`;
  return `${hrs} hrs ${mins} min`;
}
