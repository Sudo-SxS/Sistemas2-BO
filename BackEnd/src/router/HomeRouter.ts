import { Router } from "oak";

const routerHome = new Router();

const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Back-Office API | Bento Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/lucide@0.344.0/dist/umd/lucide.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #020617;
            --accent-blue: #38bdf8;
            --glass-bg: rgba(15, 23, 42, 0.6);
            --glass-border: rgba(255, 255, 255, 0.08);
        }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: radial-gradient(circle at top right, #1e1b4b, #020617);
            color: #f1f5f9;
            min-height: 100vh;
        }
        .bento-card {
            background: var(--glass-bg);
            backdrop-filter: blur(16px);
            border: 1px solid var(--glass-border);
            border-radius: 1.5rem;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bento-card:hover {
            border-color: rgba(56, 189, 248, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
        }
        .tab-active {
            @apply bg-blue-500/10 text-blue-400 border-blue-500/50;
            box-shadow: 0 0 20px -5px rgba(59, 130, 246, 0.3);
        }
        pre {
            scrollbar-width: thin;
            scrollbar-color: #334155 transparent;
        }
        .gradient-text {
            background: linear-gradient(to right, #38bdf8, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    </style>
</head>
<body class="antialiased p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header / Bento Stats -->
        <header class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="md:col-span-2 bento-card p-8 flex flex-col justify-between overflow-hidden relative">
                <div class="relative z-10">
                    <h1 class="text-4xl font-extrabold tracking-tight mb-2">System <span class="gradient-text">Back-Office</span></h1>
                    <p class="text-slate-400 font-medium">Core API & Business Logic Infrastructure v2.1.0</p>
                </div>
                <div class="flex items-center gap-4 mt-8 z-10">
                    <span class="px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> SYSTEM HEALTHY
                    </span>
                    <span id="endpoint-count" class="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                        -- ENDPOINTS DETECTED
                    </span>
                </div>
                <!-- Decorative Blur -->
                <div class="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
            </div>

            <div class="bento-card p-6 flex flex-col items-center justify-center text-center">
                <i data-lucide="zap" class="w-8 h-8 text-amber-400 mb-4"></i>
                <p class="text-3xl font-bold">12ms</p>
                <p class="text-slate-500 text-xs uppercase tracking-widest font-bold mt-1">Avg Latency</p>
            </div>

            <div class="bento-card p-6 flex flex-col items-center justify-center text-center">
                <i data-lucide="users" class="w-8 h-8 text-indigo-400 mb-4"></i>
                <p class="text-3xl font-bold">Resilient</p>
                <p class="text-slate-500 text-xs uppercase tracking-widest font-bold mt-1">Deno Cluster</p>
            </div>
        </header>

        <!-- Navigation Tabs -->
        <nav id="tabs" class="flex flex-wrap gap-3"></nav>

        <!-- Main Content (Bento Grid) -->
        <main id="endpoints-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20"></main>
    </div>

    <footer class="text-center py-10 opacity-50 text-xs tracking-widest">
        © ${new Date().getFullYear()} SYSTEM BACK-OFFICE • PROPRIETARY SYSTEM
    </footer>

    <!-- Template for Endpoint Card -->
    <template id="endpoint-template">
        <div class="bento-card p-6 hover:bg-slate-800/20 group animate-fade-in flex flex-col h-full">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <span class="method-badge text-[10px] font-black px-2 py-0.5 rounded border"></span>
                    <code class="text-indigo-300 font-bold text-sm tracking-tight">/path</code>
                </div>
                <div class="roles-container flex gap-1"></div>
            </div>
            
            <h3 class="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">Endpoint Title</h3>
            <p class="text-slate-400 text-sm mb-6 leading-relaxed">Description goes here...</p>
            
            <div class="flex-grow space-y-6">
                <!-- Request Section -->
                <div class="request-section hidden">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="w-1 h-3 bg-blue-500 rounded-full"></span>
                        <p class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Request Payload</p>
                    </div>
                    <div class="data-spec bg-slate-950/50 rounded-xl p-3 text-[11px] text-slate-300 border border-slate-800/50 font-mono mb-3"></div>
                    <div class="example-area">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[9px] text-slate-600 font-bold">REQUEST EXAMPLE</span>
                            <button onclick="copyContent(this)" class="text-[9px] text-blue-500 hover:text-white transition-colors flex items-center gap-1 font-bold">
                                <i data-lucide="copy" class="w-2.5 h-2.5"></i> COPY
                            </button>
                        </div>
                        <pre class="bg-indigo-950/20 rounded-lg p-3 text-[10px] text-blue-200/70 border border-blue-500/5 overflow-x-auto"></pre>
                    </div>
                </div>

                <!-- Response Section -->
                <div class="response-section hidden border-t border-slate-800/50 pt-4">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="w-1 h-3 bg-emerald-500 rounded-full"></span>
                        <p class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Response Details</p>
                    </div>
                    <div class="example-area">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[9px] text-slate-600 font-bold">SUCCESS RESPONSE</span>
                        </div>
                        <pre class="bg-emerald-950/10 rounded-lg p-3 text-[10px] text-emerald-200/70 border border-emerald-500/5 overflow-x-auto"></pre>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <script>
        let apiData = null;

        async function init() {
            try {
                const res = await fetch('/api-docs-json');
                apiData = await res.json();
                
                const total = apiData.categories.reduce((acc, cat) => acc + cat.endpoints.length, 0);
                document.getElementById('endpoint-count').innerText = \`\${total} ENDPOINTS DETECTED\`;

                renderTabs();
                renderCategory(apiData.categories[0].id);
                lucide.createIcons();
            } catch (e) {
                console.error(e);
            }
        }

        function renderTabs() {
            const container = document.getElementById('tabs');
            apiData.categories.forEach((cat, idx) => {
                const btn = document.createElement('button');
                btn.className = \`px-6 py-2 rounded-xl text-sm font-bold border border-transparent transition-all \${idx === 0 ? 'tab-active' : 'text-slate-400 hover:bg-white/5'}\`;
                btn.innerHTML = \`<span class="flex items-center gap-2"><i data-lucide="\${cat.icon || 'folder'}" class="w-4 h-4"></i> \${cat.name}</span>\`;
                btn.onclick = (e) => {
                    document.querySelectorAll('#tabs button').forEach(b => {
                        b.classList.remove('tab-active');
                        b.classList.add('text-slate-400', 'hover:bg-white/5');
                    });
                    btn.classList.add('tab-active');
                    btn.classList.remove('text-slate-400', 'hover:bg-white/5');
                    renderCategory(cat.id);
                };
                container.appendChild(btn);
            });
        }

        function renderCategory(catId) {
            const grid = document.getElementById('endpoints-grid');
            grid.innerHTML = '';
            const category = apiData.categories.find(c => c.id === catId);
            const template = document.getElementById('endpoint-template');

            category.endpoints.forEach(ep => {
                const clone = template.content.cloneNode(true);
                
                const methodBadge = clone.querySelector('.method-badge');
                methodBadge.innerText = ep.method;
                const colors = {
                    'GET': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
                    'POST': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    'PUT': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    'PATCH': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
                    'DELETE': 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                };
                methodBadge.className += ' ' + (colors[ep.method] || 'bg-slate-500/20');

                clone.querySelector('code').innerText = ep.path || '';
                const desc = ep.description || 'Sin descripción disponible.';
                clone.querySelector('h3').innerText = desc.split('.')[0];
                clone.querySelector('p').innerText = desc;

                const rolesCont = clone.querySelector('.roles-container');
                (ep.roles || []).forEach(role => {
                    const r = document.createElement('span');
                    r.className = 'text-[9px] font-black tracking-tighter text-slate-500 bg-white/5 px-1.5 py-0.5 rounded uppercase';
                    r.innerText = role;
                    rolesCont.appendChild(r);
                });

                // Request Logic
                if (ep.request) {
                    const reqSec = clone.querySelector('.request-section');
                    reqSec.classList.remove('hidden');
                    
                    const spec = reqSec.querySelector('.data-spec');
                    const fields = ep.request.body?.fields || ep.request.query || ep.request.params;
                    if (fields) {
                        spec.innerHTML = Object.entries(fields).map(([k, v]) => 
                            \`<div class="flex justify-between border-b border-slate-800/80 last:border-0 py-1.5 px-1 hover:bg-white/5 transition-colors">
                                <span class="flex flex-col">
                                    <span class="text-indigo-200 font-semibold">\${k}\${v.required ? '<span class="text-rose-500">*</span>' : ''}</span>
                                    <span class="text-[9px] text-slate-500">\${v.desc || ''}</span>
                                </span>
                                <span class="text-[9px] text-blue-400/80 italic font-mono self-center uppercase">\${v.type}</span>
                            </div>\`
                        ).join('');
                    } else {
                        spec.classList.add('hidden');
                    }

                    const example = ep.request.example;
                    if (example) {
                        reqSec.querySelector('pre').innerText = JSON.stringify(example, null, 2);
                    } else {
                        reqSec.querySelector('.example-area').classList.add('hidden');
                    }
                }

                // Response Logic
                if (ep.response) {
                    const resSec = clone.querySelector('.response-section');
                    resSec.classList.remove('hidden');
                    const example = ep.response.example;
                    if (example) {
                        resSec.querySelector('pre').innerText = JSON.stringify(example, null, 2);
                    } else {
                        resSec.classList.add('hidden');
                    }
                }

                grid.appendChild(clone);
            });
            lucide.createIcons();
        }

        function copyContent(btn) {
            const pre = btn.closest('.example-area').querySelector('pre');
            navigator.clipboard.writeText(pre.innerText);
            const original = btn.innerHTML;
            btn.innerHTML = 'COPIED!';
            setTimeout(() => btn.innerHTML = original, 2000);
        }

        init();
    </script>
</body>
</html>
`;

routerHome.get("/", (ctx) => {
  ctx.response.type = "text/html";
  ctx.response.body = html;
});

routerHome.get("/api-docs-json", async (ctx) => {
  try {
    const jsonPath = new URL("../../DOCUMENTATION.json", import.meta.url);
    const data = await Deno.readTextFile(jsonPath);
    ctx.response.body = JSON.parse(data);
  } catch (_error) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Documentation JSON not found." };
  }
});

routerHome.get("/home", (ctx) => {
  ctx.response.redirect("/");
});

export default routerHome;
