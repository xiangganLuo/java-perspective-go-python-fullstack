<template>
  <div
    class="home-architecture"
    role="img"
    aria-label="读者通过电子书进入 Go 网关、Java 核心服务、Python 分析服务与价格数据的协同链路"
  >
    <svg viewBox="0 0 920 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="home-architecture-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M2 2 L10 6 L2 10 Z" fill="#40556f" />
        </marker>
      </defs>
      <rect x="20" y="30" width="160" height="78" rx="8" fill="#fff" stroke="#d7dfe8" />
      <text x="100" y="65" text-anchor="middle" font-size="20" font-weight="700" fill="#172033">读者</text>
      <text x="100" y="91" text-anchor="middle" font-size="14" fill="#5f6d7a">开始阅读</text>

      <rect x="255" y="30" width="190" height="78" rx="8" fill="#fff" stroke="#d7dfe8" />
      <text x="350" y="65" text-anchor="middle" font-size="20" font-weight="700" fill="#172033">电子书章节</text>
      <text x="350" y="91" text-anchor="middle" font-size="14" fill="#5f6d7a">知识与案例</text>

      <rect x="560" y="30" width="190" height="78" rx="8" fill="#f6fbff" stroke="#9fc6ee" />
      <text x="655" y="65" text-anchor="middle" font-size="20" font-weight="700" fill="#1d5e9f">Go 网关</text>
      <text x="655" y="91" text-anchor="middle" font-size="14" fill="#5f6d7a">入口与聚合</text>

      <rect x="560" y="142" width="190" height="78" rx="8" fill="#fff9f6" stroke="#e8baa5" />
      <text x="655" y="177" text-anchor="middle" font-size="20" font-weight="700" fill="#a24328">Java 核心服务</text>
      <text x="655" y="203" text-anchor="middle" font-size="14" fill="#5f6d7a">业务计算</text>

      <rect x="560" y="254" width="190" height="78" rx="8" fill="#f7fcf7" stroke="#a8d6b4" />
      <text x="655" y="289" text-anchor="middle" font-size="20" font-weight="700" fill="#2c7340">Python 分析服务</text>
      <text x="655" y="315" text-anchor="middle" font-size="14" fill="#5f6d7a">数据辅助</text>

      <ellipse cx="842" cy="181" rx="62" ry="38" fill="#fff" stroke="#d7dfe8" />
      <text x="842" y="177" text-anchor="middle" font-size="18" font-weight="700" fill="#172033">价格数据</text>
      <text x="842" y="201" text-anchor="middle" font-size="13" fill="#5f6d7a">DB / Cache</text>

      <path d="M180 69 H255" fill="none" stroke="#40556f" stroke-width="2.5" marker-end="url(#home-architecture-arrow)" />
      <path d="M445 69 H560" fill="none" stroke="#40556f" stroke-width="2.5" marker-end="url(#home-architecture-arrow)" />
      <path d="M445 69 C505 69 500 181 560 181" fill="none" stroke="#40556f" stroke-width="2.5" marker-end="url(#home-architecture-arrow)" />
      <path d="M445 69 C505 69 500 293 560 293" fill="none" stroke="#40556f" stroke-width="2.5" marker-end="url(#home-architecture-arrow)" />
      <path d="M655 108 V142" fill="none" stroke="#40556f" stroke-width="2.5" marker-end="url(#home-architecture-arrow)" />
      <path d="M750 181 H780" fill="none" stroke="#40556f" stroke-width="2.5" marker-end="url(#home-architecture-arrow)" />
      <path d="M750 293 C825 293 824 225 824 219" fill="none" stroke="#40556f" stroke-width="2.5" marker-end="url(#home-architecture-arrow)" />
    </svg>
  </div>
</template>
