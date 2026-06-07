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
    const button = form.querySelector("button[type='submit']");

    const setStatus = (message, state) => {
      if (!status) return;
      status.hidden = false;
      status.dataset.state = state;
      status.innerHTML = message;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        name: data.get("name") || "",
        email: data.get("email") || "",
        message: data.get("message") || "",
        company: data.get("company") || "",
      };

      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.ok) {
          form.reset();
          setStatus("Thanks — your message has been sent. I'll get back to you soon.", "success");
        } else {
          setStatus(
            (result.error || "Message could not be sent.") +
              ' You can email <a href="mailto:info@paolotozzo.dev">info@paolotozzo.dev</a> directly.',
            "error",
          );
        }
      } catch (err) {
        setStatus(
          'Network error. Please email <a href="mailto:info@paolotozzo.dev">info@paolotozzo.dev</a> directly.',
          "error",
        );
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = "Send message";
        }
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
