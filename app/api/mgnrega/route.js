import { NextResponse } from "next/server";

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const API_KEY = "579b464db66ec23bdd0000010a3f9add715c48dc7fa039952b674c44";
const BASE_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const district = searchParams.get("district") || "";
    const finYear = searchParams.get("finYear") || "2024-2025";
    const listDistricts = searchParams.get("listDistricts") === "1";
    const limit = parseInt(searchParams.get("limit") || "1000", 10);

    if (!state) {
      return NextResponse.json({ success: false, message: "state is required" }, { status: 400 });
    }

    const cacheKey = `state=${state}|district=${district}|fin=${finYear}|list=${listDistricts}|limit=${limit}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, cached: true, ...cached });
    }

    const params = new URLSearchParams();
    params.set("api-key", API_KEY);
    params.set("format", "json");
    params.set("limit", String(limit));
    params.set("filters[state_name]", state);
    params.set("filters[fin_year]", finYear);
    if (district) params.set("filters[district_name]", district);

    const url = `${BASE_URL}?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ success: false, message: `Upstream error: ${res.status}`, details: txt }, { status: 502 });
    }

    const json = await res.json();
    const records = Array.isArray(json.records) ? json.records : [];

    if (listDistricts) {
      const districtsSet = new Set();
      records.forEach((r) => {
        if (r.district_name) districtsSet.add(r.district_name);
        else if (r.district) districtsSet.add(r.district);
      });
      const districts = Array.from(districtsSet).sort();
      const payload = { data: records, districts };
      cacheSet(cacheKey, payload);
      return NextResponse.json({ success: true, ...payload });
    }

    const payload = { data: records };
    cacheSet(cacheKey, payload);
    return NextResponse.json({ success: true, ...payload });
  } catch (err) {
    console.error("MGNREGA route error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
