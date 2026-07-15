# Connecting Live Data Sources

KAILA runs fully offline on **simulated feeds**. To make it operational, wire in
the open data sources below. All are free or have free tiers. Nothing here
requires proprietary or classified access.

Because `app.html` is a single self-contained file, the simplest integration
path is: open it as a local file (or serve the folder), open the browser
console, and call the exposed helpers on `window.KAILA`.

---

## 1. AIS vessel tracking

### AISStream.io (free, WebSocket)
Real-time AIS over a WebSocket. A working client is already built in — call it
from the console:

```js
KAILA.connectLiveAIS('YOUR_AISSTREAM_API_KEY');
```

The status chip flips to **AIS LIVE** and live vessels replace the simulated
fleet as position reports arrive.

- Sign up: https://aisstream.io
- Endpoint: `wss://stream.aisstream.io/v0/stream`
- Note: AISStream bounding boxes use `[[lat,lon],[lat,lon]]` in the −180…180
  range. The eastern Pacific crosses the antimeridian, so pass **two boxes**
  (one west of 180°, one east) rather than a single wide box.

### Global Fishing Watch (fishing-vessel focus, apparent fishing effort)
Better for behavioural/loitering analysis of fishing vessels.
- API: https://globalfishingwatch.org/our-apis/

## 1b. Yacht & small-craft tracking

Yachts matter: the seasonal cruising route from the Americas (the "Coconut
Milk Run" — Panama/Galápagos → Marquesas → Tuamotus → Society Is. → Cooks →
Tonga → Fiji, roughly May–October) overlaps the eastern cocaine corridor, and
trafficking yachts hide among hundreds of legitimate cruisers making the same
passage.

- **Class B AIS** — KAILA's live-AIS client already subscribes to
  `StandardClassBPositionReport` alongside Class A. Most cruising yachts
  carry Class B transceivers (lower power, intermittent at range — gaps are
  normal, *sustained* silence inbound to an island group is the anomaly).
- **NoForeignLand** (https://www.noforeignland.com) — the cruising community's
  own voluntary tracker; public boat pages show passages and anchorages.
  Useful for establishing what *normal* looks like in an anchorage.
- **PredictWind tracking** (https://forecast.predictwind.com) — many offshore
  yachts publish public tracking pages while on passage.
- **Rally schedules** — World ARC, Pacific Puddle Jump etc. publish fleet
  lists and ETAs; a "cruiser" arriving far outside rally season and route
  norms is worth a second look.
- **Port-of-entry clearance records** — the strongest signal is negative
  space: a yacht at anchor that never appears in any clearance record. KAILA
  flags yachts anchored >50 km from a designated port of entry; corroborate
  against the national clearance list (customs/immigration).
- **The community watchlist** (in the Yacht Watch module) is for the majority
  case: a suspect yacht transmitting nothing at all. Hull name, sail number,
  colour, tender, crew count, and where it was seen — logged locally,
  exportable with the brief.

---

## 2. Ocean currents (drift model)

The drift model calls `currentAt(lon, lat)` for a surface velocity in m/s. Today
that returns a **climatological approximation**. Replace it with real data:

- **Copernicus Marine Service** — `GLOBAL_ANALYSISFORECAST_PHY_001_024`
  (hourly surface currents `uo`/`vo`). https://marine.copernicus.eu
- **HYCOM** — global ocean forecast, NetCDF/OPeNDAP. https://www.hycom.org
- **NOAA OSCAR** — 5-day surface currents from satellite altimetry.

Pre-fetch a NetCDF/JSON grid for your window and date, then rewrite `currentAt`
to bilinearly interpolate that grid. See [`DRIFT-MODEL.md`](DRIFT-MODEL.md).

---

## 3. Satellite imagery — near-real-time, free, no key

The **Satellite Imagery** module has two tiers: free NRT sources for *search
and situational awareness*, and Sentinel tasking for *high-resolution
confirmation* of a located target.

### Latency ladder

| Source | Refresh / latency | Resolution | Coverage | Auth |
|---|---|---|---|---|
| **NOAA GOES-18** GeoColor | **10 min** | 0.5–2 km | Central/eastern Pacific (137°W) | none |
| **JMA Himawari-9** GeoColor | **10 min** | 0.5–2 km | Western Pacific (140.7°E) | none |
| **NASA VIIRS** (GIBS/Worldview) | **~3 h**, 2×/day | 375 m | Global | none |
| **Sentinel-2** (Copernicus) | ~5-day revisit | 10 m | Global | free account |
| **Sentinel-1 SAR** (Copernicus) | days (orbit-dependent) | ~20 m, sees through cloud | Global | free account |

A 10-minute geostationary feed can't resolve a bale, but it gives cloud cover
and weather over a search area *right now*; VIIRS at 375 m shows ocean-surface
context twice a day; Sentinel confirms a located target at 10 m. Use them in
that order.

### NASA GIBS — the in-map imagery layer

The **NRT imagery** map layer draws VIIRS true-color tiles straight from GIBS
(free, no key, ~3 h latency). Tile template used:

```
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/
  VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{YYYY-MM-DD}/250m/{z}/{row}/{col}.jpg
```

- Works when `app.html` runs with internet access (open the file locally).
  Hosting environments with a strict CSP (e.g. the published artifact) block
  external tiles — the layer shows a notice and the link-out tools still work.
- Swap the layer id for other GIBS products (e.g.
  `MODIS_Terra_CorrectedReflectance_TrueColor`, or VIIRS NOAA-20/21 variants).
- Docs: https://nasa-gibs.github.io/gibs-api-docs/

### Worldview Snapshots — direct still images

One URL returns a georeferenced JPEG of any box — ideal for pasting into a
report or brief (`BBOX` order is `minLat,minLon,maxLat,maxLon`):

```
https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot
  &TIME=2026-07-14&BBOX=-19.4,177.1,-17.4,179.1&CRS=EPSG:4326
  &LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor,Coastlines_15m
  &FORMAT=image/jpeg&WIDTH=1024&HEIGHT=1024
```

### Geostationary — 10-minute refresh

- **GOES-18 (GOES-West)** latest GeoColor full disk:
  `https://cdn.star.nesdis.noaa.gov/GOES18/ABI/FD/GEOCOLOR/1808x1808.jpg`
  (resolution-named files are always the latest frame; directory listing has
  timestamped history). Sector imagery under `.../ABI/SECTOR/`.
- **Himawari-9** (western Pacific): RAMMB SLIDER viewer
  `https://rammb-slider.cira.colostate.edu/?sat=himawari` — animatable,
  10-minute GeoColor full disk.
- **Zoom Earth** combines both interactively: https://zoom.earth

### Sentinel — high-resolution follow-up

The module still builds a bounding box, a **Copernicus Browser** deep link, and
a **Process API** request body for any target.

- Copernicus Data Space (free): https://dataspace.copernicus.eu
- Add an OAuth token to the Process API body to pull imagery programmatically.
- **Sentinel-1 (SAR)** sees through cloud — preferred for wet-season reefs.
- **Sentinel-2 (optical, 10 m)** for clear-sky visual confirmation.

### Bonus: NASA FIRMS

Thermal-anomaly detections (VIIRS/MODIS, ~3 h latency, free key) can flag
vessels burning or flaring at night: https://firms.modaps.eosdis.nasa.gov

---

## 4. ADS-B flight data

The **Air Correlation** module plots sample aircraft. For live data:

- **OpenSky Network** REST API (free for non-commercial): https://opensky-network.org
- Poll `/states/all` over your bounding box and map each state vector to the
  aircraft structure (`call`, `lon`, `lat`, `hdg`, `alt`).

Flag **low-altitude, slow aircraft loitering over open water** near flagged
vessel activity or sighting clusters.

---

## 5. Geometry (coastline, EEZ, boundaries)

Map coastlines, nodes and corridors are **schematic** for orientation. For
production accuracy:

- **Natural Earth** 10m coastline/land polygons: https://www.naturalearthdata.com
- **Marine Regions** EEZ boundaries (e.g. Fiji, Tonga, Vanuatu): https://www.marineregions.org

Load these as GeoJSON and render them in place of the hand-built `ISLANDS` and
`NODES` arrays.

---

## Security & privacy notes

- Community sighting reports are stored **only in the reporter's browser**
  (`localStorage`) until explicitly exported. No server, no automatic upload.
- Treat any exported report as sensitive: it may contain a reporter's name and a
  precise location. Share only with the responsible authority.
- API keys pasted into the console stay in the page session; never commit keys
  to the repository.
