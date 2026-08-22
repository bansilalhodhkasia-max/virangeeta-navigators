/*
============================================================
SCHOLAR PATH RUSSIA
UNIVERSITY EXPLORER — STABLE APPLICATION
Virangeeta Navigators
============================================================
This version is intentionally compatible with the current
index.html:
- #universitySearch
- #programmeFilter
- #cityFilter
- #universityResults
- #aiUniversity
- #aiQuestion
- #aiResult
- #askAIButton
============================================================
*/

(function () {
  "use strict";

  const DATA_URL = "./data/universities.json";
  const BRAND_NAME = "Scholar Path Russia";
  const BUSINESS_NAME = "Virangeeta Navigators";
  const LOGO_URL = "./logo.jpg";
  const APPLY_URL =
    "https://docs.google.com/forms/d/1lIqIdQQW0ORfNvPE1pR63_nSV4lORq_-bOJwnLPkS3M/viewform";

  let universities = [];
  let filteredUniversities = [];

  const $ = (id) => document.getElementById(id);

  const searchInput = $("universitySearch");
  const programmeFilter = $("programmeFilter");
  const cityFilter = $("cityFilter");
  const results = $("universityResults");
  const aiUniversity = $("aiUniversity");

  function clean(value) {
    return value === null || value === undefined
      ? ""
      : String(value).trim();
  }

  function normalize(value) {
    return clean(value).toLowerCase().replace(/\s+/g, " ");
  }

  function escapeHTML(value) {
    return clean(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function first(obj, keys) {
    for (const key of keys) {
      if (
        obj &&
        Object.prototype.hasOwnProperty.call(obj, key) &&
        clean(obj[key])
      ) {
        return obj[key];
      }
    }
    return "";
  }

  function resolveURL(value) {
    const url = clean(value);
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return new URL(url, window.location.href).href;
    }
    if (url.startsWith("assets/") || url.startsWith("data/")) {
      return new URL("./" + url, window.location.href).href;
    }
    return "https://" + url;
  }

  function courseOf(raw) {
    const text = normalize(
      [
        first(raw, ["course", "category", "program", "programme"]),
        Array.isArray(raw.fields) ? raw.fields.join(" ") : clean(raw.fields)
      ].join(" ")
    );

    if (
      /medicine|medical|mbbs|health|dentistry|pharmacy|clinical/.test(text)
    ) {
      return "Medicine";
    }
    if (/engineering|technical|polytechnic|aviation/.test(text)) {
      return "Engineering";
    }
    if (/information technology|informatics|computer|software|technology/.test(text)) {
      return "IT";
    }
    if (/business|finance|economic|management/.test(text)) {
      return "Business";
    }
    if (/law/.test(text)) return "Law";
    if (/humanities|arts|language|culture/.test(text)) return "Humanities";

    return clean(first(raw, ["category", "course", "program", "programme"])) || "Other";
  }

  function mediumOf(raw) {
    const value = first(raw, [
      "medium",
      "study_medium",
      "studyMedium",
      "language",
      "instruction_language",
      "instructionLanguage",
      "teaching_language",
      "teachingLanguage"
    ]);

    const text = normalize(value);
    if (!text) return "Not specified";
    if (text.includes("english") && text.includes("russian")) return "English / Russian";
    if (text.includes("english")) return "English";
    if (text.includes("russian")) return "Russian";
    if (text.includes("bilingual") || text.includes("mixed")) return "Bilingual / Mixed";
    return clean(value);
  }

  function scholarshipOf(raw) {
    const values = [
      first(raw, ["scholarship", "scholarship_status", "scholarshipStatus"]),
      first(raw, ["openDoors", "open_doors"]),
      first(raw, ["scholarshipPathway", "scholarship_pathway"]),
      first(raw, ["governmentScholarship", "government_scholarship"])
    ];

    for (const value of values) {
      const text = normalize(value);
      if (!text) continue;
      if (
        /yes|available|listed|present|eligible|offered|provided|supported/.test(text) ||
        text.includes("scholarship") ||
        text.includes("government") ||
        text.includes("open door")
      ) {
        return "yes";
      }
    }
    return "no";
  }

  function verificationOf(raw) {
    const explicit = normalize(
      first(raw, ["verification_status", "verificationStatus", "status"])
    );

    if (explicit.includes("verified") && !explicit.includes("not")) {
      return "Verified";
    }
    if (explicit.includes("partial")) return "Partially verified";
    if (explicit.includes("unverified") || explicit.includes("not verified")) {
      return "Not verified";
    }
    if (
      first(raw, ["last_verified", "lastVerified"]) ||
      first(raw, ["official_source", "officialSource", "source"])
    ) {
      return "Source listed";
    }
    return "Needs verification";
  }

  function normalizeUniversity(raw, index) {
    const fields = Array.isArray(raw.fields)
      ? raw.fields.map(clean).filter(Boolean)
      : clean(raw.fields)
        ? [clean(raw.fields)]
        : [];

    return {
      id: clean(first(raw, ["id"])) || "university-" + (index + 1),
      name:
        clean(first(raw, ["name", "university", "university_name", "title"])) ||
        "University information pending",
      city:
        clean(first(raw, ["city"])) ||
        clean(first(raw, ["location"])) ||
        "City/region to be verified",
      region: clean(first(raw, ["region", "oblast", "republic", "state"])),
      country: clean(first(raw, ["country"])) || "Russia",
      established: clean(first(raw, ["established", "founded", "year_established"])),
      about: clean(first(raw, ["about", "description", "summary"])),
      fields,
      course: courseOf(raw),
      medium: mediumOf(raw),
      scholarship: scholarshipOf(raw),
      tuition: clean(first(raw, ["tuition_fee", "tuitionFee", "tuition", "fee"])),
      hostel: clean(first(raw, ["hostel_fee", "hostelFee", "hostel", "hostel_cost"])),
      tuitionStatus: clean(first(raw, ["tuition_status", "tuitionStatus"])),
      hostelStatus: clean(first(raw, ["hostel_status", "hostelStatus"])),
      website: resolveURL(first(raw, [
        "official_website",
        "officialWebsite",
        "website",
        "url"
      ])),
      feeSource: resolveURL(first(raw, [
        "official_fee_source",
        "officialFeeStructure",
        "official_fee_structure",
        "fee_source",
        "tuition_source"
      ])),
      source: resolveURL(first(raw, [
        "official_source",
        "officialSource",
        "source"
      ])),
      lastVerified: clean(first(raw, ["last_verified", "lastVerified"])),
      internationalStudents: clean(
        first(raw, ["international_students", "internationalStudents"])
      ),
      logo: resolveURL(first(raw, ["logo", "logo_url", "logoUrl"])),
      image: resolveURL(first(raw, [
        "image",
        "image_url",
        "imageUrl",
        "photo",
        "photo_url"
      ])),
      raw
    };
  }

  function locationOf(u) {
    return [u.city, u.region, u.country].filter(Boolean).join(" • ");
  }
    function formatValue(value, fallback = "Not available") {
    const v = clean(value);
    return v || fallback;
  }

  function verificationBadge(u) {
    const status = u.lastVerified
      ? "Verified source date available"
      : verificationOf(u);

    return `
      <span class="sp-verification-badge">
        ✓ ${escapeHTML(status)}
      </span>
    `;
  }

  function scholarshipBadge(u) {
    if (u.scholarship === "yes") {
      return `
        <span class="sp-badge sp-badge-green">
          Scholarship information listed
        </span>
      `;
    }

    return `
      <span class="sp-badge">
        Scholarship: verify current availability
      </span>
    `;
  }

  function universityCard(u) {
    const logo = u.logo || LOGO_URL;

    return `
      <article class="sp-university-card"
        data-university-id="${escapeHTML(u.id)}">

        <div class="sp-card-top">

          <div class="sp-university-logo-wrap">
            <img
              class="sp-university-logo"
              src="${escapeHTML(logo)}"
              alt="${escapeHTML(u.name)} logo"
              loading="lazy"
              onerror="this.onerror=null;this.src='${LOGO_URL}'"
            >
          </div>

          <div class="sp-university-heading">
            <div class="sp-card-label">
              ${escapeHTML(u.course)}
            </div>

            <h3>${escapeHTML(u.name)}</h3>

            <p class="sp-location">
              📍 ${escapeHTML(locationOf(u))}
            </p>
          </div>

        </div>

        <div class="sp-card-badges">
          <span class="sp-badge">
            ${escapeHTML(u.medium)}
          </span>

          ${scholarshipBadge(u)}

          ${verificationBadge(u)}
        </div>

        <div class="sp-card-description">
          ${
            escapeHTML(
              u.about ||
              "University profile information is being compiled from official and published sources."
            )
          }
        </div>

        <div class="sp-card-data">

          <div class="sp-data-item">
            <small>Programme</small>
            <strong>${escapeHTML(u.course)}</strong>
          </div>

          <div class="sp-data-item">
            <small>Tuition</small>
            <strong>${escapeHTML(
              formatValue(u.tuition, "See official fee source")
            )}</strong>
          </div>

          <div class="sp-data-item">
            <small>Hostel</small>
            <strong>${escapeHTML(
              formatValue(u.hostel, "See official source")
            )}</strong>
          </div>

          <div class="sp-data-item">
            <small>Instruction</small>
            <strong>${escapeHTML(u.medium)}</strong>
          </div>

        </div>

        <div class="sp-card-actions">

          <button
            type="button"
            class="sp-btn sp-btn-primary"
            data-action="view"
            data-id="${escapeHTML(u.id)}">
            View university →
          </button>

          ${
            u.website
              ? `
                <a
                  class="sp-btn sp-btn-secondary"
                  href="${escapeHTML(u.website)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Official website ↗
                </a>
              `
              : ""
          }

        </div>

      </article>
    `;
  }

  function emptyState(message) {
    return `
      <div class="sp-empty-state">
        <div class="sp-empty-icon">⌕</div>

        <h3>No matching universities found</h3>

        <p>${escapeHTML(message)}</p>

        <button
          type="button"
          class="sp-btn sp-btn-primary"
          id="spClearSearch">
          Clear search
        </button>
      </div>
    `;
  }

  function loadingState() {
    return `
      <div class="sp-loading-state">
        <div class="sp-spinner"></div>
        <p>Loading the university database…</p>
      </div>
    `;
  }

  function errorState() {
    return `
      <div class="sp-empty-state sp-error-state">

        <div class="sp-empty-icon">!</div>

        <h3>University database unavailable</h3>

        <p>
          The university data could not be loaded right now.
          Please refresh the page or try again shortly.
        </p>

        <button
          type="button"
          class="sp-btn sp-btn-primary"
          id="spRetry">
          Try again
        </button>

      </div>
    `;
  }

  function populateFilters() {
    if (!programmeFilter && !cityFilter) return;

    const programmes = new Set();
    const cities = new Set();

    universities.forEach((u) => {
      if (u.course) programmes.add(u.course);
      if (u.city) cities.add(u.city);
    });

    if (programmeFilter) {
      const current = programmeFilter.value;

      programmeFilter.innerHTML = `
        <option value="">All programmes</option>
        ${Array.from(programmes)
          .sort((a, b) => a.localeCompare(b))
          .map(
            (p) =>
              `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`
          )
          .join("")}
      `;

      if (
        Array.from(programmes)
          .map(normalize)
          .includes(normalize(current))
      ) {
        programmeFilter.value = current;
      }
    }

    if (cityFilter) {
      const current = cityFilter.value;

      cityFilter.innerHTML = `
        <option value="">All cities</option>
        ${Array.from(cities)
          .sort((a, b) => a.localeCompare(b))
          .map(
            (city) =>
              `<option value="${escapeHTML(city)}">${escapeHTML(city)}</option>`
          )
          .join("")}
      `;

      if (
        Array.from(cities)
          .map(normalize)
          .includes(normalize(current))
      ) {
        cityFilter.value = current;
      }
    }
  }

  function searchUniversities() {
    const query = normalize(searchInput ? searchInput.value : "");
    const programme = normalize(
      programmeFilter ? programmeFilter.value : ""
    );
    const city = normalize(cityFilter ? cityFilter.value : "");

    filteredUniversities = universities.filter((u) => {
      const searchable = normalize(
        [
          u.name,
          u.city,
          u.region,
          u.country,
          u.course,
          u.medium,
          u.about,
          u.fields.join(" ")
        ].join(" ")
      );

      const matchesQuery =
        !query ||
        searchable.includes(query);

      const matchesProgramme =
        !programme ||
        normalize(u.course) === programme;

      const matchesCity =
        !city ||
        normalize(u.city) === city;

      return (
        matchesQuery &&
        matchesProgramme &&
        matchesCity
      );
    });

    renderUniversities();
  }

  function renderUniversities() {
    if (!results) return;

    if (!filteredUniversities.length) {
      results.innerHTML = emptyState(
        "Try a different university name, programme or city."
      );
      attachDynamicButtons();
      return;
    }

    results.innerHTML = `
      <div class="sp-results-header">

        <div>
          <span class="sp-results-kicker">
            UNIVERSITY DATABASE
          </span>

          <h2>
            ${filteredUniversities.length}
            ${
              filteredUniversities.length === 1
                ? "university"
                : "universities"
            }
            found
          </h2>
        </div>

        <div class="sp-results-note">
          Source-first information
        </div>

      </div>

      <div class="sp-university-grid">
        ${filteredUniversities
          .map(universityCard)
          .join("")}
      </div>
    `;

    attachDynamicButtons();
  }

  function attachDynamicButtons() {
    document
      .querySelectorAll('[data-action="view"]')
      .forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          openUniversity(id);
        });
      });

    const clearButton = $("spClearSearch");

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (programmeFilter) programmeFilter.value = "";
        if (cityFilter) cityFilter.value = "";

        searchUniversities();

        const explorer = document.querySelector(
          "#universityExplorer"
        );

        if (explorer) {
          explorer.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
      });
    }

    const retryButton = $("spRetry");

    if (retryButton) {
      retryButton.addEventListener("click", loadUniversities);
    }
  }

  function openUniversity(id) {
    const university = universities.find(
      (u) => String(u.id) === String(id)
    );

    if (!university) return;

    const existing = $("spUniversityModal");

    if (existing) existing.remove();

    const modal = document.createElement("div");

    modal.id = "spUniversityModal";
    modal.className = "sp-modal";

    const image =
      university.image ||
      university.logo ||
      LOGO_URL;

    modal.innerHTML = `
      <div class="sp-modal-backdrop" data-close-modal></div>

      <div
        class="sp-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spModalTitle">

        <button
          type="button"
          class="sp-modal-close"
          aria-label="Close"
          data-close-modal>
          ×
        </button>

        <div class="sp-modal-header">

          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(university.name)}"
            class="sp-modal-logo"
            loading="lazy"
            onerror="this.onerror=null;this.src='${LOGO_URL}'"
          >

          <div>
            <span class="sp-card-label">
              ${escapeHTML(university.course)}
            </span>

            <h2 id="spModalTitle">
              ${escapeHTML(university.name)}
            </h2>

            <p>
              📍 ${escapeHTML(locationOf(university))}
            </p>
          </div>

        </div>

        <div class="sp-modal-badges">
          <span class="sp-badge">
            ${escapeHTML(university.medium)}
          </span>

          ${scholarshipBadge(university)}

          ${verificationBadge(university)}
        </div>

        <div class="sp-modal-section">

          <h3>About the university</h3>

          <p>
            ${escapeHTML(
              university.about ||
              "No extended description has been published in the current database."
            )}
          </p>

        </div>

        <div class="sp-modal-grid">

          <div>
            <small>Programme area</small>
            <strong>${escapeHTML(university.course)}</strong>
          </div>

          <div>
            <small>Language / medium</small>
            <strong>${escapeHTML(university.medium)}</strong>
          </div>

          <div>
            <small>Tuition</small>
            <strong>${escapeHTML(
              formatValue(
                university.tuition,
                "Not currently published"
              )
            )}</strong>
          </div>

          <div>
            <small>Hostel</small>
            <strong>${escapeHTML(
              formatValue(
                university.hostel,
                "Not currently published"
              )
            )}</strong>
          </div>

          <div>
            <small>International students</small>
            <strong>${escapeHTML(
              formatValue(
                university.internationalStudents,
                "Not currently published"
              )
            )}</strong>
          </div>

          <div>
            <small>Last verified</small>
            <strong>${escapeHTML(
              formatValue(
                university.lastVerified,
                "Verification date not listed"
              )
            )}</strong>
          </div>

        </div>

        <div class="sp-modal-section">

          <h3>Available study fields</h3>

          ${
            university.fields.length
              ? `
                <div class="sp-field-list">
                  ${university.fields
                    .map(
                      (field) =>
                        `<span>${escapeHTML(field)}</span>`
                    )
                    .join("")}
                </div>
              `
              : `
                <p>
                  Programme details are being compiled.
                </p>
              `
          }

        </div>

        <div class="sp-source-box">

          <strong>Verification principle</strong>

          <p>
            Scholar Path Russia does not treat an unverified claim
            as an official fact. Always confirm current admission,
            tuition, recognition and regulatory requirements with
            the relevant official authority before applying.
          </p>

        </div>

        <div class="sp-modal-actions">

          ${
            university.website
              ? `
                <a
                  class="sp-btn sp-btn-primary"
                  href="${escapeHTML(university.website)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Official university website ↗
                </a>
              `
              : ""
          }

          ${
            university.feeSource
              ? `
                <a
                  class="sp-btn sp-btn-secondary"
                  href="${escapeHTML(university.feeSource)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Official fee source ↗
                </a>
              `
              : ""
          }

          ${
            university.source
              ? `
                <a
                  class="sp-btn sp-btn-secondary"
                  href="${escapeHTML(university.source)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Source / verification ↗
                </a>
              `
              : ""
          }

          <a
            class="sp-btn sp-btn-dark"
            href="${APPLY_URL}"
            target="_blank"
            rel="noopener noreferrer">
            Enquire about this university →
          </a>

        </div>

      </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });

    modal
      .querySelectorAll("[data-close-modal]")
      .forEach((element) => {
        element.addEventListener("click", closeUniversityModal);
      });

    document.addEventListener(
      "keydown",
      handleModalEscape,
      { once: true }
    );

    document.body.classList.add("sp-modal-open");
  }

  function handleModalEscape(event) {
    if (event.key === "Escape") {
      closeUniversityModal();
    }
  }

  function closeUniversityModal() {
    const modal = $("spUniversityModal");

    if (!modal) return;

    modal.classList.remove("is-open");

    setTimeout(() => {
      modal.remove();
      document.body.classList.remove("sp-modal-open");
    }, 180);
  }

  async function loadUniversities() {
    if (results) {
      results.innerHTML = loadingState();
    }

    try {
      const response = await fetch(
        DATA_URL + "?v=" + Date.now(),
        {
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          "University data request failed: " +
          response.status
        );
      }

      const data = await response.json();

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.universities)) {
        list = data.universities;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      } else {
        throw new Error(
          "universities.json does not contain an array."
        );
      }

      universities = list.map(normalizeUniversity);

      filteredUniversities = universities.slice();

      populateFilters();
      renderUniversities();

      populateAIUniversities();

    } catch (error) {
      console.error(
        "[Scholar Path Russia] Database error:",
        error
      );

      universities = [];
      filteredUniversities = [];

      if (results) {
        results.innerHTML = errorState();
      }

      if (aiUniversity) {
        aiUniversity.innerHTML =
          `<option value="">Database unavailable</option>`;
      }
    }
  }  function populateAIUniversities() {
    if (!aiUniversity) return;

    if (!universities.length) {
      aiUniversity.innerHTML =
        `<option value="">No universities available</option>`;
      return;
    }

    aiUniversity.innerHTML = `
      <option value="">Select a university</option>
      ${universities
        .map(
          (u) => `
            <option value="${escapeHTML(u.id)}">
              ${escapeHTML(u.name)}
            </option>
          `
        )
        .join("")}
    `;
  }

  function getSelectedUniversity() {
    if (!aiUniversity) return null;

    const id = aiUniversity.value;

    if (!id) return null;

    return universities.find(
      (u) => String(u.id) === String(id)
    ) || null;
  }

  function setAIStatus(message, type = "normal") {
    if (!aiResult) return;

    const className =
      type === "error"
        ? "sp-ai-result sp-ai-error"
        : "sp-ai-result";

    aiResult.className = className;

    aiResult.innerHTML = `
      <div class="sp-ai-result-header">
        <div class="sp-ai-icon">✦</div>
        <strong>Scholar Path AI</strong>
      </div>

      <div class="sp-ai-result-content">
        ${message}
      </div>
    `;
  }

  function setAILoading() {
    setAIStatus(`
      <div class="sp-ai-loading">

        <div class="sp-ai-loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p>
          Scholar Path AI is checking the available
          university information…
        </p>

      </div>
    `);
  }

  function aiAnswerFromDatabase(university, question) {
    const q = normalize(question);

    if (!university) {
      return `
        <p>
          Please select a university first. Scholar Path AI
          uses the selected university profile to provide a
          more specific answer.
        </p>
      `;
    }

    const name = escapeHTML(university.name);
    const city = escapeHTML(locationOf(university));
    const course = escapeHTML(university.course);
    const medium = escapeHTML(university.medium);

    if (
      q.includes("fee") ||
      q.includes("tuition") ||
      q.includes("cost")
    ) {
      return `
        <h4>Tuition and cost</h4>

        <p>
          The current database lists the tuition information
          for <strong>${name}</strong> as:
        </p>

        <div class="sp-ai-highlight">
          ${escapeHTML(
            formatValue(
              university.tuition,
              "Not currently published in the database"
            )
          )}
        </div>

        <p>
          Tuition fees can change by academic year or
          programme. Always verify the current fee schedule
          from the university's official source before
          making a payment.
        </p>

        ${
          university.feeSource
            ? `
              <a
                href="${escapeHTML(university.feeSource)}"
                target="_blank"
                rel="noopener noreferrer"
                class="sp-ai-source-link">
                View official fee source ↗
              </a>
            `
            : ""
        }
      `;
    }

    if (
      q.includes("hostel") ||
      q.includes("accommodation") ||
      q.includes("room")
    ) {
      return `
        <h4>Accommodation</h4>

        <p>
          For <strong>${name}</strong>, the current database
          records:
        </p>

        <div class="sp-ai-highlight">
          ${escapeHTML(
            formatValue(
              university.hostel,
              "Accommodation information is not currently published"
            )
          )}
        </div>

        <p>
          Hostel availability, room type and prices should be
          confirmed directly with the university.
        </p>
      `;
    }

    if (
      q.includes("scholarship") ||
      q.includes("funding") ||
      q.includes("stipend")
    ) {
      return `
        <h4>Scholarship information</h4>

        <p>
          ${
            university.scholarship === "yes"
              ? `
                Scholarship information is listed for
                <strong>${name}</strong>.
              `
              : `
                The current database does not mark a specific
                scholarship as confirmed for <strong>${name}</strong>.
              `
          }
        </p>

        <p>
          Scholarship availability, eligibility, funding
          coverage and deadlines may depend on the programme,
          nationality and academic year. Verify the current
          conditions from the official scholarship or
          university source.
        </p>
      `;
    }

    if (
      q.includes("admission") ||
      q.includes("apply") ||
      q.includes("application") ||
      q.includes("requirement")
    ) {
      return `
        <h4>Admission guidance</h4>

        <p>
          <strong>${name}</strong> is listed in Scholar Path
          Russia for <strong>${course}</strong>.
        </p>

        <p>
          Before applying, verify the current admission
          requirements, application deadlines, academic
          documents, language requirements, medical
          requirements and regulatory requirements with the
          relevant official authorities.
        </p>

        <ul class="sp-ai-list">
          <li>Confirm the exact programme.</li>
          <li>Check current eligibility requirements.</li>
          <li>Check the current application deadline.</li>
          <li>Verify required documents.</li>
          <li>Verify tuition and accommodation costs.</li>
          <li>Check applicable recognition or licensing requirements.</li>
        </ul>
      `;
    }

    if (
      q.includes("mbbs") ||
      q.includes("medicine") ||
      q.includes("medical")
    ) {
      return `
        <h4>Medical programme</h4>

        <p>
          The current profile lists
          <strong>${course}</strong> at
          <strong>${name}</strong>.
        </p>

        <div class="sp-ai-highlight">
          Location: ${city}<br>
          Instruction / medium: ${medium}
        </div>

        <p>
          For medical education, do not rely only on a
          university advertisement. Verify the current
          regulatory, recognition, licensing and examination
          requirements applicable to your country and future
          practice destination.
        </p>
      `;
    }

    if (
      q.includes("city") ||
      q.includes("location") ||
      q.includes("where")
    ) {
      return `
        <h4>University location</h4>

        <p>
          <strong>${name}</strong> is located in
          <strong>${city}</strong>.
        </p>

        <p>
          When comparing cities, consider accommodation,
          transportation, climate, living expenses, student
          population and access to university services.
        </p>
      `;
    }

    if (
      q.includes("verify") ||
      q.includes("official") ||
      q.includes("genuine") ||
      q.includes("authentic")
    ) {
      return `
        <h4>How to verify this university</h4>

        <p>
          Scholar Path Russia follows a source-first approach.
          Important claims should be checked against the
          relevant official source.
        </p>

        <ul class="sp-ai-list">
          <li>Official university website</li>
          <li>Official programme information</li>
          <li>Published fee information</li>
          <li>Official scholarship information</li>
          <li>Applicable regulatory information</li>
          <li>Current admission requirements</li>
        </ul>

        <p>
          A listing on Scholar Path Russia should not itself
          be treated as an approval, accreditation or
          guarantee.
        </p>
      `;
    }

    return `
      <h4>About ${name}</h4>

      <p>
        ${escapeHTML(
          university.about ||
          "The current database contains limited information about this university."
        )}
      </p>

      <div class="sp-ai-highlight">

        <strong>Programme:</strong>
        ${course}

        <br><br>

        <strong>Location:</strong>
        ${city}

        <br><br>

        <strong>Instruction:</strong>
        ${medium}

      </div>

      <p>
        Ask about fees, admission, scholarships, hostel,
        documents, medical programmes, recognition or
        verification to get a more specific answer.
      </p>
    `;
  }

  async function askScholarPathAI() {
    const university = getSelectedUniversity();

    const question =
      aiQuestion
        ? aiQuestion.value.trim()
        : "";

    if (!university) {
      setAIStatus(
        `
          <p>
            Please select a university before asking Scholar
            Path AI a question.
          </p>
        `,
        "error"
      );

      if (aiUniversity) {
        aiUniversity.focus();
      }

      return;
    }

    if (!question) {
      setAIStatus(
        `
          <p>
            Please enter your question first.
          </p>
        `,
        "error"
      );

      if (aiQuestion) {
        aiQuestion.focus();
      }

      return;
    }

    setAILoading();

    await new Promise((resolve) =>
      setTimeout(resolve, 350)
    );

    try {
      const answer = aiAnswerFromDatabase(
        university,
        question
      );

      setAIStatus(answer);

    } catch (error) {
      console.error(
        "[Scholar Path Russia] AI error:",
        error
      );

      setAIStatus(
        `
          <p>
            Scholar Path AI could not process this question
            right now. Please try again.
          </p>
        `,
        "error"
      );
    }
  }

  function setupQuickQuestions() {
    const quickQuestions =
      document.querySelectorAll(
        "[data-ai-question]"
      );

    quickQuestions.forEach((button) => {
      button.addEventListener("click", () => {

        const question =
          button.getAttribute(
            "data-ai-question"
          );

        if (!question) return;

        if (aiQuestion) {
          aiQuestion.value = question;
          aiQuestion.focus();
        }

        const aiSection =
          document.querySelector(
            "#scholarPathAI"
          );

        if (aiSection) {
          aiSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
      });
    });
  }

  function setupExplorer() {

    if (searchButton) {
      searchButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          searchUniversities();
        }
      );
    }

    if (searchInput) {
      searchInput.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            searchUniversities();
          }
        }
      );

      searchInput.addEventListener(
        "input",
        () => {
          if (
            searchInput.value.trim() === ""
          ) {
            searchUniversities();
          }
        }
      );
    }

    if (programmeFilter) {
      programmeFilter.addEventListener(
        "change",
        searchUniversities
      );
    }

    if (cityFilter) {
      cityFilter.addEventListener(
        "change",
        searchUniversities
      );
    }
  }

  function setupAI() {

    if (aiButton) {
      aiButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          askScholarPathAI();
        }
      );
    }

    if (aiQuestion) {
      aiQuestion.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Enter" &&
            (event.ctrlKey || event.metaKey)
          ) {
            event.preventDefault();
            askScholarPathAI();
          }

        }
      );
    }

    setupQuickQuestions();
  }

  function setupNavigation() {

    document
      .querySelectorAll(
        'a[href^="#"]'
      )
      .forEach((link) => {

        link.addEventListener(
          "click",
          (event) => {

            const targetId =
              link
                .getAttribute("href")
                ?.replace("#", "");

            if (!targetId) return;

            const target =
              document.getElementById(
                targetId
              );

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }
        );

      });

  }

  function setupGlobalErrors() {

    window.addEventListener(
      "error",
      (event) => {

        console.error(
          "[Scholar Path Russia]",
          event.error || event.message
        );

      }
    );

    window.addEventListener(
      "unhandledrejection",
      (event) => {

        console.error(
          "[Scholar Path Russia] Unhandled promise:",
          event.reason
        );

      }
    );

  }

  function initializeScholarPath() {

    setupExplorer();

    setupAI();

    setupNavigation();

    setupGlobalErrors();

    loadUniversities();

  }

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeScholarPath
    );

  } else {

    initializeScholarPath();

  }
