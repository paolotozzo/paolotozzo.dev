(function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector("[data-elevate]");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-elevated", window.scrollY > 28);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent("Message from paolotozzo.dev");
      const body = encodeURIComponent(
        [
          `Name: ${data.get("name") || ""}`,
          `Email: ${data.get("email") || ""}`,
          "",
          data.get("message") || "",
        ].join("\n"),
      );
      window.location.href = `mailto:info@paolotozzo.dev?subject=${subject}&body=${body}`;

      if (status) {
        status.hidden = false;
        status.innerHTML =
          'Your email app should open with the message ready to send. ' +
          'If nothing happens, email <a href="mailto:info@paolotozzo.dev">info@paolotozzo.dev</a> directly.';
      }
    });
  }

  const canvas = document.querySelector(".hero-canvas");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || prefersReduced) return;

  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let lines = [];
  let frame = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.floor(rect.width);
    height = Math.floor(rect.height);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = width < 700 ? 9 : 16;
    lines = Array.from({ length: count }, (_, index) => ({
      y: height * (0.24 + (index / count) * 0.58) + Math.sin(index) * 26,
      x: width * (0.46 + Math.random() * 0.5),
      length: 90 + Math.random() * 240,
      speed: 0.28 + Math.random() * 0.48,
      hue: index % 3 === 0 ? "amber" : "teal",
      phase: Math.random() * Math.PI * 2,
    }));
  };

  let rafId = null;

  const draw = () => {
    frame += 0.012;
    context.clearRect(0, 0, width, height);

    lines.forEach((line) => {
      const drift = ((frame * 60 * line.speed + line.phase * 35) % (width + 260)) - 130;
      const start = line.x + drift - width * 0.24;
      const wave = Math.sin(frame * 1.6 + line.phase) * 8;
      const color =
        line.hue === "amber" ? "rgba(243, 190, 103, 0.34)" : "rgba(89, 198, 187, 0.32)";

      context.beginPath();
      context.moveTo(start, line.y + wave);
      context.bezierCurveTo(
        start + line.length * 0.28,
        line.y - 36 + wave,
        start + line.length * 0.62,
        line.y + 44 - wave,
        start + line.length,
        line.y + wave,
      );
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();

      context.beginPath();
      context.arc(start + line.length, line.y + wave, 2.2, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });

    rafId = requestAnimationFrame(draw);
  };

  const start = () => {
    if (rafId === null) rafId = requestAnimationFrame(draw);
  };

  const stop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  resize();
  window.addEventListener("resize", resize);

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else stop();
  });
  observer.observe(canvas);
})();
