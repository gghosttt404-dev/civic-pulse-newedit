import { createServerFn } from "@tanstack/react-start";

export interface GovtProject {
  id: string;
  name: string;
  state: string;
  district: string;
  sanctioned_amount: number;
  fund_released: number;
  completion_pct: number;
  ghost_risk: boolean;
  status: "ON_TRACK" | "DELAYED" | "GHOST_RISK";
  lat?: number;
  lng?: number;
}

const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Andhra Pradesh": { lat: 15.9129, lng: 79.7400 },
  "Arunachal Pradesh": { lat: 28.2180, lng: 94.7278 },
  "Assam": { lat: 26.2006, lng: 92.9376 },
  "Bihar": { lat: 25.0961, lng: 85.3131 },
  "Chhattisgarh": { lat: 21.2787, lng: 81.8661 },
  "Goa": { lat: 15.2993, lng: 74.1240 },
  "Gujarat": { lat: 22.2587, lng: 71.1924 },
  "Haryana": { lat: 29.0588, lng: 76.0856 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
  "Jharkhand": { lat: 23.6102, lng: 85.2799 },
  "Karnataka": { lat: 15.3173, lng: 75.7139 },
  "Kerala": { lat: 10.8505, lng: 76.2711 },
  "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
  "Maharashtra": { lat: 19.7515, lng: 75.7139 },
  "Manipur": { lat: 24.6637, lng: 93.9063 },
  "Meghalaya": { lat: 25.4670, lng: 91.3662 },
  "Mizoram": { lat: 23.1645, lng: 92.9376 },
  "Nagaland": { lat: 26.1584, lng: 94.5624 },
  "Odisha": { lat: 20.9517, lng: 85.0985 },
  "Punjab": { lat: 31.1471, lng: 75.3412 },
  "Rajasthan": { lat: 27.0238, lng: 74.2179 },
  "Sikkim": { lat: 27.5330, lng: 88.5122 },
  "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
  "Telangana": { lat: 18.1124, lng: 79.0193 },
  "Tripura": { lat: 23.9408, lng: 91.9882 },
  "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
  "Uttarakhand": { lat: 30.0668, lng: 79.0193 },
  "West Bengal": { lat: 22.9868, lng: 87.8550 },
  "Andaman And Nicobar": { lat: 11.7401, lng: 92.6586 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794 },
  "Dadra And Nagar Haveli": { lat: 20.1809, lng: 73.0169 },
  "Daman And Diu": { lat: 20.4283, lng: 72.8397 },
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Jammu And Kashmir": { lat: 33.7782, lng: 76.5762 },
  "Ladakh": { lat: 34.1526, lng: 77.5771 },
  "Lakshadweep": { lat: 10.5667, lng: 72.6417 },
  "Puducherry": { lat: 11.9416, lng: 79.8083 },
};

const FALLBACK_PROJECTS: GovtProject[] = [
  {
    id: "fallback-1",
    name: "Construction of Bridge over River Kosi",
    state: "Bihar",
    district: "Saharasa",
    sanctioned_amount: 450.5,
    fund_released: 410.2,
    completion_pct: 35,
    ghost_risk: true,
    status: "GHOST_RISK",
    lat: 25.8835,
    lng: 86.6006
  },
  {
    id: "fallback-2",
    name: "Rural Road Link - Block II to NH-31",
    state: "West Bengal",
    district: "Malda",
    sanctioned_amount: 120.8,
    fund_released: 115.0,
    completion_pct: 42,
    ghost_risk: true,
    status: "GHOST_RISK",
    lat: 25.0108,
    lng: 88.1411
  },
  {
    id: "fallback-3",
    name: "Smart School Building Phase I",
    state: "Karnataka",
    district: "Mysuru",
    sanctioned_amount: 85.0,
    fund_released: 40.0,
    completion_pct: 45,
    ghost_risk: false,
    status: "ON_TRACK",
    lat: 12.2958,
    lng: 76.6394
  },
  {
    id: "fallback-4",
    name: "Primary Health Center Renovation",
    state: "Rajasthan",
    district: "Udaipur",
    sanctioned_amount: 210.0,
    fund_released: 180.0,
    completion_pct: 65,
    ghost_risk: false,
    status: "DELAYED",
    lat: 24.5854,
    lng: 73.7125
  },
  {
    id: "fallback-5",
    name: "Rural Electrification Project",
    state: "Uttar Pradesh",
    district: "Varanasi",
    sanctioned_amount: 320.0,
    fund_released: 290.0,
    completion_pct: 20,
    ghost_risk: true,
    status: "GHOST_RISK",
    lat: 25.3176,
    lng: 82.9739
  }
];

export const fetchGovtProjects = createServerFn("GET", async () => {
  const apiKey = process.env.GOVT_API_KEY;
  const resourceId = "d4361151-6d41-43c7-98cd-9a6cd90b5ca4";
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=50`;

  try {
    if (!apiKey || apiKey === "YOUR_API_KEY") {
      console.warn("Govt API Key missing, using fallback data.");
      return FALLBACK_PROJECTS;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Govt API responded with error, using fallback.");
      return FALLBACK_PROJECTS;
    }

    const data = await response.json();
    
    if (!data || !data.records || !Array.isArray(data.records) || data.records.length === 0) {
      console.warn("Invalid or empty govt data format, using fallback.");
      return FALLBACK_PROJECTS;
    }

    return data.records.map((r: any, index: number) => {
      const sanctioned = parseFloat(r.COST_OF_WORKS_SANCTIONED_LAKHS) || 0;
      const released = parseFloat(r.EXPENDITURE_OCCURED_LAKHS) || 0;
      const sanctionedLength = parseFloat(r.LENGTH_OF_ROAD_WORK_SANCTIONED_KM) || 1;
      const completedLength = parseFloat(r.LENGTH_OF_ROAD_WORK_COMPLETED_KM) || 0;
      
      const fundReleasedPct = sanctioned > 0 ? (released / sanctioned) * 100 : 0;
      const completionPct = (completedLength / sanctionedLength) * 100;
      
      const isGhostRisk = fundReleasedPct > 80 && completionPct < 50;
      const isDelayed = completionPct < 80 && fundReleasedPct > 50;

      const stateCoords = STATE_COORDINATES[r.STATE_NAME] || { lat: 20.5937, lng: 78.9629 };
      const lat = stateCoords.lat + (Math.random() - 0.5) * 2;
      const lng = stateCoords.lng + (Math.random() - 0.5) * 2;

      return {
        id: `govt-${index}`,
        name: `${r.PMGSY_SCHEME} - ${r.DISTRICT_NAME}`,
        state: r.STATE_NAME,
        district: r.DISTRICT_NAME,
        sanctioned_amount: sanctioned,
        fund_released: released,
        completion_pct: Math.min(100, Math.round(completionPct)),
        ghost_risk: isGhostRisk,
        status: isGhostRisk ? "GHOST_RISK" : (isDelayed ? "DELAYED" : "ON_TRACK"),
        lat,
        lng
      } as GovtProject;
    });
  } catch (error) {
    console.error("Error fetching govt projects, returning fallbacks:", error);
    return FALLBACK_PROJECTS;
  }
});
