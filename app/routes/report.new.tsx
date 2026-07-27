import "leaflet/dist/leaflet.css";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap, LeafletMouseEvent } from "leaflet";
import { CitySelector } from "~/components/CitySelector";
import { CostEstimator } from "~/components/CostEstimator";
import { UnitCounter } from "~/components/UnitCounter";
import { buildComparisonSnapshots, calculateDeploymentCost, formatDuration } from "~/lib/cost-calculator";
import {
  getCities,
  getCityById,
  getComparisons,
  getComparisonsForCity,
  saveComparisonSnapshot,
  saveReport,
} from "~/lib/db";
import { generateSlug } from "~/lib/slug";

type AppContext = { cloudflare: { env: { DB: D1Database } } };

const NATIONAL_AVERAGE_RATES = {
  officer: 63,
  commander: 90,
  vehicle: 33,
  helicopter: 2000,
  motorcycle: 42,
};

const MAX_CUSTOM_CITY_LENGTH = 100;
const MAX_LOCATION_LENGTH = 200;
const MAX_NOTES_LENGTH = 2000;
const MAX_SLUG_ATTEMPTS = 3;

function parseCount(value: FormDataEntryValue | null) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
}

function parseOptionalCoordinate(raw: string, min: number, max: number) {
  if (!raw) return { value: null as number | null, valid: true };
  const num = Number(raw);
  if (!Number.isFinite(num) || num < min || num > max) {
    return { value: null as number | null, valid: false };
  }
  return { value: num, valid: true };
}

function calculateDurationMinutes(startTime: string, endTime: string) {
  if (!startTime || !endTime) return 0;
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start);
}

function formatDateToday() {
  return new Date().toISOString().slice(0, 10);
}

export async function loader({ context }: LoaderFunctionArgs) {
  const db = (context as AppContext).cloudflare.env.DB;
  const cities = await getCities(db);
  return json({ cities, today: formatDateToday(), nationalRates: NATIONAL_AVERAGE_RATES });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const db = (context as AppContext).cloudflare.env.DB;
  const formData = await request.formData();

  const honeypot = String(formData.get("company") || "").trim();
  if (honeypot) {
    return json({ error: "Invalid submission." }, { status: 400 });
  }

  const cityIdValue = String(formData.get("cityId") || "");
  const customCity = String(formData.get("customCity") || "").trim();
  const reportDate = String(formData.get("reportDate") || "");
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const locationDescription = String(formData.get("locationDescription") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const officerCount = parseCount(formData.get("officerCount"));
  const commanderCount = parseCount(formData.get("commanderCount"));
  const vehicleCount = parseCount(formData.get("vehicleCount"));
  const motorcycleCount = parseCount(formData.get("motorcycleCount"));
  const helicopterCount = parseCount(formData.get("helicopterCount"));

  const latitudeRaw = String(formData.get("latitude") || "").trim();
  const longitudeRaw = String(formData.get("longitude") || "").trim();
  const latitudeResult = parseOptionalCoordinate(latitudeRaw, -90, 90);
  const longitudeResult = parseOptionalCoordinate(longitudeRaw, -180, 180);

  const durationMinutes = calculateDurationMinutes(startTime, endTime);

  if (!cityIdValue) {
    return json({ error: "Please select a city." }, { status: 400 });
  }

  if (cityIdValue === "other" && !customCity) {
    return json({ error: "Please enter your city name." }, { status: 400 });
  }

  if (!reportDate || !startTime || !endTime || !locationDescription || durationMinutes === 0) {
    return json({ error: "Please complete the required fields and ensure duration is greater than zero." }, { status: 400 });
  }

  if (
    customCity.length > MAX_CUSTOM_CITY_LENGTH ||
    locationDescription.length > MAX_LOCATION_LENGTH ||
    notes.length > MAX_NOTES_LENGTH
  ) {
    return json({ error: "One of your entries is too long." }, { status: 400 });
  }

  if (!latitudeResult.valid || !longitudeResult.valid) {
    return json({ error: "Latitude/longitude must be valid coordinates." }, { status: 400 });
  }
  const latitude = latitudeResult.value;
  const longitude = longitudeResult.value;

  if (cityIdValue !== "other" && (!Number.isInteger(Number(cityIdValue)) || Number(cityIdValue) <= 0)) {
    return json({ error: "Please select a valid city." }, { status: 400 });
  }

  const cityId = cityIdValue === "other" ? null : Number(cityIdValue);
  const city = cityId ? await getCityById(db, cityId) : null;
  if (cityId && !city) {
    return json({ error: "Please select a valid city." }, { status: 400 });
  }
  const cityName = city?.name ?? customCity;

  const rates = city
    ? {
        officer: city.cost_per_officer_per_hour,
        commander: city.cost_per_commander_per_hour,
        vehicle: city.cost_per_vehicle_per_hour,
        helicopter: city.cost_per_helicopter_per_hour,
        motorcycle: city.cost_per_motorcycle_per_hour,
      }
    : NATIONAL_AVERAGE_RATES;

  const totalCost = calculateDeploymentCost({
    durationMinutes,
    officerCount,
    commanderCount,
    vehicleCount,
    helicopterCount,
    motorcycleCount,
    costPerOfficerPerHour: rates.officer,
    costPerCommanderPerHour: rates.commander,
    costPerVehiclePerHour: rates.vehicle,
    costPerHelicopterPerHour: rates.helicopter,
    costPerMotorcyclePerHour: rates.motorcycle,
  });

  const comparisons = cityId ? await getComparisonsForCity(db, cityId) : await getComparisons(db);
  const snapshots = buildComparisonSnapshots(totalCost, comparisons);

  let slug = generateSlug(cityName, reportDate, locationDescription);
  let attempts = 0;
  while (true) {
    try {
      await saveReport(db, {
        id: slug,
        city_id: cityId,
        custom_city: cityId ? null : customCity,
        report_date: reportDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        location_description: locationDescription,
        latitude,
        longitude,
        officer_count: officerCount,
        commander_count: commanderCount,
        vehicle_count: vehicleCount,
        helicopter_count: helicopterCount,
        motorcycle_count: motorcycleCount,
        estimated_total_cost: totalCost,
        notes: notes || null,
      });
      break;
    } catch (error) {
      attempts += 1;
      const message = error instanceof Error ? error.message : String(error);
      if (attempts >= MAX_SLUG_ATTEMPTS || !message.includes("UNIQUE constraint failed")) {
        throw error;
      }
      slug = generateSlug(cityName, reportDate, locationDescription);
    }
  }

  await saveComparisonSnapshot(db, slug, snapshots);

  return redirect(`/r/${slug}`);
}

export default function NewReportPage() {
  const { cities, today, nationalRates } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [cityId, setCityId] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [reportDate, setReportDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [notes, setNotes] = useState("");

  const [officerCount, setOfficerCount] = useState(0);
  const [commanderCount, setCommanderCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [motorcycleCount, setMotorcycleCount] = useState(0);
  const [helicopterCount, setHelicopterCount] = useState(0);

  const [showMap, setShowMap] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);

  const selectedCity = useMemo(() => cities.find((city) => String(city.id) === cityId), [cities, cityId]);

  const rates = selectedCity
    ? {
        officer: selectedCity.cost_per_officer_per_hour,
        commander: selectedCity.cost_per_commander_per_hour,
        vehicle: selectedCity.cost_per_vehicle_per_hour,
        helicopter: selectedCity.cost_per_helicopter_per_hour,
        motorcycle: selectedCity.cost_per_motorcycle_per_hour,
      }
    : nationalRates;

  const durationMinutes = calculateDurationMinutes(startTime, endTime);

  useEffect(() => {
    if (!showMap || typeof window === "undefined" || !mapRef.current) {
      return;
    }

    let canceled = false;
    let map: LeafletMap | undefined;

    (async () => {
      try {
        const L = await import("leaflet");
        if (canceled || !mapRef.current) return;

        const mapInstance = L.map(mapRef.current).setView([39.8283, -98.5795], 4);
        map = mapInstance;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance);

        mapInstance.on("click", (event: LeafletMouseEvent) => {
          const { lat, lng } = event.latlng;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
          if (markerRef.current) {
            markerRef.current.remove();
          }
          markerRef.current = L.circleMarker([lat, lng], {
            radius: 8,
            color: "#111827",
            weight: 2,
            fillColor: "#111827",
            fillOpacity: 0.65,
          }).addTo(mapInstance);
        });
      } catch {
        setMapError("Unable to load map in this browser. You can still enter coordinates manually.");
      }
    })();

    return () => {
      canceled = true;
      if (map) {
        map.remove();
      }
    };
  }, [showMap]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-black">Document a cop-flagration</h1>
      <p className="mt-2 text-sm text-zinc-700">Document who showed up, for how long, and what it likely cost.</p>

      {actionData?.error ? (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{actionData.error}</p>
      ) : null}

      <Form method="post" className="mt-6 space-y-5">
        <div aria-hidden="true" className="hidden">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <CitySelector
          cities={cities}
          selectedCityId={cityId}
          customCity={customCity}
          onCityChange={setCityId}
          onCustomCityChange={setCustomCity}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold">Date</span>
            <input
              type="date"
              name="reportDate"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold">Location description</span>
            <input
              type="text"
              name="locationDescription"
              value={locationDescription}
              onChange={(event) => setLocationDescription(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              placeholder="Intersection, address, neighborhood"
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold">Start time</span>
            <input
              type="time"
              name="startTime"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold">End time</span>
            <input
              type="time"
              name="endTime"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              required
            />
          </label>
        </div>

        <p className="text-sm font-medium text-zinc-700">Duration: {formatDuration(durationMinutes)}</p>

        <div className="space-y-3">
          <UnitCounter name="officerCount" label="Officers" icon="👮" value={officerCount} onChange={setOfficerCount} />
          <UnitCounter
            name="commanderCount"
            label="Commanders/Supervisors"
            icon="⭐"
            value={commanderCount}
            onChange={setCommanderCount}
          />
          <UnitCounter
            name="vehicleCount"
            label="Patrol Vehicles"
            icon="🚔"
            value={vehicleCount}
            onChange={setVehicleCount}
          />
          <UnitCounter
            name="motorcycleCount"
            label="Motorcycles"
            icon="🏍️"
            value={motorcycleCount}
            onChange={setMotorcycleCount}
          />
          <UnitCounter
            name="helicopterCount"
            label="Helicopters/Aircraft"
            icon="🚁"
            value={helicopterCount}
            onChange={setHelicopterCount}
          />
        </div>

        <CostEstimator
          durationMinutes={durationMinutes}
          rates={rates}
          counts={{
            officer: officerCount,
            commander: commanderCount,
            vehicle: vehicleCount,
            motorcycle: motorcycleCount,
            helicopter: helicopterCount,
          }}
        />

        <section className="rounded-xl border border-zinc-300 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Optional map pin</h2>
            <button
              type="button"
              onClick={() => setShowMap((value) => !value)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium"
            >
              {showMap ? "Hide map" : "Show map"}
            </button>
          </div>
          {showMap ? (
            <>
              <div ref={mapRef} className="mt-3 h-64 rounded-lg border border-zinc-300" />
              <p className="mt-2 text-xs text-zinc-600">Tap/click map to set coordinates.</p>
            </>
          ) : null}
          {mapError ? <p className="mt-2 text-xs text-red-700">{mapError}</p> : null}

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold">Latitude (optional)</span>
              <input
                type="text"
                name="latitude"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
                placeholder="30.2672"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold">Longitude (optional)</span>
              <input
                type="text"
                name="longitude"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
                placeholder="-97.7431"
              />
            </label>
          </div>
        </section>

        <label className="block space-y-1">
          <span className="text-sm font-semibold">Notes (optional)</span>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-base font-black text-white"
        >
          {navigation.state === "submitting" ? "Saving..." : "Save report and get share link"}
        </button>
      </Form>
    </main>
  );
}
