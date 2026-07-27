import { calculateDeploymentCost, formatCurrency } from "~/lib/cost-calculator";

type CostEstimatorProps = {
  durationMinutes: number;
  rates: {
    officer: number;
    commander: number;
    vehicle: number;
    helicopter: number;
    motorcycle: number;
  };
  counts: {
    officer: number;
    commander: number;
    vehicle: number;
    helicopter: number;
    motorcycle: number;
  };
};

export function CostEstimator({ durationMinutes, rates, counts }: CostEstimatorProps) {
  const total = calculateDeploymentCost({
    durationMinutes,
    officerCount: counts.officer,
    commanderCount: counts.commander,
    vehicleCount: counts.vehicle,
    helicopterCount: counts.helicopter,
    motorcycleCount: counts.motorcycle,
    costPerOfficerPerHour: rates.officer,
    costPerCommanderPerHour: rates.commander,
    costPerVehiclePerHour: rates.vehicle,
    costPerHelicopterPerHour: rates.helicopter,
    costPerMotorcyclePerHour: rates.motorcycle,
  });

  return (
    <section className="rounded-2xl border-2 border-zinc-900 bg-zinc-900 p-5 text-white">
      <p className="text-sm uppercase tracking-wide text-zinc-300">Live estimate</p>
      <p className="mt-2 text-4xl font-black">{formatCurrency(total)}</p>
      <p className="text-sm text-zinc-300">Estimated cost to the community</p>
    </section>
  );
}
