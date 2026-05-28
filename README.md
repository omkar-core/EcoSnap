# EcoSnap: Smart Waste Hunt 🌿

**EcoSnap** is a futuristic, AI-powered urban ecology game designed to gamify waste management and neighborhood restoration. By combining computer vision with real-world geolocation, players (Rangers) track waste, earn credits, and plant trees to heal their local sectors.

## 🚀 Key Features

### 📸 AI Waste Analysis
- **Instant Recognition:** Uses **Google Gemini 2.5 Flash** to identify waste types, materials, and recyclability.
- **Gamified Scoring:** Earn XP and Green Credits based on the complexity and impact of the item scanned.
- **Upcycling Engine:** Get creative DIY recipes for specific waste items.

### 🌍 Eco-Sector Map
- **Dynamic Zoning:** The world is divided into sectors. Track the health (Vitality) of your local area.
- **Health Decay & Restoration:** Sectors decay over time if neglected. Clean up waste and plant trees to restore them to "Pristine" status.

### 🌳 Reforestation Protocol
- **3 Planting Modes:**
  1. **Self-Plant:** Physically plant a sapling at a specific GPS location (Requires proximity verification).
  2. **Community:** Donate credits to NGOs for mass plantation.
  3. **Sponsored:** Unlock free trees via corporate sponsors (GreenCorp) by maintaining streaks.
- **Lifecycle Tracking:** Monitor water levels, growth stages (Sapling -> Mature), and Carbon Offsets.

### 🛡️ Ranger Profile
- **Ranking System:** Progress from *Seedling* to *City Champion*.
- **Leaderboards:** Compete with other rangers in your sector.

## 🛠️ Tech Stack

- **Framework:** Angular v21+ (Zoneless, Signals Architecture)
- **AI:** Google GenAI SDK (`gemini-2.5-flash`)
- **Styling:** Tailwind CSS (Utility-first)
- **State Management:** Angular Signals
- **Maps/GPS:** Navigator Geolocation API & Nominatim (OpenStreetMap)

## 🎮 How to Play

1. **Initiate Protocol:** Enter your codename to start.
2. **Scan Waste:** Use the camera to analyze trash. Clean it up to earn bonus credits.
3. **Check Sector:** Visit the Health tab to see your neighborhood's status.
4. **Plant Trees:** Use earned Green Credits to plant virtual or real trees.
5. **Maintain:** Water and fertilize your trees to prevent decay.

---
*Powered by Google Gemini*