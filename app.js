/* =========================================================
   SCHOLAR PATH RUSSIA
   University Explorer
   Virangeeta Navigators
   ========================================================= */

(function () {
  "use strict";

  const DATA_URL = "data/universities.json";

  const grid = document.getElementById("universityGrid");
  const recordCount = document.getElementById("recordCount");

  const courseFilter = document.getElementById("courseFilter");
  const cityFilter = document.getElementById("cityFilter");
  const mediumFilter = document.getElementById("mediumFilter");
  const scholarshipFilter = document.getElementById("scholarshipFilter");

  let universities = [];

  /* ---------------------------------------------------------
     NORMALIZE DATABASE
     --------------------------------------------------------- */

  function normalizeUniversity(u) {
    return {
      name: u.name || "University information pending",
      city: u.city || "City/region to be verified",
      category: u.category || "Other",
      course: getCourse(u),
      medium: getMedium(u),
      scholarship: getScholarship(u),
      officialWebsite: u.officialWebsite || "",
      officialFeeStructure: u.officialFeeStructure || "",
      hostelInformation: u.hostelInformation || "",
      officialSource: u.officialSource || "",
      lastVerified: u.lastVerified || "",
      studyInRussiaListed: u.studyInRussiaListed !== false
    };
  }

  function getCourse(u) {
    const text = (
      (u.name || "") +
      " " +
      (u.category || "") +
      " " +
      (u.program || "")
    ).toLowerCase();

    if (
      text.includes("medical") ||
      text.includes("medicine") ||
      text.includes("health")
    ) {
      return "Medicine";
    }

    if (
      text.includes("technical") ||
      text.includes("engineering") ||
      text.includes("polytechnic") ||
      text.includes("aviation")
    ) {
      return "Engineering";
    }

    if (
      text.includes("technology") ||
      text.includes("itmo") ||
      text.includes("electronic") ||
      text.includes("informatics")
    ) {
      return "IT";
    }

    if (
      text.includes("economic") ||
      text.includes("business") ||
      text.includes("finance")
    ) {
      return "Business";
    }

    if (
      text.includes("law")
    ) {
      return "Law";
    }

    return "Other";
  }

  function getMedium(u) {
    const value = String(
      u.englishPrograms ||
      u.language ||
      ""
    ).toLowerCase();

    if (value.includes("english")) {
      return "English";
    }

    if (value.includes("russian")) {
      return "Russian";
    }

    return "Check official source";
  }

  function getScholarship(u) {
    const value = String(u.scholarship || "").toLowerCase();

    if (
      value &&
      value !== "none" &&
      value !== "not listed" &&
      value !== "n/a"
    ) {
      return "yes";
    }

    return "no";
  }

  /* ---------------------------------------------------------
     LOAD DATABASE
     --------------------------------------------------------- */

  async function loadUniversities() {
    try {
      const response = await fetch(DATA_URL, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("University database could not be loaded.");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        universities = data.map(normalizeUniversity);
      } else if (Array.isArray(data.universities)) {
        universities = data.universities.map(normalizeUniversity);
      } else {
        throw new Error("Invalid university database format.");
      }

      populateCities();
      renderUniversities();

    } catch (error) {
      console.error(error);

      if (recordCount) {
        recordCount.textContent =
          "University database could not be loaded.";
      }

      if (grid) {
        grid.innerHTML = `
          <article class="university-card">
            <h3>University database temporarily unavailable</h3>
            <p class="location">
              Please refresh the page. If the problem continues,
              the database source should be checked.
            </p>
          </article>
        `;
      }
    }
  }

  /* ---------------------------------------------------------
     CITY FILTER
     --------------------------------------------------------- */

  function populateCities() {
    if (!cityFilter) return;

    const cities = [
      ...new Set(
        universities
          .map(u => u.city)
          .filter(city =>
            city &&
            city !== "City/region to be verified"
          )
      )
    ].sort((a, b) => a.localeCompare(b));

    cityFilter.innerHTML =
      `<option value="">All cities</option>` +
      cities
        .map(city =>
          `<option value="${escapeHTML(city)}">${escapeHTML(city)}</option>`
        )
        .join("");
  }

  /* ---------------------------------------------------------
     FILTERING
     --------------------------------------------------------- */

  function getFilteredUniversities() {
    const course = courseFilter ? courseFilter.value : "";
    const city = cityFilter ? cityFilter.value : "";
    const medium = mediumFilter ? mediumFilter.value : "";
    const scholarship = scholarshipFilter
      ? scholarshipFilter.value
      : "";

    return universities.filter(u => {

      const courseMatch =
        !course ||
        u.course === course;

      const cityMatch =
        !city ||
        u.city === city;

      const mediumMatch =
        !medium ||
        u.medium === medium;

      const scholarshipMatch =
        !scholarship ||
        u.scholarship === scholarship;

      return (
        courseMatch &&
        cityMatch &&
        mediumMatch &&
        scholarshipMatch
      );
    });
  }

  /* ---------------------------------------------------------
     RENDER
     --------------------------------------------------------- */

  function renderUniversities() {
    if (!grid) return;

    const filtered = getFilteredUniversities();

    if (recordCount) {
      recordCount.textContent =
        filtered.length +
        (
          filtered.length === 1
            ? " university record"
            : " university records"
        );
    }

    if (!filtered.length) {
      grid.innerHTML = `
        <article class="university-card">
          <h3>No matching university found</h3>
          <p class="location">
            Try changing one or more filters.
          </p>
        </article>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map(createUniversityCard)
      .join("");
  }

  /* ---------------------------------------------------------
     UNIVERSITY CARD
     --------------------------------------------------------- */

  function createUniversityCard(u) {

    const officialWebsite =
      u.officialWebsite
        ? `
          <a
            href="${escapeAttribute(u.officialWebsite)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official university website ↗
          </a>
        `
        : "";

    const feeSource =
      u.officialFeeStructure
        ? `
          <a
            href="${escapeAttribute(u.officialFeeStructure)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official fee source ↗
          </a>
        `
        : "";

    const officialSource =
      u.officialSource
        ? `
          <a
            href="${escapeAttribute(u.officialSource)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Verification source ↗
          </a>
        `
        : "";

    const scholarshipBadge =
      u.scholarship === "yes"
        ? `<span class="badge green">Scholarship listed</span>`
        : "";

    return `
      <article class="university-card">

        <div class="badges">

          <span class="badge">
            UNIVERSITY RECORD
          </span>

          <span class="badge">
            ${escapeHTML(u.course)}
          </span>

          ${scholarshipBadge}

        </div>

        <h3>
          ${escapeHTML(u.name)}
        </h3>

        <div class="location">
          ${escapeHTML(u.city)}
        </div>

        <div class="info-row">

          <div class="info-box">
            <small>Study medium</small>
            <strong>
              ${escapeHTML(u.medium)}
            </strong>
          </div>

          <div class="info-box">
            <small>Tuition</small>
            <strong>
              Verify official fee
            </strong>
          </div>

          <div class="info-box">
            <small>Hostel</small>
            <strong>
              Verify official fee
            </strong>
          </div>

          <div class="info-box">
            <small>Scholarship</small>
            <strong>
              ${
                u.scholarship === "yes"
                  ? "Listed — verify eligibility"
                  : "Check officially"
              }
            </strong>
          </div>

        </div>

        <div class="verify-note">

          <strong>Verification status:</strong>
          Information requiring university-level confirmation
          is not presented as an official fee.

          ${
            u.lastVerified
              ? `<br>Database record: ${escapeHTML(u.lastVerified)}`
              : ""
          }

        </div>

        <div
          class="card-actions"
          style="display:flex;flex-wrap:wrap;gap:9px;margin-top:18px;"
        >

          ${officialWebsite}

          ${feeSource}

          ${officialSource}

          <a
            href="https://docs.google.com/forms/d/1lIqIdQQW00RfNvPE1pR63_nSV4lORq_-bOJwnLPkS3M/viewform"
            target="_blank"
            rel="noopener noreferrer"
            style="
              background:#117f76;
              color:white;
              border-color:#117f76;
            "
          >
            Apply / Register ↗
          </a>

        </div>

      </article>
    `;
  }

  /* ---------------------------------------------------------
     HTML SECURITY HELPERS
     --------------------------------------------------------- */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  /* ---------------------------------------------------------
     FILTER EVENTS
     --------------------------------------------------------- */

  [
    courseFilter,
    cityFilter,
    mediumFilter,
    scholarshipFilter
  ]
    .filter(Boolean)
    .forEach(element => {
      element.addEventListener(
        "change",
        renderUniversities
      );
    });

  /* ---------------------------------------------------------
     START
     --------------------------------------------------------- */

  loadUniversities();

})();
