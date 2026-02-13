// ============================
// CARE PAGE LOADER (SLOTS ENABLED)
// Repo: care-loader.js
// ============================

(() => {

  console.log("=====================================");
  console.log("🚀 CARE LOADER STARTING...");
  console.log("=====================================");

  // ============================
  // CARE SHEET CSV
  // ============================
  const sheetCSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvXIfFgTY8Vn3_eFScAp-gbB0JfNTUanbFTuWGnGf1-4xPYt1M3iGDOrzzLpMW6cEAk0wh1mHx5akr/pub?output=csv";

  console.log("📌 Care Sheet URL:", sheetCSV);

  // ============================
  // ROOT CHECK
  // ============================
  const root = document.getElementById("care-root");
  if (!root) {
    console.error("❌ care-root NOT FOUND. Loader exiting.");
    return;
  }
  console.log("✅ care-root found:", root);

  // ============================
  // PAGE SLUG DETECTION
  // ============================
  const slug = window.location.pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .pop()
    .trim();

  console.log("✅ Page slug detected:", slug);

  // ============================
  // NORMALIZE HELPERS
  // ============================
  function normalizeSlug(val) {
    return (val || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\u00A0/g, " ");
  }

  function formatText(text) {
    if (!text) return "";
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  }

  // ============================
  // SAFE CSV PARSER
  // ============================
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && insideQuotes && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (char === "\r" && next === "\n") i++;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  }

  // ============================
  // SLOT TEMPLATE INJECTION
  // ============================
  function injectSlotTemplates() {
    document.querySelectorAll("template[id^='template-slot-']").forEach(tpl => {
      const slotId = tpl.id.replace("template-", "");
      const slot = document.getElementById(slotId);

      if (slot) {
        slot.appendChild(tpl.content.cloneNode(true));
        console.log("✅ Injected custom content into:", slotId);
      }
    });
  }

  // ============================
  // FAQ ACCORDION ACTIVATION
  // ============================
  function activateFAQ() {
    document.querySelectorAll(".care-faq-question").forEach(q => {
      q.addEventListener("click", () => {
        q.classList.toggle("open");
        const answer = q.nextElementSibling;
        if (answer) answer.classList.toggle("open");
      });
    });
    console.log("✅ FAQ accordion active.");
  }

  // ============================
  // MAIN LOAD FLOW
  // ============================
  console.log("=====================================");
  console.log("📥 Fetching Care spreadsheet...");
  console.log("=====================================");

  fetch(sheetCSV + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {

      const rows = parseCSV(csv).slice(1); // skip header row

      // ============================
      // MATCH CARE ROWS (COL 0)
      // ============================
      const careRows = rows.filter(r =>
        normalizeSlug(r[0]) === normalizeSlug(slug)
      );

      console.log("🔍 Matching care rows found:", careRows.length);

      if (!careRows.length) {
        root.innerHTML = `
          <div class="care-page">
            <p style="color:red;text-align:center;">
              No care data found for: <b>${slug}</b>
            </p>
          </div>
        `;
        return;
      }

      const first = careRows[0];

      // ============================
      // COLUMN MAP (0–18)
      //
      // 0  Slug
      // 1  Page Title
      // 2  Intro Heading
      // 3  Intro Text
      // 4  Primary CTA Text
      // 5  Primary CTA Link
      // 6  Secondary CTA Text
      // 7  Secondary CTA Link
      // 8  Benefit Icon URL
      // 9  Benefit Label
      // 10 Overlay Background Image
      // 11 Overlay Heading
      // 12 Overlay Text
      // 13 FAQ Question
      // 14 FAQ Answer
      // 15 Bottom CTA Heading
      // 16 Bottom CTA Text
      // 17 Bottom CTA Button Text
      // 18 Bottom CTA Button Link
      //
      // ============================

      // ============================
      // HERO + INTRO FIELDS
      // ============================
      const pageTitle     = first[1];
      const introHeading  = first[2];
      const introText     = first[3];

      const btn1Text      = first[4];
      let btn1Link        = first[5] || "";

      const btn2Text      = first[6];
      let btn2Link        = first[7] || "";

      // Normalize internal links
      if (btn1Link && !btn1Link.startsWith("http")) {
        btn1Link = "https://mtnhlth.com/" + btn1Link.replace(/^\/+/, "");
      }
      if (btn2Link && !btn2Link.startsWith("http")) {
        btn2Link = "https://mtnhlth.com/" + btn2Link.replace(/^\/+/, "");
      }

      // ============================
      // BENEFITS GRID (COL 8–9)
      // ============================
      const benefitsHTML = careRows
        .filter(r => (r[9] || "").trim())
        .map(r => `
          <div class="care-benefit-card">
            <div class="care-benefit-icon">
              <img src="${r[8]}" alt="">
            </div>
            <p>${r[9]}</p>
          </div>
        `)
        .join("");

      // ============================
      // OVERLAY SECTION (FIRST ROW)
      // ============================
      const overlayBg   = first[10];
      const overlayHead = first[11];
      const overlayText = first[12];

      const overlayHTML = overlayHead
        ? `
          <section class="care-overlay" style="background-image:url('${overlayBg}')">
            <div class="care-overlay-box">
              <h2>${overlayHead}</h2>
              <p>${formatText(overlayText)}</p>
            </div>
          </section>
        `
        : "";

      // ============================
      // FAQ SECTION (COL 13–14)
      // ============================
      const faqHTML = careRows
        .filter(r => (r[13] || "").trim())
        .map(r => `
          <div class="care-faq-item">
            <div class="care-faq-question">${r[13]}</div>
            <div class="care-faq-answer">${formatText(r[14])}</div>
          </div>
        `)
        .join("");

      // ============================
      // BOTTOM CTA (FIRST ROW)
      // ============================
      const bottomHeading = first[15];
      const bottomText    = first[16];
      const bottomBtnText = first[17];
      let bottomBtnLink   = first[18] || "";

      if (bottomBtnLink && !bottomBtnLink.startsWith("http")) {
        bottomBtnLink = "https://mtnhlth.com/" + bottomBtnLink.replace(/^\/+/, "");
      }

      const bottomHTML = bottomHeading
        ? `
          <section class="care-bottom-cta">
            <h2>${bottomHeading}</h2>
            <p>${formatText(bottomText)}</p>
            <a href="${bottomBtnLink}" target="_blank" rel="noopener">
              ${bottomBtnText}
            </a>
          </section>
        `
        : "";

      // ============================
      // ✅ RENDER FULL CARE PAGE
      // ============================
      root.innerHTML = `
        <div class="care-page">

          <!-- HERO TITLE -->
          <section class="care-hero-title">
            <h1>${pageTitle}</h1>
          </section>

          <!-- SLOT: AFTER HERO -->
          <div id="slot-after-hero"></div>

          <!-- INTRO + CTA -->
          <section class="care-intro">
            <h2>${introHeading}</h2>
            <p>${formatText(introText)}</p>

            <div class="care-buttons">
              <a class="care-btn-primary" href="${btn1Link}" target="_blank">${btn1Text}</a>
              <a class="care-btn-secondary" href="${btn2Link}" target="_blank">${btn2Text}</a>
            </div>
          </section>

          <!-- SLOT: AFTER INTRO -->
          <div id="slot-after-intro"></div>

          <!-- BENEFITS -->
          <section class="care-benefits">
            <h2>Key Outcomes</h2>
            <div class="care-benefits-grid">
              ${benefitsHTML}
            </div>
          </section>

          <!-- SLOT: AFTER BENEFITS -->
          <div id="slot-after-benefits"></div>

          <!-- OVERLAY -->
          ${overlayHTML}

          <!-- SLOT: AFTER OVERLAY -->
          <div id="slot-after-overlay"></div>

          <!-- FAQ -->
          <section class="care-faq">
            <h2>Common Questions</h2>
            ${faqHTML}
          </section>

          <!-- SLOT: AFTER FAQ -->
          <div id="slot-after-faq"></div>

          <!-- BOTTOM CTA -->
          ${bottomHTML}

          <!-- SLOT: AFTER BOTTOM -->
          <div id="slot-after-bottom"></div>

        </div>
      `;

      console.log("✅ Care page rendered successfully.");

      // Inject slot templates
      injectSlotTemplates();

      // Activate FAQ accordion
      activateFAQ();

    })
    .catch(err => {
      console.error("🔥 Care Loader FAILED:", err);
      root.innerHTML = "<p>Error loading care content.</p>";
    });

})();
