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

## 3. Satellite imagery

The **Satellite Tasking** module builds a bounding box, a **Copernicus Browser**
deep link, and a **Process API** request body for any target.

- Copernicus Data Space (free): https://dataspace.copernicus.eu
- Add an OAuth token to the Process API body to pull imagery programmatically.
- **Sentinel-1 (SAR)** sees through cloud — preferred for wet-season reefs.
- **Sentinel-2 (optical, 10 m)** for clear-sky visual confirmation.

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
