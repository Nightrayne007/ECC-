# KAILA — Open Ocean Watch

> *Kaila* — a call raised across the water. **See something. Say something.**
> Community eyes on the water + open technology watching the ocean.

An **open-source, community-first** maritime domain-awareness console for the
**South Pacific** — the Melanesia-to-Polynesia belt that transnational networks
now use as a drug highway. KAILA fuses **community sighting reports**, **vessel
tracking (AIS)**, **ocean-drift modelling**, **transit-corridor intelligence**,
**ADS-B air correlation**, and **satellite tasking** into one picture — to help
trace where sea drops come from and predict where floating packages will wash
ashore.

It is the awareness + analysis layer behind the campaign message:

> *Seen a package, bale, or strange floating buoy near your island? **Do not
> touch it.** Note the location. Photograph from a safe distance. Report it.*

<br>

## How KAILA relates to — and differs from — other platforms

KAILA shares core ideas with agency-facing maritime-intelligence products in the
region (AIS tracking, dark-vessel detection, reverse-drift modelling). It is a
**separate, independently built platform** with a deliberately different stance:

| | Agency intelligence products | **KAILA — Open Ocean Watch** |
|---|---|---|
| **Primary user** | National enforcement / customs / navy | **Coastal communities first**, feeding authorities |
| **Heart of the system** | Live AIS + analyst briefs | **The community sighting report** |
| **Access** | Closed, licensed, priced per agency | **Open-source, free, offline-capable** |
| **Emphasis** | Interdiction & enforcement picture | **Early warning** — predict landfall, warn villages *before* packages arrive |
| **Geography** | Often single-EEZ | **Whole South Pacific belt** and its transit corridors |
| **Data** | Bespoke / proprietary feeds | **Open data + open APIs** anyone can wire in |

KAILA is built to put the tool in the hands of the people on the reef — and to
hand clean, geolocated intelligence *up* to the responsible authorities, not to
replace them.

<br>

## The problem, at basin scale

The Pacific has become a transshipment hub for organized crime. Open-source
reporting (UNODC, 2024; multiple 2023-2026 seizures) describes **two macro
corridors**, both represented on KAILA's map:

- **Eastern cocaine route** — from South America, across Polynesia (French
  Polynesia, Cook Islands), converging on **Tonga, Fiji and Samoa**, bound for
  **Australia and New Zealand**.
- **Western methamphetamine route** — from Southeast Asian labs down through
  **Melanesia** (PNG, Solomon Islands, Vanuatu).

Bales are wrapped waterproof, lashed with rope/netting, floated on **solar GPS
buoys**, and left at "floating transit points" for later pickup. When ropes
break or pickups fail, they drift and wash ashore. See
[`docs/SCOPE.md`](docs/SCOPE.md) for the sourced background that shaped the model
and geography.

> The physics aligns with the geography: the **westward South Equatorial
> Current** naturally carries eastern drops toward Fiji and Melanesia — which is
> exactly where the wash-ups are reported. KAILA's drift model exploits this.

<br>

## Run it

A **single self-contained file** — no build, no server, no internet needed for
the core.

```
Open kaila/app.html in any modern browser.
```

Offline-capable: the map, the drift model, sighting reports (saved to your
browser), and the intelligence brief all run with no connection. Live feeds
(AIS, ADS-B, satellite) are **opt-in** — see [`docs/DATA-SOURCES.md`](docs/DATA-SOURCES.md).

<br>

## Modules

| Module | What it does |
|--------|--------------|
| **Overview** | Basin picture, safety guidance, live alert stream, key counts. |
| **Vessel Tracking** | Contact list + detail. Behavioural flags: **dark vessel** (AIS dropout), **loitering**, **impossible position jump** (AIS spoofing). |
| **Drift Analysis** | **Reverse-drift** — from a wash-up point, estimate the origin/drop zone. **Forward-drift** — from a drop point, predict landfall. Lagrangian particle ensemble. |
| **Sighting Reports** | Community intake. Pin a location, record type/time/notes, export JSON/CSV, and run drift straight from a report. |
| **Air Correlation** | ADS-B overlay — light aircraft over open-water drop zones can indicate aerial resupply or spotting. |
| **Satellite Tasking** | Build a Sentinel-1 (SAR) / Sentinel-2 (optical) request + Copernicus deep link for any target box. |
| **Intel Brief** | Auto-compiled brief for partner agencies, exportable as Markdown. |

<br>

## Built on open technology

No proprietary or classified feeds required. See [`docs/DATA-SOURCES.md`](docs/DATA-SOURCES.md):

- **AIS vessel tracking** — [AISStream.io](https://aisstream.io) (free WebSocket) · [Global Fishing Watch](https://globalfishingwatch.org/our-apis/)
- **Ocean currents / drift** — [Copernicus Marine](https://marine.copernicus.eu/) · [HYCOM](https://www.hycom.org/) · NOAA OSCAR
- **Satellite imagery** — [Copernicus Data Space](https://dataspace.copernicus.eu/) / Sentinel Hub (S-1 SAR & S-2 optical)
- **ADS-B flight data** — [OpenSky Network](https://opensky-network.org/)
- **Coastline / EEZ / boundaries** — [Natural Earth](https://www.naturalearthdata.com/) · [Marine Regions](https://www.marineregions.org/)

<br>

## Read before relying on it

- **Prototype.** Feeds are **simulated** until you configure live keys.
- The drift model uses a **climatological current approximation**, not a live
  ocean model. Estimates are **indicative** — meant to *narrow a search*, not
  replace operational modelling ([`docs/DRIFT-MODEL.md`](docs/DRIFT-MODEL.md)).
- Coastline, corridors, node positions and the 2023-seizure marker are
  **schematic** for orientation. Swap in authoritative geometry for production.
- **Not for sole operational reliance.** Corroborate with the responsible
  authorities.

<br>

## Safety

If you find a package, bale, or buoy: **Do not touch it. Note the location.
Photograph from a safe distance. Report it.** Full guidance in
[`docs/SAFETY.md`](docs/SAFETY.md). Border security is everyone's responsibility.

<br>

## Project layout

```
kaila/
├── app.html              Self-contained console (open this)
├── README.md             This file
└── docs/
    ├── SCOPE.md          South Pacific scope + sourced trafficking background
    ├── DATA-SOURCES.md   Connecting live AIS / currents / satellite / ADS-B
    ├── DRIFT-MODEL.md    The drift model, assumptions, and how to upgrade it
    └── SAFETY.md         Community guidance for handling sightings
```
