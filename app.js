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
