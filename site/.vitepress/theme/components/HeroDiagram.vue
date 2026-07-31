<template>
  <div
    class="hero-diagram"
    role="img"
    aria-label="多语言协同全栈架构：Go 流量网关聚合 Java 核心业务层与 Python 数据辅助层"
  >
    <svg viewBox="0 0 480 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <marker id="hero-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M1.5 1.5 L8 5 L1.5 8.5 Z" class="hero-arrow-head" />
        </marker>
      </defs>

      <!-- 卡片底 -->
      <rect x="6" y="6" width="468" height="408" rx="24" class="hero-card" />

      <!-- 背景装饰曲线（呼应三门语言的品牌色） -->
      <path d="M30 150 C 120 90 210 210 300 130 S 440 90 460 120" class="hero-deco hero-deco--go" />
      <path d="M20 260 C 130 320 240 200 340 260 S 450 300 466 270" class="hero-deco hero-deco--python" />
      <path d="M60 60 C 160 30 300 80 440 40" class="hero-deco hero-deco--java" />

      <!-- Java 节点（核心业务层） -->
      <rect x="196" y="52" width="138" height="76" rx="12" class="hero-node hero-node--java" />
      <text x="265" y="86" text-anchor="middle" class="hero-node-title hero-node-title--java">Java</text>
      <text x="265" y="110" text-anchor="middle" class="hero-node-sub">核心业务层 · :8081</text>

      <!-- Go 节点（流量网关） -->
      <rect x="42" y="168" width="118" height="76" rx="12" class="hero-node hero-node--go" />
      <text x="101" y="202" text-anchor="middle" class="hero-node-title hero-node-title--go">Go</text>
      <text x="101" y="226" text-anchor="middle" class="hero-node-sub">流量网关 · :8080</text>

      <!-- Python 节点（数据辅助层） -->
      <rect x="310" y="252" width="142" height="76" rx="12" class="hero-node hero-node--python" />
      <text x="381" y="286" text-anchor="middle" class="hero-node-title hero-node-title--python">Python</text>
      <text x="381" y="310" text-anchor="middle" class="hero-node-sub">数据辅助层 · :8082</text>

      <!-- Go -> Java（必达调用）与 Java -> Go（返回） -->
      <path d="M130 168 C 142 138 208 150 246 130" class="hero-link" marker-end="url(#hero-arrow)" />
      <path d="M196 82 C 132 80 86 118 76 164" class="hero-link" marker-end="url(#hero-arrow)" />
      <!-- Go -> Python（可降级调用） -->
      <path d="M160 222 C 236 234 256 284 310 288" class="hero-link hero-link--dashed" marker-end="url(#hero-arrow)" />
      <text x="228" y="244" text-anchor="middle" class="hero-link-label">可降级</text>

      <!-- 请求流动动效 -->
      <path d="M130 168 C 142 138 208 150 246 130" class="hero-flow hero-flow--java" />
      <path d="M160 222 C 236 234 256 284 310 288" class="hero-flow hero-flow--python" />

      <!-- 标题 -->
      <text x="240" y="372" text-anchor="middle" class="hero-caption">多语言协同全栈架构</text>
      <text x="240" y="394" text-anchor="middle" class="hero-caption-sub">从 Java 经验出发，落地 Go + Python 工程化能力</text>
    </svg>
  </div>
</template>

<style scoped>
.hero-diagram {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hero-diagram svg {
  width: 100%;
  height: auto;
  font-family: var(--vp-font-family-base);
}

.hero-card {
  fill: var(--vp-c-bg-soft);
  stroke: var(--vp-c-divider);
  stroke-width: 1;
}

.hero-deco {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  opacity: 0.16;
}

.hero-deco--go { stroke: #00add8; }
.hero-deco--java { stroke: #f89820; }
.hero-deco--python { stroke: #3776ab; }

.hero-node {
  fill: var(--vp-c-bg);
  stroke-width: 1.5;
}

.hero-node--go { stroke: #00add8; }
.hero-node--java { stroke: #f89820; }
.hero-node--python { stroke: #3776ab; }

.hero-node-title {
  font-size: 21px;
  font-weight: 700;
}

.hero-node-title--go { fill: #0087aa; }
.hero-node-title--java { fill: #c96e00; }
.hero-node-title--python { fill: #3776ab; }

.dark .hero-node-title--go { fill: #2fc3e8; }
.dark .hero-node-title--java { fill: #ffb757; }
.dark .hero-node-title--python { fill: #6faede; }

.hero-node-sub {
  font-size: 11.5px;
  fill: var(--vp-c-text-2);
}

.hero-link {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 2;
}

.hero-link--dashed {
  stroke-dasharray: 5 5;
}

.hero-arrow-head {
  fill: var(--vp-c-text-3);
}

.hero-link-label {
  font-size: 10.5px;
  fill: var(--vp-c-text-3);
}

.hero-flow {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 6 78;
  animation: hero-flow-run 2.6s linear infinite;
}

.hero-flow--java { stroke: #f89820; }
.hero-flow--python { stroke: #3776ab; animation-delay: 1.3s; }

@keyframes hero-flow-run {
  from { stroke-dashoffset: 84; }
  to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-flow { animation: none; visibility: hidden; }
}

.hero-caption {
  font-size: 17px;
  font-weight: 700;
  fill: var(--vp-c-text-1);
}

.hero-caption-sub {
  font-size: 11.5px;
  fill: var(--vp-c-text-2);
}
</style>
