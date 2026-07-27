import { useMemo } from "react";

type City = {
  id: number;
  name: string;
  state: string;
};

type CitySelectorProps = {
  cities: City[];
  selectedCityId: string;
  customCity: string;
  onCityChange: (value: string) => void;
  onCustomCityChange: (value: string) => void;
};

export function CitySelector({
  cities,
  selectedCityId,
  customCity,
  onCityChange,
  onCustomCityChange,
}: CitySelectorProps) {
  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
    [cities],
  );

  const isOther = selectedCityId === "other";

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-semibold">City</span>
        <select
          name="cityId"
          value={selectedCityId}
          onChange={(event) => onCityChange(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        >
          <option value="">Select a city</option>
          {sortedCities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.state}
            </option>
          ))}
          <option value="other">Other / My city isn't listed</option>
        </select>
      </label>

      {isOther ? (
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Your city</span>
          <input
            type="text"
            name="customCity"
            value={customCity}
            onChange={(event) => onCustomCityChange(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Enter your city"
            required
          />
          <span className="block text-xs text-zinc-600 dark:text-zinc-400">
            National average costs will be used for unlisted cities.
          </span>
        </label>
      ) : (
        <input type="hidden" name="customCity" value="" />
      )}
    </div>
  );
}
