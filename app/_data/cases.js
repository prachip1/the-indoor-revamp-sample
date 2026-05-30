/**
 * Single source of truth for case studies — consumed by both the
 * homepage row list and the /case-studies deck. Each case has the
 * data needed for thumbnail, deck card caption, and full modal body.
 */
export const CASES = [
  {
    n: "01",
    title: "Lorem Loft",
    type: "Residential",
    year: "2024",
    location: "Lorem, IN",
    area: "180 m²",
    image:
      "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1600&q=80&auto=format&fit=crop",
    summary:
      "A sun-soaked loft where warm timber meets soft linen — every corner built to be lived in.",
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud exercitation.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit voluptate velit esse.",
    ],
    tags: ["Design Project", "Equipment", "Decoration"],
  },
  {
    n: "02",
    title: "Dolor Studio",
    type: "Workspace",
    year: "2024",
    location: "Ipsum, IN",
    area: "120 m²",
    image:
      "https://images.unsplash.com/photo-1512972972907-6d71529c5e92?w=1600&q=80&auto=format&fit=crop",
    summary:
      "A quiet workspace shaped by raw wood and natural light — the kind of room you stay in past dusk.",
    body: [
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
      "Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
    ],
    tags: ["Design Project", "Decoration"],
  },
  {
    n: "03",
    title: "Amet Residence",
    type: "Residential",
    year: "2023",
    location: "Dolor, IN",
    area: "240 m²",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&q=80&auto=format&fit=crop",
    summary:
      "A family residence reorganised around a single deep sectional — a calm centre for everyday life.",
    body: [
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.",
    ],
    tags: ["Design Project", "Equipment"],
  },
  {
    n: "04",
    title: "Consectetur Bistro",
    type: "Hospitality",
    year: "2023",
    location: "Amet, IN",
    area: "95 m²",
    image:
      "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=1600&q=80&auto=format&fit=crop",
    summary:
      "A neighbourhood bistro built on contrast — pale walls, dark timber, and a long communal table at the heart.",
    body: [
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus.",
      "Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
    ],
    tags: ["Hospitality", "Design Project"],
  },
];
