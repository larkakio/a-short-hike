"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LEVELS, key, parseLevel, type LevelSpec } from "@/lib/game-levels";

const STORAGE_KEY = "neon-hike-max-unlocked-level";
const SWIPE_PX = 32;

function loadMaxUnlocked(): number {
  if (typeof window === "undefined") return 1;
  const v = window.localStorage.getItem(STORAGE_KEY);
  const n = v ? parseInt(v, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? Math.min(n, LEVELS.length) : 1;
}

function saveMaxUnlocked(n: number) {
  window.localStorage.setItem(STORAGE_KEY, String(n));
}

type GameSlice = {
  px: number;
  py: number;
  collected: Set<string>;
};

function GameLevelBody({
  level,
  maxUnlocked,
  onWin,
}: {
  level: LevelSpec;
  maxUnlocked: number;
  onWin: (nextMax: number) => void;
}) {
  const parsed = useMemo(() => parseLevel(level.rows), [level.rows]);

  const initialSlice = useMemo(
    (): GameSlice => ({
      px: parsed.start.x,
      py: parsed.start.y,
      collected: new Set<string>(),
    }),
    [parsed.start.x, parsed.start.y],
  );

  const [game, setGame] = useState<GameSlice>(initialSlice);
  const [winBanner, setWinBanner] = useState<string | null>(null);

  const tryStep = useCallback(
    (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) return;

      setGame((s) => {
        const nx = s.px + dx;
        const ny = s.py + dy;
        const nk = key(nx, ny);

        if (parsed.walls.has(nk)) return s;
        if (nx < 0 || ny < 0 || nx >= parsed.width || ny >= parsed.height)
          return s;

        const onExit = nx === parsed.exit.x && ny === parsed.exit.y;
        const nextCollected = new Set(s.collected);
        if (parsed.feathers.has(nk)) nextCollected.add(nk);

        if (onExit) {
          const allFeathersDone = [...parsed.feathers].every((f) =>
            s.collected.has(f),
          );
          if (!allFeathersDone) return s;

          const lastLevel = LEVELS[LEVELS.length - 1];
          if (level.id < lastLevel.id) {
            const nextUnlocked = Math.max(maxUnlocked, level.id + 1);
            onWin(nextUnlocked);
            setWinBanner(
              `Summit reached — Level ${level.id} complete! Level ${level.id + 1} unlocked.`,
            );
          } else {
            setWinBanner("You cleared every route. The mountain glows for you.");
          }
          return { px: nx, py: ny, collected: nextCollected };
        }

        return { px: nx, py: ny, collected: nextCollected };
      });
    },
    [
      level.id,
      maxUnlocked,
      onWin,
      parsed.exit.x,
      parsed.exit.y,
      parsed.feathers,
      parsed.height,
      parsed.width,
      parsed.walls,
    ],
  );

  const onSwipe = useCallback(
    (dxp: number, dyp: number) => {
      if (Math.abs(dxp) < SWIPE_PX && Math.abs(dyp) < SWIPE_PX) return;
      let dx = 0;
      let dy = 0;
      if (Math.abs(dxp) > Math.abs(dyp)) {
        dx = dxp > 0 ? 1 : -1;
      } else {
        dy = dyp > 0 ? 1 : -1;
      }
      tryStep(dx, dy);
    },
    [tryStep],
  );

  const drag = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = null;
    onSwipe(dx, dy);
  };

  const cellAt = (x: number, y: number) => {
    const k = key(x, y);
    const isWall = parsed.walls.has(k);
    const isStart = x === parsed.start.x && y === parsed.start.y;
    const isExit = x === parsed.exit.x && y === parsed.exit.y;
    const isFeather = parsed.feathers.has(k) && !game.collected.has(k);
    const isPlayer = x === game.px && y === game.py;

    let bg = "bg-slate-950/80";
    if (isWall) bg = "bg-indigo-950/90";
    else if (isExit) {
      const allDone = [...parsed.feathers].every((f) => game.collected.has(f));
      bg = allDone
        ? "bg-emerald-500/25 shadow-[inset_0_0_18px_rgba(52,211,153,0.5)]"
        : "bg-slate-900/60";
    } else if (isFeather) bg = "bg-fuchsia-600/20";
    else bg = "bg-cyan-950/30";

    return (
      <div
        key={k}
        className={`relative flex aspect-square items-center justify-center border border-cyan-500/10 ${bg}`}
      >
        {isStart && !isPlayer ? (
          <span className="text-[10px] text-cyan-300/50">S</span>
        ) : null}
        {isExit ? (
          <span className="text-[10px] font-bold text-emerald-300/90">▲</span>
        ) : null}
        {isFeather ? (
          <span className="animate-pulse text-sm text-fuchsia-300 drop-shadow-[0_0_8px_#e879f9]">
            ✦
          </span>
        ) : null}
        {isPlayer ? (
          <span
            className="text-lg drop-shadow-[0_0_12px_#22d3ee]"
            aria-hidden
          >
            🐦
          </span>
        ) : null}
        {isWall ? (
          <span className="text-[10px] text-indigo-300/30">█</span>
        ) : null}
      </div>
    );
  };

  const featherCount = game.collected.size;
  const totalFeathers = parsed.featherTotal;

  return (
    <>
      <div
        role="application"
        aria-label="Hike field — swipe to move"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
        className="neon-border cursor-grab touch-none select-none rounded-2xl bg-black/40 p-2 active:cursor-grabbing"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${parsed.width}, minmax(0, 1fr))`,
          gap: "2px",
        }}
      >
        {Array.from({ length: parsed.height }, (_, y) =>
          Array.from({ length: parsed.width }, (_, x) => cellAt(x, y)),
        ).flat()}
      </div>

      <p className="text-center text-xs text-cyan-200/50">
        Swipe anywhere on the field — up, down, left, right. Collect every
        feather before the summit.
      </p>

      <div className="flex justify-between text-xs text-cyan-100/70">
        <span>
          Feathers: {featherCount} / {totalFeathers}
        </span>
        <span>Level {level.id}</span>
      </div>

      {winBanner ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
        >
          {winBanner}
        </div>
      ) : null}
    </>
  );
}

export function HikeGame() {
  const [maxUnlocked, setMaxUnlocked] = useState(1);
  const [levelIndex, setLevelIndex] = useState(0);

  useEffect(() => {
    // Hydrate unlocked level from localStorage (client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted progress
    setMaxUnlocked(loadMaxUnlocked());
  }, []);

  const level = LEVELS[levelIndex] ?? LEVELS[0];

  const handleWin = useCallback((nextMax: number) => {
    setMaxUnlocked(nextMax);
    saveMaxUnlocked(nextMax);
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <header className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-cyan-100">
          {level.title}
        </h2>
        <p className="text-sm text-cyan-200/60">{level.blurb}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((L, i) => {
          const locked = L.id > maxUnlocked;
          const active = i === levelIndex;
          return (
            <button
              key={L.id}
              type="button"
              disabled={locked}
              onClick={() => setLevelIndex(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-cyan-500/30 text-cyan-50"
                  : locked
                    ? "cursor-not-allowed bg-black/30 text-slate-600"
                    : "bg-black/40 text-cyan-200/70"
              }`}
            >
              Level {L.id}
              {locked ? " (locked)" : ""}
            </button>
          );
        })}
      </div>

      <GameLevelBody
        key={level.id}
        level={level}
        maxUnlocked={maxUnlocked}
        onWin={handleWin}
      />
    </section>
  );
}
