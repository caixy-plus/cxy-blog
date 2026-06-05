// 全局动态背景:粒子连线
// 画布固定铺满、置于内容之下、不拦截鼠标(样式见 assets/scss/custom.scss)。
// 适配明暗模式(跟随 html[data-scheme]),尊重 prefers-reduced-motion(减少动态时静止)。

(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const canvas = document.createElement("canvas");
    canvas.id = "bg-particles";
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    interface P { x: number; y: number; vx: number; vy: number; }
    let particles: P[] = [];
    let width = 0;
    let height = 0;
    const mouse = { x: -9999, y: -9999 };
    const LINK_DIST = 130;
    let rgb = particleColor();
    let raf = 0;

    function particleColor(): string {
        let scheme = document.documentElement.dataset.scheme;
        let dark = scheme === "dark";
        if (!scheme || scheme === "auto") {
            dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return dark ? "255,255,255" : "60,60,80";
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const target = Math.min(120, Math.floor((width * height) / 11000));
        particles = [];
        for (let i = 0; i < target; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const n = particles.length;
        for (let i = 0; i < n; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + rgb + ",0.55)";
            ctx.fill();

            for (let j = i + 1; j < n; j++) {
                const q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < LINK_DIST * LINK_DIST) {
                    const a = (1 - Math.sqrt(d2) / LINK_DIST) * 0.45;
                    ctx.strokeStyle = "rgba(" + rgb + "," + a + ")";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const md2 = mdx * mdx + mdy * mdy;
            const MD = LINK_DIST * 1.4;
            if (md2 < MD * MD) {
                const a = (1 - Math.sqrt(md2) / MD) * 0.6;
                ctx.strokeStyle = "rgba(" + rgb + "," + a + ")";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }

    function step() {
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        }
        draw();
        if (!reduceMotion.matches && document.visibilityState === "visible") {
            raf = requestAnimationFrame(step);
        }
    }

    function start() {
        cancelAnimationFrame(raf);
        if (reduceMotion.matches) {
            draw(); // 静态单帧
        } else {
            raf = requestAnimationFrame(step);
        }
    }

    resize();
    start();

    window.addEventListener("resize", function () {
        resize();
        if (reduceMotion.matches) draw();
    });
    window.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener("mouseout", function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") start();
        else cancelAnimationFrame(raf);
    });
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", start);

    // 明暗模式切换 -> 更新粒子颜色
    const mo = new MutationObserver(function () {
        rgb = particleColor();
        if (reduceMotion.matches) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scheme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { rgb = particleColor(); });
})();
