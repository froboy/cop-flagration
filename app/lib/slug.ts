import { nanoid } from "nanoid";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export function generateSlug(cityName: string, date: string, location: string) {
  return `${slugify(cityName || "city")}-${date}-${slugify(location || "location")}-${nanoid(6)}`;
}
