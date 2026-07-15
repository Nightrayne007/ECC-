# Scope & Intelligence Background — South Pacific

This document records the open-source reporting that shaped KAILA's **geographic
scope**, **transit-corridor overlay**, and **drift-model assumptions**. It is a
briefing digest, not a primary source — follow the links and corroborate.

> All figures and routes below are drawn from public journalism and institutional
> reporting. Nothing here is classified or non-public.

---

## 1. Operating area

KAILA covers the **Melanesia-to-Polynesia belt** and its approaches — roughly
**150°E → 135°W, 5°S → 40°S** — because the trafficking problem is a *basin-scale*
flow, not a single-EEZ problem. Nodes rendered on the map:

- **Melanesia:** Papua New Guinea, Solomon Islands, Vanuatu, New Caledonia
- **Central convergence:** Fiji (Suva, Lau Group, Kadavu), Tuvalu, Rotuma
- **Polynesia:** Wallis & Futuna, Samoa, Tonga, Niue, Cook Islands, French Polynesia (Tahiti, Marquesas)
- **Destination markets:** Australia, New Zealand
- **Recorded case marker:** 2023 floating-transit-point seizure, NW of New Zealand

---

## 2. The two macro corridors

Reporting consistently describes **two distinct flows**, both drawn on the map:

### Eastern cocaine route
From **South America** (and the US), across the island chains of **Polynesia**,
converging on **Tonga, Fiji, and sometimes Samoa**, ultimately bound for the
high-value **Australian and New Zealand** markets. Cocaine dominates.

### Western methamphetamine route
From **Southeast Asian** labs, flowing down through **Melanesia** (Palau, Papua
New Guinea, Solomons, Vanuatu). Methamphetamine dominates.

**Fiji and PNG are named as key convergence nodes.** The region's isolation —
once a barrier — now offers lightly patrolled waters ideal for **ship-to-ship
transfers** and **sea drops**.

---

## 3. The drop-and-retrieve method (why drift modelling matters)

- Narcotics are packed in **waterproof bales**, lashed together with **rope or
  fishing netting**, and floated on **solar-powered GPS buoys**.
- Bales are left at a **"floating transit point"** for a later vessel to collect
  — the traffickers need not stay on scene.
- When **ropes break or a pickup fails**, bales drift on ocean currents and wind
  and **wash ashore** on reefs, beaches, and fishing grounds.

This is precisely the situation KAILA's **reverse-drift** module addresses:
given a wash-up point and date, estimate the upstream origin/drop zone; given a
suspected drop, **predict landfall** to warn communities.

---

## 4. Documented incidents that anchor the model

| Date | Location | Detail |
|------|----------|--------|
| **Feb 2023** | ~NW of New Zealand (near Cook Is. approaches) | **81 bales, ~3.2 t cocaine**, lashed in fishing nets on **yellow buoys** at a floating transit point; destined for Australia; valued ~NZ$500M / US$318M (Operation Hydros, NZ Police/Customs/Defence). |
| **2023-2026** | Marquesas (Fr. Poly.), Marshall Is., Tonga, Samoa, PNG, Fiji | Cocaine found on beaches and in boats across islands **thousands of miles apart**. |
| **Jun 2026** | Fiji — Lau Group, Muni/Kamea, Kadavu | **60+ packages** of white powder washed ashore/recovered; **27 in the Lau Islands**; a Kadavu package **tested positive for cocaine**. |
| **Since Jan 2026** | Pacific-wide | ~**17 tonnes** of narcotics seized regionally, up sharply on 2025. |

These cases set the map's hotspot markers (Lau, Kadavu, Marquesas) and the
2023-seizure reference point, and they justify the **westward drift** default:
eastern drops ride the South Equatorial Current toward Fiji/Melanesia.

---

## 4b. The yacht vector

Reporting on the Pacific corridor repeatedly features **sailing yachts** as
carriers — small craft crossing from South America that blend into the
seasonal cruising fleet (the "Coconut Milk Run", May–October, whose route is
essentially the same track as the eastern cocaine corridor). Operationally
relevant behaviours KAILA's Yacht Watch module encodes as rules:

- **Mid-ocean rendezvous** — a yacht matching drift with a larger vessel in
  open water (transfer at sea).
- **Dark arrival** — Class B AIS ceasing on approach to an island group.
- **Clearance mismatch** — anchoring in remote qoliqoli/atolls without ever
  appearing in a port-of-entry clearance record.

Most suspect yachts transmit no AIS at all, which is why the module pairs the
automated rules with a **community watchlist** built from what marinas,
fishermen and villagers actually see.

## 5. Criminal actors (as reported)

Latin American cartels, Asian syndicates and Triads, Australian/NZ outlaw
motorcycle gangs, and US street gangs are all named as exploiting the Pacific's
position. This breadth is why an **open, community-fed early-warning layer** —
rather than any single agency console — has value: the coastline is the sensor
network.

---

## 6. Sources

- UNODC — *Transnational Organized Crime in the Pacific: Expansion, Challenges and Impact* (Oct 2024): https://www.unodc.org/roseap/en/2024/10/transnational-organized-crime-in-the-pacific_-expansion--challenges-and-impact/story.html
- UNODC — *World Drug Report 2025 (Maps)*: https://www.unodc.org/unodc/en/data-and-analysis/world-drug-report-2025-maps.html
- Lowy Institute — *Drug trafficking in the Pacific Islands: the impact of transnational crime*: https://www.lowyinstitute.org/publications/drug-trafficking-pacific-islands-impact-transnational-crime
- New Lines Magazine — *Tracking the Pacific Drug Highway*: https://newlinesmag.com/reportage/tracking-the-pacific-drug-highway/
- VICE — *A South Pacific Drug Highway…*: https://www.vice.com/en/article/south-pacific-drug-cocaine-methamphetamine-trafficking-smuggling-highway-causing-big-problems-island-communities-fiji-tonga-vanuatu-new-caledonia/
- CNN — *Huge haul of cocaine floating at sea seized by New Zealand* (Feb 2023): https://www.cnn.com/2023/02/09/asia/new-zealand-cocaine-sea-scli-intl/index.html
- NBC News — *New Zealand police find 3.5 tons of cocaine in Pacific Ocean*: https://www.nbcnews.com/news/world/new-zealand-police-find-35-tons-cocaine-pacific-ocean-rcna69654
- TASS — *More than 60 packages, suspected to contain cocaine, discovered along Fiji coastline* (2026): https://tass.com/world/2149677

*Retrieved July 2026. Reporting evolves — treat specific tonnages and dates as of
their publication and re-verify before operational use.*
