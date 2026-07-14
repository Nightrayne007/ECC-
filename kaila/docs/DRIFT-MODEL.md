# The Drift Model

KAILA's drift module estimates where a floating package **came from**
(reverse-drift) or **will end up** (forward-drift). It is a **Lagrangian
particle ensemble** — the standard approach for search-and-rescue and marine
debris drift.

---

## What it does

Given an origin point, a mode, a time window, and an ensemble size, KAILA
releases N particles near the point and integrates each one step-by-step through
a velocity field:

```
position(t + Δt) = position(t) ± ( U_current + U_windage + U_diffusion ) · Δt
```

- **Reverse** mode integrates **backward** (the `±` is `−`): particles trace
  upstream to a probable **origin / drop zone**.
- **Forward** mode integrates forward: particles spread to a probable
  **landfall / wash-up zone**.

The spread of the particle cloud is the **uncertainty** — reported as a 1σ
radius in kilometres. The centroid is the best single estimate.

---

## The three forces

1. **Surface current** `currentAt(lon,lat)` — a parametric approximation of the
   **westward South Equatorial Current** that dominates the tropical South
   Pacific, plus mesoscale eddy structure so trajectories are not straight
   lines. This is why eastern (Polynesian) drops trend toward Fiji/Melanesia.

2. **Windage (leeway)** — floating bales are pushed by wind at ~**3%** of wind
   speed. KAILA applies a constant **SE trade-wind** leeway (toward the NW).
   Leeway acts in the same physical direction regardless of integration sign.

3. **Turbulent diffusion** — a random perturbation each step, representing
   sub-grid ocean turbulence. It is what turns a single track into a realistic
   probability *cloud*.

---

## Assumptions & limits (read this)

- The current field is **climatological, not live**. Real currents vary day to
  day; eddies and the position of the SEC shift. Treat outputs as **indicative**
  — good for *narrowing a search area*, not for pinpoint tasking.
- Leeway is a **single constant**. Real leeway depends on how much of the bale
  sits above water and its shape; well-submerged bales drift almost purely with
  the current.
- No coastline interaction / beaching logic — a forward particle that reaches
  land is not "stopped"; interpret landfall as *the coast the cloud reaches*.
- Equirectangular projection with a fixed reference latitude introduces minor
  distortion at the extremes of the basin.

---

## Upgrading to operational accuracy

1. **Real currents.** Replace `currentAt` with bilinear interpolation over a
   Copernicus Marine / HYCOM `uo`/`vo` grid for your window and date. This is the
   single biggest accuracy gain.
2. **Add Stokes drift** (wave-driven transport) from a wave model (e.g.
   Copernicus `VHM0`, wave direction/period) for surface objects.
3. **Time-varying fields.** Step particles through **hourly** current/wind
   frames rather than a static field, especially for windows beyond a few days.
4. **Beaching probability.** Add a coastline mask so forward particles that hit
   land are recorded as wash-up events, producing a proper landfall likelihood
   per beach.
5. **Validation.** Back-test against documented cases (e.g. the 2023 NW-of-NZ
   floating transit point, 2026 Fiji wash-ups in [`SCOPE.md`](SCOPE.md)): seed a
   known wash-up and check the reverse-drift origin against the reported drop
   geography.

Established open-source engines that do all of the above — consider them for a
production build:

- **OpenDrift** (Python) — https://opendrift.github.io
- **OceanParcels** (Python) — https://oceanparcels.org

KAILA's built-in model is a lightweight, offline, dependency-free stand-in so a
field user with no connection still gets a defensible first estimate.
