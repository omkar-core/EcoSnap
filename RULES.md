# EcoSnap — Game Rules

## 1. Ranks (based on total XP)

| Points | Rank |
|--------|------|
| > 50,000 | City Champion |
| > 15,000 | Zone Lord |
| > 5,000 | Ranger |
| > 2,000 | Guardian |
| > 500 | Sprout |
| 0–500 | Seedling |

## 2. Scoring

- **Base XP** from AI analysis (Indian MSW Rules 2016):
  - E-Waste / Hazardous: 100–200
  - Plastics / Metals: 20–50
  - Paper / Organic: 10–20
- **Activity multiplier:** Walking `1.0`, Running `1.5`, Cycling `1.2`.
- **Cleanup claim:** base points are doubled (cleanup bonus = base) + `+15 Green Credits` + waste weight added.
- **Scout claim:** base points only (report only).
- **Upcycle bonus:** `+50 XP` once per scan when a recipe is completed.
- **Anti-spam:** scans throttled to one per 2 seconds.

## 3. Zone / Sector Health

Zones are keyed by `lat.toFixed(3)_lng.toFixed(3)`.

| Health | Status |
|--------|--------|
| 86–100 | Pristine |
| 61–85 | Clean |
| 41–60 | Moderate |
| 21–40 | Dirty |
| 0–20 | Critical |

- Cleanup in zone: `+15` health.
- Scout (report only) in zone: `−2` health.
- Trees in zone: `+8` each; reduce decay; forest coverage `20`/tree (cap 100); plantable spots = `5 − trees`.
- Health decays over time; higher decay when dirty, near-zero when pristine; negligence (no interaction >24h → −5, >72h → −20) applies.
- Zone ownership is claimed by the top-performing user when health > 80, lost when < 40.

## 4. Trees

**Species & CO2 rates:** Neem 22, Banyan 45, Peepal 35, Mango 28, Eucalyptus 25, Bamboo 30 (kg CO2/day multiplier base 20).

**Costs (Green Credits):**
- `self`: 50 Cr, `community`: 100 Cr (10% off ≥5, 15% off ≥10), `sponsored`: 0 Cr.
- Sponsored unlock requires **30-day streak OR 1000 XP**.

**Growth stages:**

| Stage | Duration | CO2/day | Icon |
|-------|----------|---------|------|
| Sapling | ≥ 90 days | 0.5 | 🌱 |
| Young | ≥ 365 days | 2.0 | 🌿 |
| Growing | ≥ 730 days | 5.0 | 🌳 |
| Mature | beyond | 10.0 | 🌲 |

**Health & maintenance:**
- Self trees decay when neglected (water >7 days: −2/day; reaches 0 = deceased at 30 days).
- Community/sponsored trees auto-maintain at 100.
- Water: 12h cooldown, `+10` health, `+50` XP, `+10` Cr.
- Fertilize: 7d cooldown, `+15` health, `+100` XP, `+25` Cr.

**Planting XP:** self `+500` (+50 Cr rebate), community `+200 × qty`, sponsored `+300 × qty`.

## 5. Rewards & Credits

- Green Credits earned: cleanup `+15`, water `+10`, fertilize `+25`, self-plant rebate `+50`. Starting balance: `500`.
- Credits spent on tree planting.

## 6. Badges

| ID | Name | Requirement | Tier |
|----|------|-------------|------|
| FIRST_SCAN | Initiation | Complete first scan | Bronze |
| STREAK_7 | Dedicated Ranger | 7-day scan streak | Bronze |
| E_WASTE_HUNTER | Cyber Sweeper | Scan E-waste | Silver |
| TREE_LORD | Canopy Architect | 10 trees alive 7 days | Gold |

## 7. Leaderboard

MVP uses 5 mock competitors generated around the user's own points (`getLeaderboard()`). No live sync.

## 8. Simulations (decorative, MVP)

- **Live events ticker** (every 8–15s).
- **Hotspots radar** (every 60s, 3 random spots near user).
- **Eco Wave** global progress ticker (target 5000kg).
