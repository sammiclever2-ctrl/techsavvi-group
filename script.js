document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const header = $("#header");
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  const cursorGlow = $("#cursorGlow");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 768;

  if (reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
  }

  function safeScrollTo(targetEl) {
    if (!targetEl) return;
    const headerOffset = header ? header.offsetHeight + 18 : 100;
    const top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState);

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.classList.toggle("hidden");
    });

    $$('a[href^="#"]', mobileMenu).forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      safeScrollTo(target);
      history.replaceState(null, "", href);
    });
  });

  if (window.location.hash) {
    const hashTarget = $(window.location.hash);
    if (hashTarget) {
      setTimeout(() => safeScrollTo(hashTarget), 120);
    }
  }

  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const currentId = entry.target.id;

          $$('nav a[href^="#"], #mobileMenu a[href^="#"]').forEach((link) => {
            const active = link.getAttribute("href") === `#${currentId}`;
            link.classList.toggle("text-[var(--text)]", active);
            link.classList.toggle("text-[var(--text)]/80", !active);
          });
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.1 }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const heroCard = $("#heroVisualCard");
  const heroWrap = $("#heroVisualWrap");
  const heroOrbital = $("#heroOrbital");
  const auroraOne = $(".aurora-one");
  const auroraTwo = $(".aurora-two");
  const auroraThree = $(".aurora-three");

  if (heroWrap && heroCard && !reduceMotion && !isMobile) {
    heroWrap.addEventListener("mousemove", (e) => {
      const rect = heroWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      heroCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroWrap.addEventListener("mouseleave", () => {
      heroCard.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  $$(".company-card").forEach((card) => {
    const tilt = $(".company-tilt", card);
    if (!tilt || reduceMotion || isMobile) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = ((y / rect.height) - 0.5) * -10;
      tilt.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", () => {
      tilt.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
  });

  const choiceButtons = $$(".config-choice");
  const addonInputs = $$(".addon-input");
  const deliveryRange = $("#deliveryRange");
  const totalEl = $("#configTotal");
  const packageEl = $("#configPackageName");
  const summaryEl = $("#configSummary");
  const timelineEl = $("#configTimeline");
  const complexityEl = $("#configComplexity");
  const fitEl = $("#configFit");
  const includesEl = $("#configIncludes");

  const packageMap = {
    website: {
      name: "Signature Website Build",
      summary:
        "A premium web experience package for brands that need a strong market-facing presence with refined design, strong clarity, and conversion-ready structure.",
      includes: [
        "Premium interface design",
        "Responsive site architecture",
        "Conversion-focused content structure",
        "Launch support"
      ]
    },
    automation: {
      name: "Operational Systems Upgrade",
      summary:
        "A workflow and automation package for teams that want cleaner operations, less friction, and a stronger internal delivery foundation.",
      includes: [
        "Workflow design mapping",
        "Automation architecture",
        "Operational dashboard layer",
        "Implementation guidance"
      ]
    },
    ecosystem: {
      name: "Full Ecosystem Transformation",
      summary:
        "A multi-layer engagement combining digital presence, smart systems, and strategic enablement for organizations building at a higher level.",
      includes: [
        "Website + systems integration",
        "Automation and process design",
        "Strategic advisory support",
        "Capability enablement"
      ]
    }
  };

  function renderIncludes(items, checkedAddons) {
    if (!includesEl) return;

    const addonLabels = checkedAddons
      .map(
        (input) =>
          input.closest(".config-addon")?.querySelector("span span")?.textContent || ""
      )
      .filter(Boolean);

    includesEl.innerHTML = [...items, ...addonLabels]
      .map(
        (item) =>
          `<div class="rounded-2xl border border-[rgba(30,64,175,0.08)] bg-white/78 px-4 py-3 text-sm text-[var(--text)]">${item}</div>`
      )
      .join("");
  }

  function updateConfigurator() {
    if (!choiceButtons.length || !totalEl) return;

    const activeChoices = choiceButtons.filter((btn) =>
      btn.classList.contains("active-choice")
    );

    let total = 0;

    activeChoices.forEach((btn) => {
      total += Number(btn.dataset.price || 0);
    });

    const checkedAddons = addonInputs.filter((input) => input.checked);
    checkedAddons.forEach((input) => {
      total += Number(input.dataset.price || 0);
    });

    const speed = Number(deliveryRange?.value || 2);
    let speedCost = 0;
    let timeline = "4–6 weeks";

    if (speed === 1) {
      speedCost = 0;
      timeline = "6–8 weeks";
    } else if (speed === 2) {
      speedCost = 800;
      timeline = "4–6 weeks";
    } else {
      speedCost = 1800;
      timeline = "2–4 weeks";
    }

    total += speedCost;

    const activeEngagement =
      $('.config-choice[data-group="engagement"].active-choice')?.dataset.value || "website";
    const activeStage =
      $('.config-choice[data-group="stage"].active-choice')?.dataset.value || "startup";
    const activePackage = packageMap[activeEngagement];

    if (packageEl) packageEl.textContent = activePackage.name;
    if (summaryEl) summaryEl.textContent = activePackage.summary;
    if (timelineEl) timelineEl.textContent = timeline;
    if (complexityEl) {
      complexityEl.textContent = {
        startup: "Refined",
        growth: "Advanced",
        enterprise: "High-touch"
      }[activeStage];
    }
    if (fitEl) {
      fitEl.textContent = {
        startup: "Launch-ready",
        growth: "Scale-ready",
        enterprise: "Transformation-ready"
      }[activeStage];
    }

    totalEl.textContent = total.toLocaleString();
    renderIncludes(activePackage.includes, checkedAddons);
  }

  choiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.group;

      $$(`.config-choice[data-group="${group}"]`).forEach((btn) => {
        btn.classList.remove(
          "active-choice",
          "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]",
          "border-[rgba(30,64,175,0.12)]"
        );
        btn.classList.add("bg-white/76", "border-[rgba(30,64,175,0.08)]");
      });

      button.classList.add("active-choice");
      button.classList.remove("bg-white/76", "border-[rgba(30,64,175,0.08)]");
      button.classList.add(
        "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]",
        "border-[rgba(30,64,175,0.12)]"
      );

      updateConfigurator();
    });
  });

  addonInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const wrapper = input.closest(".config-addon");
      if (!wrapper) return;

      if (input.checked) {
        wrapper.classList.add(
          "border-[rgba(30,64,175,0.16)]",
          "shadow-[0_12px_24px_rgba(59,130,246,0.24)]",
          "bg-[linear-gradient(145deg,rgba(59,130,246,0.10),rgba(255,255,255,0.92))]"
        );
      } else {
        wrapper.classList.remove(
          "border-[rgba(30,64,175,0.16)]",
          "shadow-[0_12px_24px_rgba(59,130,246,0.24)]",
          "bg-[linear-gradient(145deg,rgba(59,130,246,0.10),rgba(255,255,255,0.92))]"
        );
      }

      updateConfigurator();
    });
  });

  deliveryRange?.addEventListener("input", updateConfigurator);
  updateConfigurator();

  const modeButtons = $$(".labs-mode");
  const labsModeTitle = $("#labsModeTitle");
  const labsModeDescription = $("#labsModeDescription");
  const labsSummaryText = $("#labsSummaryText");
  const labsOutputText = $("#labsOutputText");
  const labsMetricOne = $("#labsMetricOne");
  const labsMetricTwo = $("#labsMetricTwo");
  const labsMetricThree = $("#labsMetricThree");
  const labsMetricFour = $("#labsMetricFour");
  const labsOrbitalRing = $("#labsOrbitalRing");

  const modes = {
    "ai-core": {
      title: "AI Core",
      description:
        "Intelligent workflow concepts, prompt systems, and automation logic designed for future-facing operating models.",
      summary:
        "TechSavvi Labs is currently focused on intelligence workflows, decision support, and automation-enhanced execution systems.",
      output:
        "Prioritize AI workflow orchestration and decision support concepts that can later be translated into client systems and Academy training assets.",
      metrics: ["14", "08", "94%", "High"]
    },
    automation: {
      title: "Automation Grid",
      description:
        "Process mapping, operations logic, and integrated systems architecture for smoother, more scalable organizational delivery.",
      summary:
        "This mode focuses on reducing operational friction through structured automation, cleaner handoffs, and better systems visibility.",
      output:
        "Prioritize repeatable process automation opportunities that shorten delivery time and improve consistency across service workflows.",
      metrics: ["11", "06", "89%", "Strong"]
    },
    "product-lab": {
      title: "Product Lab",
      description:
        "Prototype pathways, concept testing, and productized experimentation for new digital services and emerging offers.",
      summary:
        "This mode explores what can be packaged, tested, and launched as a differentiated digital product or service layer.",
      output:
        "Focus on lightweight prototype validation and market-fit testing for premium digital offers before scaling into full delivery.",
      metrics: ["09", "05", "86%", "Growing"]
    },
    "learning-intel": {
      title: "Learning Intel",
      description:
        "Insight translation from innovation work into Academy-ready knowledge systems, training assets, and future-readiness programs.",
      summary:
        "This mode helps transform innovation learning into structured capability building and Academy delivery opportunities.",
      output:
        "Translate Labs discoveries into clear educational frameworks that support upskilling, onboarding, and digital transformation learning.",
      metrics: ["12", "07", "92%", "High"]
    }
  };

  function updateLabsMode(modeKey) {
    const mode = modes[modeKey];
    if (!mode) return;

    if (labsModeTitle) labsModeTitle.textContent = mode.title;
    if (labsModeDescription) labsModeDescription.textContent = mode.description;
    if (labsSummaryText) labsSummaryText.textContent = mode.summary;
    if (labsOutputText) labsOutputText.textContent = mode.output;
    if (labsMetricOne) labsMetricOne.textContent = mode.metrics[0];
    if (labsMetricTwo) labsMetricTwo.textContent = mode.metrics[1];
    if (labsMetricThree) labsMetricThree.textContent = mode.metrics[2];
    if (labsMetricFour) labsMetricFour.textContent = mode.metrics[3];
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      modeButtons.forEach((btn) => {
        btn.classList.remove(
          "active-labs-mode",
          "border-[rgba(30,64,175,0.12)]",
          "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]"
        );
        btn.classList.add("border-[rgba(30,64,175,0.08)]", "bg-white/76");
      });

      button.classList.add("active-labs-mode");
      button.classList.remove("border-[rgba(30,64,175,0.08)]", "bg-white/76");
      button.classList.add(
        "border-[rgba(30,64,175,0.12)]",
        "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]"
      );

      updateLabsMode(button.dataset.mode);
    });
  });

  updateLabsMode("ai-core");

  const academyCards = $$(".academy-card");
  const academyProgramSelect = $("#academy-program-select");
  const academyEnrollButton = $("#academyEnrollButton");
  const academyEnrollmentNote = $("#academyEnrollmentNote");
  const academyProgramTitle = $("#academyProgramTitle");
  const academyProgramDescription = $("#academyProgramDescription");
  const academySeats = $("#academySeats");
  const academyDuration = $("#academyDuration");
  const academyLevel = $("#academyLevel");
  const academyPrice = $("#academyPrice");
  const academyBenefits = $("#academyBenefits");
  const academyBar = $("#academyBar");
  const academyBarText = $("#academyBarText");

  const programs = {
    "digital-foundations": {
      title: "Digital Foundations",
      description:
        "A practical pathway for individuals and teams building confidence in modern digital systems, transformation basics, and premium execution thinking.",
      seats: 18,
      duration: "6 Weeks",
      level: "Beginner to Intermediate",
      price: "$420",
      fill: "72%",
      benefits: [
        "Digital confidence and vocabulary",
        "Modern systems awareness",
        "Transformation mindset",
        "Practical execution framework"
      ]
    },
    "automation-mastery": {
      title: "Automation Mastery",
      description:
        "An advanced learning path focused on workflow design, automation logic, and operational systems for teams ready to reduce friction and scale smarter.",
      seats: 11,
      duration: "8 Weeks",
      level: "Intermediate",
      price: "$680",
      fill: "81%",
      benefits: [
        "Workflow mapping techniques",
        "Automation design thinking",
        "Operational systems clarity",
        "Scalable implementation basics"
      ]
    },
    "ai-productivity": {
      title: "AI Productivity Lab",
      description:
        "A focused program for professionals exploring AI-assisted workflows, practical prompt design, and better decision support in modern work environments.",
      seats: 14,
      duration: "5 Weeks",
      level: "Beginner to Intermediate",
      price: "$540",
      fill: "68%",
      benefits: [
        "Prompting fundamentals",
        "AI-supported productivity habits",
        "Decision-support workflows",
        "Practical experimentation framework"
      ]
    }
  };

  function renderAcademyBenefits(items) {
    if (!academyBenefits) return;
    academyBenefits.innerHTML = items
      .map(
        (item) =>
          `<div class="rounded-2xl border border-[rgba(30,64,175,0.10)] bg-white/78 px-4 py-3 text-sm text-[var(--text)]">${item}</div>`
      )
      .join("");
  }

  function updateAcademy(courseKey) {
    const program = programs[courseKey];
    if (!program) return;

    if (academyProgramTitle) academyProgramTitle.textContent = program.title;
    if (academyProgramDescription) academyProgramDescription.textContent = program.description;
    if (academySeats) academySeats.textContent = program.seats;
    if (academyDuration) academyDuration.textContent = program.duration;
    if (academyLevel) academyLevel.textContent = program.level;
    if (academyPrice) academyPrice.textContent = program.price;
    if (academyBar) academyBar.style.width = program.fill;
    if (academyBarText) academyBarText.textContent = program.fill;

    renderAcademyBenefits(program.benefits);

    if (academyProgramSelect) {
      academyProgramSelect.value = courseKey;
    }
  }

  academyCards.forEach((card) => {
    card.addEventListener("click", () => {
      academyCards.forEach((item) => {
        item.classList.remove(
          "active-academy-card",
          "border-[rgba(30,64,175,0.12)]",
          "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]"
        );
        item.classList.add("border-[rgba(30,64,175,0.08)]", "bg-white/76");
      });

      card.classList.add("active-academy-card");
      card.classList.remove("border-[rgba(30,64,175,0.08)]", "bg-white/76");
      card.classList.add(
        "border-[rgba(30,64,175,0.12)]",
        "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]"
      );

      updateAcademy(card.dataset.course);
    });
  });

  academyProgramSelect?.addEventListener("change", (e) => {
    const selected = e.target.value;

    academyCards.forEach((card) => {
      const active = card.dataset.course === selected;
      card.classList.toggle("active-academy-card", active);

      if (active) {
        card.classList.remove("border-[rgba(30,64,175,0.08)]", "bg-white/76");
        card.classList.add(
          "border-[rgba(30,64,175,0.12)]",
          "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]"
        );
      } else {
        card.classList.remove(
          "border-[rgba(30,64,175,0.12)]",
          "bg-[linear-gradient(145deg,rgba(59,130,246,0.14),rgba(255,255,255,0.92))]"
        );
        card.classList.add("border-[rgba(30,64,175,0.08)]", "bg-white/76");
      }
    });

    updateAcademy(selected);
  });

  academyEnrollButton?.addEventListener("click", () => {
    const academyForm = academyEnrollButton.closest("form");

    if (academyForm) return;

    const selectedProgram = academyProgramSelect?.value || "digital-foundations";
    const current = programs[selectedProgram];
    if (!current) return;

    if (current.seats > 0) {
      current.seats -= 1;
      if (academyEnrollmentNote) {
        academyEnrollmentNote.textContent = `Enrollment interest recorded for ${current.title}. A seat has been provisionally reserved in this mock flow.`;
      }
      updateAcademy(selectedProgram);
    } else if (academyEnrollmentNote) {
      academyEnrollmentNote.textContent =
        "This cohort is currently full in the mock system. Please join the waitlist or select another pathway.";
    }
  });

  updateAcademy("digital-foundations");

  const ctaName = $("#cta-name");
  const ctaEmail = $("#cta-email");
  const ctaInterest = $("#cta-interest");
  const ctaMessage = $("#cta-message");
  const ctaSendButton = $("#cta button");

  function validateCTAForm() {
    if (!ctaName || !ctaEmail || !ctaInterest || !ctaMessage || !ctaSendButton) return;

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctaEmail.value.trim());
    const nameValid = ctaName.value.trim().length >= 2;
    const messageValid = ctaMessage.value.trim().length >= 12;
    const interestValid = ctaInterest.value.trim().length > 0;
    const valid = emailValid && nameValid && messageValid && interestValid;

    ctaSendButton.disabled = !valid;
    ctaSendButton.classList.toggle("opacity-60", !valid);
    ctaSendButton.classList.toggle("cursor-not-allowed", !valid);
  }

  [ctaName, ctaEmail, ctaInterest, ctaMessage].forEach((el) => {
    el?.addEventListener("input", validateCTAForm);
    el?.addEventListener("change", validateCTAForm);
  });

  validateCTAForm();

  ctaSendButton?.addEventListener("click", () => {
    if (ctaSendButton.disabled) return;
    if (ctaSendButton.tagName.toLowerCase() === "button" && ctaSendButton.type === "submit") return;
    ctaSendButton.textContent = "Inquiry Sent";
  });

  const glowTargets = $$(".glass, .company-tilt, .service-card, .academy-card, .labs-mode, .config-addon, #heroVisualCard, #labsCore");

  if (!isMobile) {
    glowTargets.forEach((el) => {
      el.classList.add("interactive-glow");
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    });
  }

  if (cursorGlow && !reduceMotion && !isMobile) {
    window.addEventListener("mousemove", (e) => {
      cursorGlow.style.opacity = "1";
      cursorGlow.style.transform = `translate(${e.clientX - 130}px, ${e.clientY - 130}px)`;
    });

    window.addEventListener("mouseleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  $$("img").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });

  const heroLogo = $('#hero img[alt="TechSavvi Group logo"]');
  if (heroLogo) {
    heroLogo.setAttribute("fetchpriority", "high");
    heroLogo.removeAttribute("loading");
  }

  if (window.gsap && !reduceMotion) {
    gsap.from("#hero h1, #hero p, #hero .inline-flex, #hero .grid", {
      y: isMobile ? 14 : 24,
      opacity: 0,
      duration: isMobile ? 0.7 : 1,
      stagger: isMobile ? 0.05 : 0.08,
      ease: "power3.out"
    });

    if (!isMobile && heroOrbital) {
      gsap.to(heroOrbital, {
        y: -8,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(heroOrbital, {
        rotate: 4,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (!isMobile && auroraOne) {
      gsap.to(auroraOne, {
        x: 70,
        y: 18,
        scale: 1.08,
        opacity: 0.62,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (!isMobile && auroraTwo) {
      gsap.to(auroraTwo, {
        x: -60,
        y: 22,
        scale: 1.12,
        opacity: 0.54,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (!isMobile && auroraThree) {
      gsap.to(auroraThree, {
        x: 30,
        y: -14,
        scale: 1.06,
        opacity: 0.40,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (!isMobile && labsOrbitalRing) {
      gsap.to(labsOrbitalRing, {
        rotate: 360,
        duration: 24,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%"
      });
    }

    if (!isMobile) {
      $$(".labs-node").forEach((node, index) => {
        gsap.to(node, {
          y: -8,
          duration: 2.4 + index * 0.12,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }
  }
});