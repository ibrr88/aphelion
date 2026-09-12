export const journeys = [
  {
    id: "orbit", code: "APH / 01", name: "The Orbital Stay", shortName: "Earth orbit",
    subtitle: "A little distance. A whole new world.",
    description: "Three nights above everything you know. Follow the blue curve of home, drift into weightlessness, and watch the light change across entire continents.",
    duration: "3 nights", distance: "400 km", image: "earth", label: "LOW EARTH ORBIT",
    itinerary: [
      { time: "DAY 01", title: "Leave the familiar", detail: "A personal welcome, final preparation, and an imagined ascent to the observatory." },
      { time: "DAY 02–03", title: "Find your own rhythm", detail: "Unhurried time at the viewing deck, a zero-gravity experience, and shared meals above Earth." },
      { time: "DAY 04", title: "Come home changed", detail: "One last look at the horizon before the journey home." },
    ],
  },
  {
    id: "lunar", code: "APH / 02", name: "The Lunar Passage", shortName: "Lunar passage",
    subtitle: "The far side of the familiar.",
    description: "Seven days following our oldest fascination. Pass the lunar highlands, discover the quiet of the far side, and see Earth rise into a sky without an end.",
    duration: "7 days", distance: "384,400 km", image: "moon", label: "CIRCUMLUNAR",
    itinerary: [
      { time: "DAY 01–02", title: "Beyond Earth", detail: "Departure, orientation, and a quiet transit toward the Moon." },
      { time: "DAY 03–05", title: "A world in silver", detail: "An imagined passage around lunar craters and the far side, with time to observe Earthrise." },
      { time: "DAY 06–07", title: "The long way home", detail: "Reflect on the journey as our blue planet slowly fills the window again." },
    ],
  },
  {
    id: "mars", code: "APH / 03", name: "The Mars Expedition", shortName: "Mars",
    subtitle: "A new horizon. A different kind of home.",
    description: "An imagined expedition to rust-red deserts, ancient valleys, and a horizon with two moons. A speculative journey for those drawn to the unknown.",
    duration: "18 months", distance: "Beyond Earth", image: "mars", label: "THE RED PLANET",
    itinerary: [
      { time: "CHAPTER 01", title: "The long departure", detail: "Preparation and an imagined interplanetary passage." },
      { time: "CHAPTER 02", title: "A world in ochre", detail: "Explore the concept habitat and watch the light cross a red horizon." },
      { time: "CHAPTER 03", title: "The blue dot calls", detail: "A reflective passage home, carrying a new perspective." },
    ],
  },
  {
    id: "saturn", code: "APH / 04", name: "The Saturn Odyssey", shortName: "Saturn",
    subtitle: "Some wonders are worth imagining.",
    description: "A far-future flight of imagination through the outer solar system. Drift beyond Saturn's rings and contemplate a world unlike anything you have known.",
    duration: "Far-future concept", distance: "Outer solar system", image: "saturn", label: "BEYOND THE RINGS",
    itinerary: [
      { time: "CHAPTER 01", title: "Beyond the familiar", detail: "An entirely speculative deep-space departure." },
      { time: "CHAPTER 02", title: "An ocean of rings", detail: "An imagined observatory passage above Saturn's icy rings." },
      { time: "CHAPTER 03", title: "Carry the wonder home", detail: "A final look at the rings before the fictional return passage." },
    ],
  },
] as const;
export type JourneyId = (typeof journeys)[number]["id"];
export const seasons = ["March · 2038", "June · 2038", "September · 2038"] as const;
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (path: string) => basePath + path;
