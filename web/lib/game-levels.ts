/** Grid: # wall, . floor, S start, E summit exit, F feather (collectible). */

export interface LevelSpec {
  id: number;
  title: string;
  blurb: string;
  rows: string[];
}

export const LEVELS: LevelSpec[] = [
  {
    id: 1,
    title: "Pine Glitch Trail",
    blurb: "Swipe on the field to hike. Gather all neon feathers, then reach the summit gate.",
    rows: [
      "########",
      "#S.....#",
      "#..F#...#",
      "#.F.F..#",
      "#...#..#",
      "#.....E#",
      "########",
    ],
  },
  {
    id: 2,
    title: "Summit Relay",
    blurb: "A longer climb — more walls, more feathers. Finish the route to prove your streak.",
    rows: [
      "############",
      "#S.........#",
      "#.####.###.#",
      "#.#..F...#.#",
      "#.#.##.#.#.#",
      "#...#..F...#",
      "###.#.####.#",
      "#...F......#",
      "#.#######..#",
      "#.......E..#",
      "############",
    ],
  },
];

export function parseLevel(rows: string[]) {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  const walls = new Set<string>();
  let start = { x: 1, y: 1 };
  let exit = { x: 1, y: 1 };
  const feathers = new Set<string>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = rows[y]?.[x] ?? "#";
      const key = `${x},${y}`;
      if (c === "#") walls.add(key);
      if (c === "S") start = { x, y };
      if (c === "E") exit = { x, y };
      if (c === "F") feathers.add(key);
    }
  }

  return { width, height, walls, start, exit, feathers, featherTotal: feathers.size };
}

export function key(x: number, y: number) {
  return `${x},${y}`;
}
