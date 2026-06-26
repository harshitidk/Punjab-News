(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function a(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(n){if(n.ep)return;n.ep=!0;const o=a(n);fetch(n.href,o)}})();function f(e,t={},a=[]){const r=document.createElement(e);for(const[n,o]of Object.entries(t))if(n==="className")r.className=o;else if(n==="innerHTML")r.innerHTML=o;else if(n==="textContent")r.textContent=o;else if(n.startsWith("on"))r.addEventListener(n.slice(2).toLowerCase(),o);else if(n==="style"&&typeof o=="object")Object.assign(r.style,o);else if(n==="dataset")for(const[s,l]of Object.entries(o))r.dataset[s]=l;else r.setAttribute(n,o);for(const n of[].concat(a))typeof n=="string"?r.appendChild(document.createTextNode(n)):n instanceof Node&&r.appendChild(n);return r}function m(e,t=document){return t.querySelector(e)}function R(e,t=300){let a;return(...r)=>{clearTimeout(a),a=setTimeout(()=>e(...r),t)}}function u(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}const c={search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',news:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>',clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',sources:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',timeline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>',tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',arrowRight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',externalLink:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',alertCircle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',emptyBox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',summary:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>'},A="/api/news";async function k(e,t={}){const a=`${A}${e}`;try{const r=await fetch(a,{headers:{"Content-Type":"application/json"},...t});if(!r.ok){const n=await r.json().catch(()=>({error:"Unknown error"}));throw new Error(n.error||`HTTP ${r.status}`)}return await r.json()}catch(r){throw console.error(`[API] ${e} failed:`,r.message),r}}async function $(e={}){const t=new URLSearchParams;e.category&&t.set("category",e.category),e.sort&&t.set("sort",e.sort),e.importance&&t.set("importance",e.importance),e.page&&t.set("page",String(e.page)),e.limit&&t.set("limit",String(e.limit)),e.from&&t.set("from",e.from),e.to&&t.set("to",e.to);const a=t.toString();return k(`/feed${a?`?${a}`:""}`)}async function S(e,t=1){const a=new URLSearchParams({q:e,page:String(t)});return k(`/search?${a}`)}async function F(){return k("/filters")}function _(e,t={}){const a=f("header",{className:"app-header"});return a.innerHTML=`
    <div class="header-inner">
      <div class="header-brand">
        <div class="header-logo">
          ${c.news}
        </div>
        <h1 class="header-title">Punjab Political Pulse</h1>
      </div>
      <div class="header-meta">
        <div class="header-live">
          <span class="live-dot"></span>
          <span>Live Feed</span>
        </div>
        <div class="header-stats" id="headerStats">
          ${t.total?`${t.total} stories`:""}
        </div>
      </div>
    </div>
  `,e.appendChild(a),a}function H(e){const t=document.getElementById("headerStats");t&&(t.textContent=e>0?`${e} stories`:"")}function z(e,t){const a=f("div",{className:"search-container"});a.innerHTML=`
    <div class="search-wrapper">
      <span class="search-icon">${c.search}</span>
      <input
        type="text"
        id="searchInput"
        class="search-input"
        placeholder="Search headlines, politicians, parties, departments..."
        autocomplete="off"
        spellcheck="false"
      />
      <span class="search-results-count" id="searchResultsCount"></span>
      <button class="search-clear" id="searchClear" title="Clear search">
        ${c.close}
      </button>
    </div>
  `,e.appendChild(a);const r=document.getElementById("searchInput"),n=document.getElementById("searchClear"),o=document.getElementById("searchResultsCount"),s=R(l=>{t(l)},350);return r.addEventListener("input",()=>{const l=r.value.trim();n.classList.toggle("visible",l.length>0),l.length===0?(o.classList.remove("visible"),t("")):l.length>=2&&s(l)}),n.addEventListener("click",()=>{r.value="",n.classList.remove("visible"),o.classList.remove("visible"),r.focus(),t("")}),r.addEventListener("keydown",l=>{l.key==="Escape"&&(r.value="",n.classList.remove("visible"),o.classList.remove("visible"),r.blur(),t(""))}),a}function h(e){const t=document.getElementById("searchResultsCount");t&&(t.textContent=e!==null?`${e} results`:"",t.classList.toggle("visible",e!==null))}const Y=[{key:"all",label:"All Stories",color:null},{key:"latest",label:"Latest",color:null,isSort:!0},{key:"trending",label:"Trending",color:null,isSort:!0},{key:"divider1",isDivider:!0},{key:"election",label:"Elections",color:"#ef4444"},{key:"governance",label:"Governance",color:"#3b82f6"},{key:"recruitment",label:"Recruitment",color:"#10b981"},{key:"policy",label:"Policy",color:"#8b5cf6"},{key:"law_order",label:"Law & Order",color:"#f59e0b"},{key:"political_party",label:"Parties",color:"#f97316"},{key:"education",label:"Education",color:"#ec4899"},{key:"health",label:"Health",color:"#14b8a6"},{key:"agriculture",label:"Agriculture",color:"#84cc16"}];function V(e,t,a="all"){const r=f("div",{className:"filter-container"}),n=f("div",{className:"filter-scroll",id:"filterScroll"});for(const o of Y){if(o.isDivider){n.appendChild(f("div",{className:"filter-divider"}));continue}const s=f("button",{className:`filter-pill${o.key===a?" active":""}`,dataset:{filter:o.key,sort:o.isSort?"true":""}});let l="";o.color&&(l+=`<span class="filter-pill-dot" style="background:${o.color}"></span>`),l+=`<span>${o.label}</span>`,l+=`<span class="filter-pill-count" id="filterCount_${o.key}"></span>`,s.innerHTML=l,s.addEventListener("click",()=>{document.querySelectorAll(".filter-pill").forEach(g=>g.classList.remove("active")),s.classList.add("active"),o.isSort?t({sort:o.key==="latest"?"latest":"trending",category:null}):o.key==="all"?t({category:null,sort:"latest"}):t({category:o.key})}),n.appendChild(s)}return r.appendChild(n),e.appendChild(r),r}function G(e){if(e)for(const[t,a]of Object.entries(e)){const r=document.getElementById(`filterCount_${t}`);r&&(r.textContent=a>0?a:"")}}function y(e){if(!e)return"";const t=new Date(e),a=new Date,r=a-t,n=Math.floor(r/1e3),o=Math.floor(n/60),s=Math.floor(o/60),l=Math.floor(s/24);return n<60?"Just now":o<60?`${o}m ago`:s<24?`${s}h ago`:l===1?"Yesterday":l<7?`${l}d ago`:l<30?`${Math.floor(l/7)}w ago`:t.toLocaleDateString("en-IN",{month:"short",day:"numeric",year:t.getFullYear()!==a.getFullYear()?"numeric":void 0})}function U(e){return e?new Date(e).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:!0}):""}function q(e){if(!e)return"";const t=new Date(e),a=new Date,r=t.toDateString()===a.toDateString(),n=new Date(a);n.setDate(n.getDate()-1);const o=t.toDateString()===n.toDateString(),s=U(e);return r?`Today, ${s}`:o?`Yesterday, ${s}`:`${t.toLocaleDateString("en-IN",{month:"short",day:"numeric"})}, ${s}`}const E={election:{label:"Election",bg:"rgba(239,68,68,0.15)",color:"#ef4444"},governance:{label:"Governance",bg:"rgba(59,130,246,0.15)",color:"#3b82f6"},recruitment:{label:"Recruitment",bg:"rgba(16,185,129,0.15)",color:"#10b981"},policy:{label:"Policy",bg:"rgba(139,92,246,0.15)",color:"#8b5cf6"},law_order:{label:"Law & Order",bg:"rgba(245,158,11,0.15)",color:"#f59e0b"},infrastructure:{label:"Infrastructure",bg:"rgba(6,182,212,0.15)",color:"#06b6d4"},education:{label:"Education",bg:"rgba(236,72,153,0.15)",color:"#ec4899"},health:{label:"Health",bg:"rgba(20,184,166,0.15)",color:"#14b8a6"},agriculture:{label:"Agriculture",bg:"rgba(132,204,22,0.15)",color:"#84cc16"},political_party:{label:"Parties",bg:"rgba(249,115,22,0.15)",color:"#f97316"},general:{label:"General",bg:"rgba(107,114,128,0.15)",color:"#6b7280"}};function x(e){const t=document.createElement("article");t.className="story-card",t.dataset.storyId=e.id;const a=E[e.category]||E.general,r=Q(e.entities,3);return t.innerHTML=`
    ${e.image?`<div class="story-card-image">
          <img src="${u(e.image)}" alt="" loading="lazy" onerror="this.parentElement.outerHTML='<div class=\\'story-card-no-image\\'>${c.news}</div>'" />
          <div class="story-card-image-overlay"></div>
        </div>`:`<div class="story-card-no-image">${c.news}</div>`}
    
    <div class="story-card-badge">
      <span class="category-badge" style="background:${a.bg};color:${a.color}">
        ${a.label}
      </span>
    </div>
    
    <span class="importance-dot ${e.importance||"low"}" title="${e.importance||"low"} importance"></span>

    <div class="story-card-body">
      <div class="story-card-source">
        <span class="story-card-source-name">${u(e.source)}</span>
        <span class="story-card-time">${y(e.publishedAt)}</span>
      </div>
      
      <h2 class="story-card-headline">${u(e.headline)}</h2>
      
      <p class="story-card-summary">${u(e.summary)}</p>
    </div>

    <div class="story-card-footer">
      <div class="story-card-tags">
        ${r.map(n=>`
          <span class="entity-tag ${n.type}">${u(n.name)}</span>
        `).join("")}
      </div>
      
      ${e.coverageCount>1?`<span class="story-card-coverage">
            ${c.sources}
            <span>${e.coverageCount} sources</span>
          </span>`:""}
    </div>
  `,t}function Q(e,t=3){if(!e)return[];const a=[],r=["politicians","parties","departments","districts","schemes"];for(const n of r){if(a.length>=t)break;const o=e[n]||[];for(const s of o){if(a.length>=t)break;a.push({name:s,type:n.replace(/s$/,"")})}}return a}function K(e,t){if(!t||t.length===0)return;const a=document.createElement("div");a.className="timeline";for(const r of t){const n=document.createElement("div");n.className="timeline-item",n.innerHTML=`
      <div class="timeline-dot"></div>
      <div class="timeline-time">${q(r.time)}</div>
      <div class="timeline-content">${u(r.title)}</div>
      <div class="timeline-source">${u(r.source)}</div>
    `,a.appendChild(n)}e.appendChild(a)}const Z={politicians:"Politician",parties:"Party",departments:"Department",districts:"District",locations:"Location",schemes:"Scheme",organizations:"Organization",dates:"Date",numbers:"Number"},J={politicians:"var(--accent-blue)",parties:"var(--accent-green)",departments:"var(--accent-purple)",districts:"var(--accent-cyan)",locations:"var(--accent-orange)",schemes:"var(--accent-pink)",organizations:"var(--accent-amber)"};function W(e,t){if(!t)return;const a=document.createElement("div");a.className="entity-tags-grid";const r=["politicians","parties","departments","districts","schemes","organizations","locations"];for(const n of r){const o=t[n];if(!(!o||o.length===0))for(const s of o){const l=document.createElement("span");l.className="entity-tag-lg";const g=J[n]||"var(--text-muted)";l.style.borderColor=g.replace("var(","").replace(")",""),l.innerHTML=`
        <span style="color:${g}">${u(s)}</span>
        <span class="tag-type">${Z[n]||n}</span>
      `,a.appendChild(l)}}a.children.length===0&&(a.innerHTML='<span style="color:var(--text-muted);font-size:13px">No entities extracted</span>'),e.appendChild(a)}let L=!1;const T={election:{label:"Election",bg:"rgba(239,68,68,0.15)",color:"#ef4444"},governance:{label:"Governance",bg:"rgba(59,130,246,0.15)",color:"#3b82f6"},recruitment:{label:"Recruitment",bg:"rgba(16,185,129,0.15)",color:"#10b981"},policy:{label:"Policy",bg:"rgba(139,92,246,0.15)",color:"#8b5cf6"},law_order:{label:"Law & Order",bg:"rgba(245,158,11,0.15)",color:"#f59e0b"},infrastructure:{label:"Infrastructure",bg:"rgba(6,182,212,0.15)",color:"#06b6d4"},education:{label:"Education",bg:"rgba(236,72,153,0.15)",color:"#ec4899"},health:{label:"Health",bg:"rgba(20,184,166,0.15)",color:"#14b8a6"},agriculture:{label:"Agriculture",bg:"rgba(132,204,22,0.15)",color:"#84cc16"},political_party:{label:"Parties",bg:"rgba(249,115,22,0.15)",color:"#f97316"},general:{label:"General",bg:"rgba(107,114,128,0.15)",color:"#6b7280"}};function X(e){const t=document.createElement("div");t.className="modal-backdrop",t.id="modalBackdrop";const a=document.createElement("div");a.className="modal-drawer",a.id="modalDrawer",e.appendChild(t),e.appendChild(a),t.addEventListener("click",b),document.addEventListener("keydown",r=>{r.key==="Escape"&&L&&b()})}function B(e){var o;const t=m("#modalBackdrop"),a=m("#modalDrawer");if(!t||!a)return;const r=T[e.category]||T.general;if(a.innerHTML=`
    <div class="modal-header">
      <div class="modal-category">
        <span class="category-badge" style="background:${r.bg};color:${r.color}">
          ${r.label}
        </span>
        <span class="importance-dot ${e.importance||"low"}"></span>
      </div>
      <button class="modal-close" id="modalClose" title="Close (Esc)">
        ${c.close}
      </button>
    </div>

    <div class="modal-body">
      ${e.image?`<div class="modal-image">
            <img src="${u(e.image)}" alt="" onerror="this.parentElement.style.display='none'" />
          </div>`:""}

      <h2 class="modal-headline">${u(e.headline)}</h2>

      <div class="modal-meta">
        <span class="modal-meta-item source">
          ${c.news}
          <span>${u(e.source)}</span>
        </span>
        <span class="modal-meta-item">
          ${c.clock}
          <span>${y(e.publishedAt)}</span>
        </span>
        ${e.coverageCount>1?`<span class="modal-meta-item">
              ${c.sources}
              <span>${e.coverageCount} sources covering this story</span>
            </span>`:""}
      </div>

      <!-- Full Summary -->
      <div class="modal-section">
        <h3 class="modal-section-title">
          ${c.summary}
          <span>Summary</span>
        </h3>
        <p class="modal-summary">${u(e.summary)}</p>
        ${e.sourceUrl?`<a href="${u(e.sourceUrl)}" target="_blank" rel="noopener noreferrer" 
              style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:13px;color:var(--accent-blue)">
              Read full article ${c.externalLink}
            </a>`:""}
      </div>

      <!-- Related Coverage -->
      ${e.relatedCoverage&&e.relatedCoverage.length>1?`<div class="modal-section">
            <h3 class="modal-section-title">
              ${c.sources}
              <span>Related Coverage (${e.relatedCoverage.length} sources)</span>
            </h3>
            <div class="coverage-list">
              ${e.relatedCoverage.map(s=>`
                <a href="${u(s.url)}" target="_blank" rel="noopener noreferrer" class="coverage-item">
                  <div class="coverage-item-source">
                    ${ee(s.source)}
                  </div>
                  <div class="coverage-item-content">
                    <div class="coverage-item-name">${u(s.source)}</div>
                    <div class="coverage-item-headline">${u(s.headline)}</div>
                    <div class="coverage-item-time">${y(s.publishedAt)}</div>
                  </div>
                  <span class="coverage-item-arrow">${c.arrowRight}</span>
                </a>
              `).join("")}
            </div>
          </div>`:""}

      <!-- Timeline -->
      ${e.timeline&&e.timeline.length>1?`<div class="modal-section">
            <h3 class="modal-section-title">
              ${c.timeline}
              <span>Timeline</span>
            </h3>
            <div id="modalTimeline"></div>
          </div>`:""}

      <!-- Related Topics -->
      <div class="modal-section">
        <h3 class="modal-section-title">
          ${c.tag}
          <span>Related Topics</span>
        </h3>
        <div id="modalEntityTags"></div>
      </div>
    </div>
  `,e.timeline&&e.timeline.length>1){const s=m("#modalTimeline");s&&K(s,e.timeline)}const n=m("#modalEntityTags");n&&e.entities&&W(n,e.entities),(o=m("#modalClose"))==null||o.addEventListener("click",b),t.classList.add("active"),a.classList.add("active"),document.body.classList.add("modal-open"),L=!0}function b(){const e=m("#modalBackdrop"),t=m("#modalDrawer");e&&e.classList.remove("active"),t&&t.classList.remove("active"),document.body.classList.remove("modal-open"),L=!1}function ee(e){if(!e)return"?";const t=e.split(/\s+/);return t.length>=2?(t[0][0]+t[1][0]).toUpperCase():e.substring(0,2).toUpperCase()}function w(e,t=6){const a=document.createElement("div");a.className="feed-grid",a.id="skeletonGrid";for(let r=0;r<t;r++){const n=document.createElement("div");n.className="skeleton-card",n.innerHTML=`
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line w-40"></div>
        <div class="skeleton skeleton-line h-lg w-80"></div>
        <div class="skeleton skeleton-line w-full"></div>
        <div class="skeleton skeleton-line w-60"></div>
        <div class="skeleton-tags">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
        </div>
      </div>
    `,a.appendChild(n)}return e.appendChild(a),a}function v(){const e=document.getElementById("skeletonGrid");e&&(e.style.opacity="0",e.style.transition="opacity 300ms ease",setTimeout(()=>e.remove(),300))}function C(e,t,a){var n;const r=document.createElement("div");return r.className="error-state",r.id="errorState",r.innerHTML=`
    <div class="error-icon">${c.alertCircle}</div>
    <h2 class="error-title">Something went wrong</h2>
    <p class="error-message">${t||"Failed to load the news feed. Please try again."}</p>
    <button class="retry-btn" id="retryBtn">
      ${c.refresh}
      <span>Try Again</span>
    </button>
  `,a&&((n=r.querySelector("#retryBtn"))==null||n.addEventListener("click",a)),e.appendChild(r),r}function N(e,t){const a=document.createElement("div");return a.className="feed-empty",a.innerHTML=`
    <div class="feed-empty-icon">${c.emptyBox}</div>
    <h2 class="feed-empty-title">No stories found</h2>
    <p class="feed-empty-text">${t||"Try adjusting your filters or search query."}</p>
  `,e.appendChild(a),a}const i={stories:[],filteredStories:[],filters:{category:null,sort:"latest",page:1,limit:20},searchQuery:"",isLoading:!1,hasMore:!1,totalStories:0,filterMeta:null};let d,p;async function D(){const e=m("#app"),t=m("#initialLoader");_(e),z(e,P),V(e,te),d=document.createElement("main"),d.className="feed-container",d.id="feedContainer",e.appendChild(d),X(e),w(d);try{const[a,r]=await Promise.all([$(i.filters),F().catch(()=>null)]);if(t&&(t.classList.add("hidden"),setTimeout(()=>t.remove(),500)),j(a),r){i.filterMeta=r;const n={};for(const o of r.categories)n[o.key]=o.count;n.all=r.totalStories,G(n)}}catch(a){console.error("[Init] Failed to load:",a),t&&(t.classList.add("hidden"),setTimeout(()=>t.remove(),500)),v(),C(d,a.message,()=>{d.innerHTML="",D()})}}function j(e){var t,a;if(v(),!e||!e.stories){N(d,"Unable to load stories. The news feed will refresh automatically.");return}i.stories=e.stories,i.hasMore=((t=e.pagination)==null?void 0:t.hasMore)||!1,i.totalStories=((a=e.pagination)==null?void 0:a.total)||e.stories.length,H(i.totalStories),I(i.stories)}function I(e){var t;if(d.innerHTML="",!e||e.length===0){N(d,i.searchQuery?`No stories found for "${i.searchQuery}". Try a different search term.`:"No stories match your current filters. Try broadening your selection.");return}p=document.createElement("div"),p.className="feed-grid",p.id="feedGrid";for(const a of e){const r=x(a);r.addEventListener("click",n=>{n.target.closest(".entity-tag")||B(a)}),p.appendChild(r)}if(d.appendChild(p),i.hasMore){const a=document.createElement("div");a.className="feed-load-more",a.innerHTML=`
      <button class="load-more-btn" id="loadMoreBtn">
        <span>Load More Stories</span>
      </button>
    `,p.appendChild(a),(t=m("#loadMoreBtn"))==null||t.addEventListener("click",O)}}async function P(e){var t,a;if(i.searchQuery=e,!e){h(null),i.filters.page=1,await M();return}i.isLoading=!0,d.innerHTML="",w(d,3);try{const r=await S(e);v(),i.stories=r.stories||[],i.hasMore=((t=r.pagination)==null?void 0:t.hasMore)||!1,i.totalStories=((a=r.pagination)==null?void 0:a.total)||0,h(i.totalStories),H(i.totalStories),I(i.stories)}catch(r){v(),C(d,r.message,()=>P(e))}finally{i.isLoading=!1}}async function te({category:e,sort:t}){var r;const a=m("#searchInput");a&&(a.value="",i.searchQuery="",h(null),(r=m("#searchClear"))==null||r.classList.remove("visible")),e!==void 0&&(i.filters.category=e),t!==void 0&&(i.filters.sort=t),i.filters.page=1,await M()}async function M(){i.isLoading=!0,d.innerHTML="",w(d);try{const e=await $(i.filters);j(e)}catch(e){v(),C(d,e.message,M)}finally{i.isLoading=!1}}async function O(){var t,a;const e=m("#loadMoreBtn");e&&(e.innerHTML='<div class="spinner"></div>',e.disabled=!0),i.filters.page++;try{const r=i.searchQuery?await S(i.searchQuery,i.filters.page):await $(i.filters);if(r.stories&&r.stories.length>0){i.stories.push(...r.stories),i.hasMore=((t=r.pagination)==null?void 0:t.hasMore)||!1;const n=p==null?void 0:p.querySelector(".feed-load-more");n&&n.remove();for(const o of r.stories){const s=x(o);s.addEventListener("click",l=>{l.target.closest(".entity-tag")||B(o)}),p==null||p.appendChild(s)}if(i.hasMore&&p){const o=document.createElement("div");o.className="feed-load-more",o.innerHTML=`
          <button class="load-more-btn" id="loadMoreBtn">
            <span>Load More Stories</span>
          </button>
        `,p.appendChild(o),(a=m("#loadMoreBtn"))==null||a.addEventListener("click",O)}}}catch(r){console.error("[LoadMore] Failed:",r),e&&(e.innerHTML="<span>Retry</span>",e.disabled=!1)}}document.addEventListener("DOMContentLoaded",D);
