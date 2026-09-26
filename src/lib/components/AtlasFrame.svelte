<script lang="ts">
  // Decorative atlas chrome over the Leaflet map: double-rule frame, corner
  // cartouches, map title and a slowly rotating compass rose. Pointer-events
  // pass straight through to the map.
  const R = 34;
  const points = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const long = a % 90 === 0;
    const len = long ? R - 3 : R - 10;
    const rad = ((a - 90) * Math.PI) / 180;
    return { x: Math.cos(rad) * len, y: Math.sin(rad) * len, long };
  });
</script>

<div class="atlas-frame" aria-hidden="true">
  <span class="corner tl"></span>
  <span class="corner tr"></span>
  <span class="corner bl"></span>
  <span class="corner br"></span>

  <div class="atlas-title">
    <div class="atlas-title-main">&#9670; ORBIS TERRARVM &middot; HISTORIAE &#9670;</div>
    <div class="atlas-title-sub">A map of places where things happened. Drag the year to reveal.</div>
  </div>

  <svg class="compass" viewBox="-44 -48 88 92" width="88" height="92">
    <g class="compass-rose">
      <circle r={R} fill="var(--parchment)" stroke="var(--ink)" stroke-width="1" />
      <circle r={R - 4} fill="none" stroke="var(--ink)" stroke-width="0.6" stroke-dasharray="2 2" />
      {#each points as p}
        <line x1="0" y1="0" x2={p.x} y2={p.y} stroke="var(--ink)" stroke-width={p.long ? 1.4 : 0.8} />
      {/each}
      <circle r="2" fill="var(--rubric)" />
      <text x="0" y={-R - 4} text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="8" fill="var(--ink)">N</text>
    </g>
  </svg>
</div>

<style>
  .atlas-frame {
    position: fixed;
    inset: 44px 8px 8px 8px;
    border: 3px double var(--ink);
    box-shadow: inset 0 0 0 1px rgba(43, 29, 16, 0.25);
    pointer-events: none;
    z-index: 5;
  }

  .corner {
    position: absolute;
    width: 18px;
    height: 18px;
    background: var(--parchment);
    border: 2px solid var(--ink);
    transform: rotate(45deg);
    box-shadow: inset 0 0 0 2px var(--parchment), inset 0 0 0 3px var(--ink);
  }
  .tl { top: -10px; left: -10px; }
  .tr { top: -10px; right: -10px; }
  .bl { bottom: -10px; left: -10px; }
  .br { bottom: -10px; right: -10px; }

  .atlas-title {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    white-space: nowrap;
    padding: 6px 14px 7px;
    background: var(--parchment-2);
    border: 2px solid var(--ink);
    box-shadow: 2px 2px 0 var(--ink);
  }
  .atlas-title-main {
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--rubric);
  }
  .atlas-title-sub {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 13px;
    color: var(--ink-faded);
    margin-top: 3px;
  }

  .compass {
    position: absolute;
    left: 18px;
    bottom: 18px;
    overflow: visible;
  }
  .compass-rose {
    transform-box: view-box;
    transform-origin: 0 0;
    animation: compass-turn 120s linear infinite;
  }
  @keyframes compass-turn {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1180px) {
    .atlas-title { display: none; }
  }

  @media (max-width: 768px) {
    .atlas-frame { inset: 34px 4px 4px 4px; }
    .corner { display: none; }
    .compass { width: 56px; height: 58px; left: 10px; bottom: auto; top: 60px; display: none; }
  }
</style>
