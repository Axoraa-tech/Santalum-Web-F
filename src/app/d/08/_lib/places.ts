import type { LonLat } from "./geo";

/**
 * Where an order travels on the route map. The workshop pin is a placeholder in Karnataka
 * (the catalogue says pieces are carved, rolled and finished there) until the Maison confirms
 * its dispatch address. Delivery cities are looked up by name, then by state.
 */
export const WORKSHOP = { name: "The workshop", region: "Karnataka", at: [77.59, 12.97] as LonLat };

/**
 * Where each wood comes from, as the board and the copy tell it: red from the Seshachalam hills
 * of the Eastern Ghats, white from the forests around Mysuru. Route maps draw this first leg, so
 * a red order starts where the red copy says the wood grows.
 */
export const SOURCES = {
  red: { name: "Seshachalam hills", note: "Red sandalwood grows here", at: [79.15, 13.85] as LonLat },
  white: { name: "Mysuru", note: "White sandalwood comes from here", at: [76.64, 12.3] as LonLat },
} as const;

type Place = { name: string; at: LonLat; aka?: string[] };

const CITIES: Place[] = [
  { name: "Mysuru", at: [76.64, 12.3], aka: ["mysore"] },
  { name: "Bengaluru", at: [77.59, 12.97], aka: ["bangalore"] },
  { name: "Mangaluru", at: [74.86, 12.91], aka: ["mangalore"] },
  { name: "Hubballi", at: [75.12, 15.36], aka: ["hubli", "dharwad"] },
  { name: "Belagavi", at: [74.5, 15.85], aka: ["belgaum"] },
  { name: "Shivamogga", at: [75.57, 13.93], aka: ["shimoga"] },
  { name: "Kalaburagi", at: [76.83, 17.33], aka: ["gulbarga"] },
  { name: "Udupi", at: [74.75, 13.34] },
  { name: "Chennai", at: [80.27, 13.08], aka: ["madras"] },
  { name: "Coimbatore", at: [76.96, 11.02] },
  { name: "Madurai", at: [78.12, 9.93] },
  { name: "Tiruchirappalli", at: [78.7, 10.79], aka: ["trichy"] },
  { name: "Salem", at: [78.15, 11.66] },
  { name: "Puducherry", at: [79.81, 11.94], aka: ["pondicherry"] },
  { name: "Thiruvananthapuram", at: [76.94, 8.52], aka: ["trivandrum"] },
  { name: "Kochi", at: [76.27, 9.93], aka: ["cochin", "ernakulam"] },
  { name: "Kozhikode", at: [75.78, 11.26], aka: ["calicut"] },
  { name: "Thrissur", at: [76.21, 10.53] },
  { name: "Hyderabad", at: [78.47, 17.39], aka: ["secunderabad"] },
  { name: "Warangal", at: [79.59, 17.97] },
  { name: "Visakhapatnam", at: [83.22, 17.69], aka: ["vizag"] },
  { name: "Vijayawada", at: [80.65, 16.51] },
  { name: "Guntur", at: [80.44, 16.31] },
  { name: "Tirupati", at: [79.42, 13.63] },
  { name: "Nellore", at: [79.99, 14.44] },
  { name: "Kurnool", at: [78.04, 15.83] },
  { name: "Mumbai", at: [72.88, 19.08], aka: ["bombay", "navi mumbai", "thane"] },
  { name: "Pune", at: [73.86, 18.52] },
  { name: "Nagpur", at: [79.09, 21.15] },
  { name: "Nashik", at: [73.79, 20.0] },
  { name: "Aurangabad", at: [75.34, 19.88], aka: ["chhatrapati sambhajinagar"] },
  { name: "Panaji", at: [73.83, 15.49], aka: ["panjim"] },
  { name: "Margao", at: [73.96, 15.27] },
  { name: "Ahmedabad", at: [72.57, 23.02] },
  { name: "Gandhinagar", at: [72.64, 23.22] },
  { name: "Surat", at: [72.83, 21.17] },
  { name: "Vadodara", at: [73.18, 22.31], aka: ["baroda"] },
  { name: "Rajkot", at: [70.8, 22.3] },
  { name: "Jaipur", at: [75.79, 26.91] },
  { name: "Jodhpur", at: [73.02, 26.24] },
  { name: "Udaipur", at: [73.71, 24.59] },
  { name: "New Delhi", at: [77.21, 28.61], aka: ["delhi"] },
  { name: "Gurugram", at: [77.03, 28.46], aka: ["gurgaon"] },
  { name: "Noida", at: [77.33, 28.54] },
  { name: "Faridabad", at: [77.32, 28.41] },
  { name: "Chandigarh", at: [76.78, 30.73] },
  { name: "Ludhiana", at: [75.86, 30.9] },
  { name: "Amritsar", at: [74.87, 31.63] },
  { name: "Shimla", at: [77.17, 31.1] },
  { name: "Dehradun", at: [78.03, 30.32] },
  { name: "Lucknow", at: [80.95, 26.85] },
  { name: "Kanpur", at: [80.33, 26.45] },
  { name: "Varanasi", at: [82.97, 25.32] },
  { name: "Agra", at: [78.01, 27.18] },
  { name: "Bhopal", at: [77.41, 23.26] },
  { name: "Indore", at: [75.86, 22.72] },
  { name: "Raipur", at: [81.63, 21.25] },
  { name: "Patna", at: [85.14, 25.59] },
  { name: "Ranchi", at: [85.31, 23.34] },
  { name: "Jamshedpur", at: [86.2, 22.8] },
  { name: "Bhubaneswar", at: [85.82, 20.3] },
  { name: "Cuttack", at: [85.88, 20.46] },
  { name: "Kolkata", at: [88.36, 22.57], aka: ["calcutta", "howrah"] },
  { name: "Siliguri", at: [88.43, 26.73] },
  { name: "Gangtok", at: [88.61, 27.33] },
  { name: "Guwahati", at: [91.74, 26.14], aka: ["dispur"] },
  { name: "Shillong", at: [91.89, 25.58] },
  { name: "Agartala", at: [91.28, 23.83] },
  { name: "Aizawl", at: [92.72, 23.73] },
  { name: "Imphal", at: [93.94, 24.82] },
  { name: "Kohima", at: [94.11, 25.67] },
  { name: "Itanagar", at: [93.62, 27.08] },
  { name: "Srinagar", at: [74.8, 34.08] },
  { name: "Jammu", at: [74.86, 32.73] },
  { name: "Leh", at: [77.58, 34.15] },
  { name: "Port Blair", at: [92.73, 11.62], aka: ["sri vijaya puram"] },
  { name: "Kavaratti", at: [72.64, 10.57] },
  { name: "Daman", at: [72.83, 20.4] },
  { name: "Silvassa", at: [73.0, 20.27] },
];

/** The state capital (or largest city) stands in when the city is not on our sheet. */
const STATE_SEAT: Record<string, string> = {
  "Andhra Pradesh": "Vijayawada",
  "Arunachal Pradesh": "Itanagar",
  Assam: "Guwahati",
  Bihar: "Patna",
  Chhattisgarh: "Raipur",
  Goa: "Panaji",
  Gujarat: "Ahmedabad",
  Haryana: "Gurugram",
  "Himachal Pradesh": "Shimla",
  Jharkhand: "Ranchi",
  Karnataka: "Bengaluru",
  Kerala: "Kochi",
  "Madhya Pradesh": "Bhopal",
  Maharashtra: "Mumbai",
  Manipur: "Imphal",
  Meghalaya: "Shillong",
  Mizoram: "Aizawl",
  Nagaland: "Kohima",
  Odisha: "Bhubaneswar",
  Punjab: "Ludhiana",
  Rajasthan: "Jaipur",
  Sikkim: "Gangtok",
  "Tamil Nadu": "Chennai",
  Telangana: "Hyderabad",
  Tripura: "Agartala",
  "Uttar Pradesh": "Lucknow",
  Uttarakhand: "Dehradun",
  "West Bengal": "Kolkata",
  "Andaman and Nicobar Islands": "Port Blair",
  Chandigarh: "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu": "Daman",
  Delhi: "New Delhi",
  "Jammu and Kashmir": "Srinagar",
  Ladakh: "Leh",
  Lakshadweep: "Kavaratti",
  Puducherry: "Puducherry",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();

/** Find the delivery point for an address. `approx` is true when only the state was matched. */
export function locate(city: string, state: string): { name: string; at: LonLat; approx: boolean } {
  const c = norm(city);
  const hit = CITIES.find((p) => norm(p.name) === c || p.aka?.some((a) => a === c)) ?? CITIES.find((p) => c && (c.includes(norm(p.name)) || p.aka?.some((a) => c.includes(a))));
  if (hit) return { name: hit.name, at: hit.at, approx: false };
  const seat = CITIES.find((p) => p.name === STATE_SEAT[state]) ?? CITIES[1];
  return { name: city.trim() || seat.name, at: seat.at, approx: true };
}

/** Cities near a box, to give a route some landmarks. */
export function citiesNear(box: { lon0: number; lon1: number; lat0: number; lat1: number }, skip: string[], max = 8) {
  const cx = (box.lon0 + box.lon1) / 2;
  const cy = (box.lat0 + box.lat1) / 2;
  return CITIES.filter((p) => p.at[0] > box.lon0 && p.at[0] < box.lon1 && p.at[1] > box.lat0 && p.at[1] < box.lat1 && !skip.includes(p.name))
    .sort((a, b) => Math.hypot(a.at[0] - cx, a.at[1] - cy) - Math.hypot(b.at[0] - cx, b.at[1] - cy))
    .slice(0, max);
}
