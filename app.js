/*
============================================================
SCHOLAR PATH RUSSIA
University Explorer
Virangeeta Navigators

SOURCE-FIRST UNIVERSITY DISCOVERY PLATFORM
============================================================

IMPORTANT:
- This file does NOT invent university information.
- Information comes from data/universities.json.
- Official links are displayed where available.
- Missing information is clearly marked for verification.
- Existing university database structure is preserved.
============================================================
*/

(function () {
    "use strict";

    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const DATA_URL = "./data/universities.json";

    const BRAND_NAME = "Scholar Path Russia";
    const BUSINESS_NAME = "Virangeeta Navigators";

    const LOGO_URL = "./logo.jpg";

    const APPLY_URL =
        "https://docs.google.com/forms/d/1lIqIdQQW0ORfNvPE1pR63_nSV4lORq_-bOJwnLPkS3M/viewform";

    /* =========================================================
       DOM ELEMENTS
    ========================================================= */

    const grid =
        document.getElementById("universityGrid");

    const recordCount =
        document.getElementById("recordCount");

    const courseFilter =
        document.getElementById("courseFilter");

    const cityFilter =
        document.getElementById("cityFilter");

    const mediumFilter =
        document.getElementById("mediumFilter");

    const scholarshipFilter =
        document.getElementById("scholarshipFilter");

    /*
       We support several possible search IDs so the JavaScript
       remains compatible with different versions of index.html.
    */

    const searchInput =
        document.getElementById("universitySearch") ||
        document.getElementById("searchUniversity") ||
        document.getElementById("searchInput") ||
        document.querySelector(
            'input[placeholder*="university" i]'
        );

    let universities = [];

    let currentFilteredUniversities = [];

    /* =========================================================
       BASIC HELPERS
    ========================================================= */

    function clean(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value).trim();
    }

    function firstValue(obj, keys) {
        for (const key of keys) {
            if (
                obj &&
                Object.prototype.hasOwnProperty.call(
                    obj,
                    key
                ) &&
                clean(obj[key]) !== ""
            ) {
                return obj[key];
            }
        }

        return "";
    }

    function escapeHTML(value) {
        return String(
            value === undefined || value === null
                ? ""
                : value
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHTML(value);
    }

    function validURL(value) {
        const url = clean(value);

        if (!url) {
            return "";
        }

        if (
            url.startsWith("https://") ||
            url.startsWith("http://")
        ) {
            return url;
        }

        return "https://" + url;
    }

    function normalizeText(value) {
        return clean(value)
            .toLowerCase()
            .replace(/\s+/g, " ");
    }

    function safeDate(value) {
        const text = clean(value);

        if (!text) {
            return "";
        }

        return text;
    }

    /* =========================================================
       BRANDING
    ========================================================= */

    function setupBranding() {
        /*
           Do not replace the approved logo.
           We simply make sure the existing business identity
           has proper browser metadata.
        */

        let favicon =
            document.querySelector(
                'link[rel="icon"]'
            );

        if (!favicon) {
            favicon =
                document.createElement("link");

            favicon.rel = "icon";
            document.head.appendChild(favicon);
        }

        favicon.href = LOGO_URL;

        /*
           Apple/mobile icon.
        */

        let appleIcon =
            document.querySelector(
                'link[rel="apple-touch-icon"]'
            );

        if (!appleIcon) {
            appleIcon =
                document.createElement("link");

            appleIcon.rel =
                "apple-touch-icon";

            document.head.appendChild(
                appleIcon
            );
        }

        appleIcon.href = LOGO_URL;

        /*
           Professional browser title.
        */

        document.title =
            "Scholar Path Russia | Study • Compare • Decide";

        /*
           Basic description if index.html does not already
           provide one.
        */

        let description =
            document.querySelector(
                'meta[name="description"]'
            );

        if (!description) {
            description =
                document.createElement("meta");

            description.name = "description";

            document.head.appendChild(
                description
            );
        }

        description.content =
            "Scholar Path Russia — source-first university information for students comparing Russian universities, programmes, fees, scholarships, accommodation and admission information.";

        /*
           Make sure Open Graph identity exists.
        */

        setMetaProperty(
            "og:title",
            "Scholar Path Russia"
        );

        setMetaProperty(
            "og:description",
            "Study • Compare • Decide — source-first information for students choosing Russian universities."
        );

        setMetaProperty(
            "og:image",
            absoluteURL(LOGO_URL)
        );

        setMetaProperty(
            "og:type",
            "website"
        );
    }

    function setMetaProperty(property, content) {
        let element =
            document.querySelector(
                'meta[property="' +
                    property +
                    '"]'
            );

        if (!element) {
            element =
                document.createElement("meta");

            element.setAttribute(
                "property",
                property
            );

            document.head.appendChild(
                element
            );
        }

        element.setAttribute(
            "content",
            content
        );
    }

    function absoluteURL(path) {
        try {
            return new URL(
                path,
                window.location.href
            ).href;
        } catch (error) {
            return path;
        }
    }

    /*
       If the page does not already contain the business
       branding in a recognizable header, add a small
       professional brand marker.

       We deliberately avoid creating a second large header
       if your index.html already has one.
    */

    function ensureBusinessIdentity() {
        const existingBrand =
            document.querySelector(
                '[data-scholar-path-brand]'
            );

        if (existingBrand) {
            return;
        }

        const logoAlreadyVisible =
            document.querySelector(
                'header img[src*="logo"], nav img[src*="logo"]'
            );

        if (logoAlreadyVisible) {
            return;
        }

        const header =
            document.querySelector(
                "header"
            );

        if (!header) {
            return;
        }

        const brand =
            document.createElement("div");

        brand.setAttribute(
            "data-scholar-path-brand",
            "true"
        );

        brand.style.display = "flex";
        brand.style.alignItems = "center";
        brand.style.gap = "10px";
        brand.style.padding = "10px 16px";
        brand.style.fontFamily =
            "inherit";

        brand.innerHTML = `
            <img
                src="${escapeAttribute(LOGO_URL)}"
                alt="${escapeAttribute(BRAND_NAME)} logo"
                style="
                    width:42px;
                    height:42px;
                    object-fit:contain;
                    border-radius:10px;
                "
            >

            <div>
                <strong
                    style="
                        display:block;
                        font-size:16px;
                        line-height:1.2;
                    "
                >
                    ${escapeHTML(BRAND_NAME)}
                </strong>

                <span
                    style="
                        display:block;
                        font-size:10px;
                        letter-spacing:1.5px;
                        opacity:.65;
                        margin-top:3px;
                    "
                >
                    STUDY • COMPARE • DECIDE
                </span>
            </div>
        `;

        header.prepend(brand);
    }

    /* =========================================================
       COURSE / FIELD DETECTION
    ========================================================= */

    function getCourse(u) {
        const text = [
            firstValue(u, ["course"]),
            firstValue(u, ["category"]),
            firstValue(u, ["program"]),
            firstValue(u, ["programme"]),
            Array.isArray(u.fields)
                ? u.fields.join(" ")
                : ""
        ]
            .join(" ")
            .toLowerCase();

        if (
            text.includes("medicine") ||
            text.includes("medical") ||
            text.includes("mbbs") ||
            text.includes("health") ||
            text.includes("dentistry") ||
            text.includes("pharmacy") ||
            text.includes("clinical")
        ) {
            return "Medicine";
        }

        if (
            text.includes("engineering") ||
            text.includes("technical") ||
            text.includes("polytechnic") ||
            text.includes("aviation")
        ) {
            return "Engineering";
        }

        if (
            text.includes("technology") ||
            text.includes("information technology") ||
            text.includes("informatics") ||
            text.includes("computer") ||
            text.includes("electronic") ||
            text.includes("software")
        ) {
            return "IT";
        }

        if (
            text.includes("business") ||
            text.includes("finance") ||
            text.includes("economic") ||
            text.includes("management")
        ) {
            return "Business";
        }

        if (text.includes("law")) {
            return "Law";
        }

        if (
            text.includes("humanities") ||
            text.includes("arts") ||
            text.includes("language") ||
            text.includes("culture")
        ) {
            return "Humanities";
        }

        return (
            clean(
                firstValue(u, [
                    "category",
                    "course"
                ])
            ) || "Other"
        );
    }

    /* =========================================================
       STUDY MEDIUM
       FIXES THE MISSING getMedium() FUNCTION
    ========================================================= */

    function getMedium(u) {
        const value = firstValue(u, [
            "medium",
            "study_medium",
            "studyMedium",
            "language",
            "instruction_language",
            "instructionLanguage",
            "teaching_language",
            "teachingLanguage"
        ]);

        const text =
            normalizeText(value);

        if (!text) {
            return "Not specified";
        }

        if (
            text.includes("english") &&
            text.includes("russian")
        ) {
            return "English / Russian";
        }

        if (text.includes("english")) {
            return "English";
        }

        if (text.includes("russian")) {
            return "Russian";
        }

        if (
            text.includes("bilingual") ||
            text.includes("mixed")
        ) {
            return "Bilingual / Mixed";
        }

        return clean(value);
    }

    /* =========================================================
       SCHOLARSHIP
    ========================================================= */

    function getScholarship(u) {
        const values = [
            firstValue(u, [
                "scholarship",
                "scholarship_status",
                "scholarshipStatus"
            ]),

            firstValue(u, [
                "openDoors"
            ]),

            firstValue(u, [
                "scholarshipPathway"
            ]),

            firstValue(u, [
                "governmentScholarship"
            ])
        ];

        const positiveWords = [
            "yes",
            "available",
            "listed",
            "present",
            "eligible",
            "offered",
            "provided",
            "supported"
        ];

        const negativeWords = [
            "no",
            "none",
            "not listed",
            "not available",
            "unavailable",
            "n/a",
            "not verified",
            "unknown"
        ];

        for (const value of values) {
            const text =
                normalizeText(value);

            if (!text) {
                continue;
            }

            if (
                negativeWords.some(
                    word => text === word
                )
            ) {
                continue;
            }

            if (
                positiveWords.some(
                    word => text === word
                ) ||
                text.includes("scholarship") ||
                text.includes("government") ||
                text.includes("open door")
            ) {
                return "yes";
            }
        }

        return "no";
    }

    /* =========================================================
       VERIFICATION STATUS
    ========================================================= */

    function getVerificationStatus(u) {
        const explicit =
            firstValue(u, [
                "verification_status",
                "verificationStatus",
                "status"
            ]);

        const normalized =
            normalizeText(explicit);

        if (
            normalized.includes("verified") &&
            !normalized.includes("not")
        ) {
            return "verified";
        }

        if (
            normalized.includes("partial")
        ) {
            return "partial";
        }

        if (
            normalized.includes("unverified") ||
            normalized.includes("not verified")
        ) {
            return "unverified";
        }

        /*
           Existing database records have last_verified
           and source fields. That is useful evidence,
           but we do NOT call it fully verified automatically.
        */

        if (
            clean(u.last_verified) ||
            clean(
                firstValue(u, [
                    "official_source",
                    "officialSource"
                ])
            )
        ) {
            return "source-listed";
        }

        return "needs-review";
    }

    function verificationLabel(status) {
        switch (status) {
            case "verified":
                return "Verified";

            case "partial":
                return "Partially verified";

            case "source-listed":
                return "Source listed";

            case "unverified":
                return "Not verified";

            default:
                return "Needs verification";
        }
    }

    /* =========================================================
       NORMALIZE UNIVERSITY DATABASE
    ========================================================= */

    function normalizeUniversity(
        u,
        index
    ) {
        const name =
            firstValue(u, [
                "name",
                "university",
                "university_name",
                "title"
            ]) ||
            "University information pending";

        const city =
            firstValue(u, [
                "city",
                "location"
            ]) ||
            "City/region to be verified";

        const region =
            firstValue(u, [
                "region",
                "oblast",
                "republic",
                "state"
            ]);

        const country =
            firstValue(u, [
                "country"
            ]) ||
            "Russia";

        const established =
            firstValue(u, [
                "established",
                "founded",
                "year_established"
            ]);

        const about =
            firstValue(u, [
                "about",
                "description",
                "summary"
            ]);

        const fields =
            Array.isArray(u.fields)
                ? u.fields
                : clean(u.fields)
                    ? [clean(u.fields)]
                    : [];

        const officialWebsite =
            validURL(
                firstValue(u, [
                    "official_website",
                    "officialWebsite",
                    "website",
                    "url"
                ])
            );

        const officialFeeSource =
            validURL(
                firstValue(u, [
                    "official_fee_source",
                    "officialFeeStructure",
                    "official_fee_structure",
                    "fee_source",
                    "tuition_source"
                ])
            );

        const officialSource =
            validURL(
                firstValue(u, [
                    "official_source",
                    "officialSource",
                    "source"
                ])
            );

        const tuitionFee =
            firstValue(u, [
                "tuition_fee",
                "tuitionFee",
                "tuition",
                "fee"
            ]);

        const hostelFee =
            firstValue(u, [
                "hostel_fee",
                "hostelFee",
                "hostel",
                "hostel_cost"
            ]);

        const tuitionStatus =
            firstValue(u, [
                "tuition_status",
                "tuitionStatus"
            ]);

        const hostelStatus =
            firstValue(u, [
                "hostel_status",
                "hostelStatus"
            ]);

        const lastVerified =
            firstValue(u, [
                "last_verified",
                "lastVerified"
            ]);

        const internationalStudents =
            firstValue(u, [
                "international_students",
                "internationalStudents"
            ]);

        const logo =
            validURL(
                firstValue(u, [
                    "logo",
                    "logo_url",
                    "logoUrl"
                ])
            );

        const image =
            validURL(
                firstValue(u, [
                    "image",
                    "image_url",
                    "imageUrl",
                    "photo",
                    "photo_url"
                ])
            );

        const sources =
            Array.isArray(u.sources)
                ? u.sources
                : [];

        const verificationStatus =
            getVerificationStatus({
                ...u,
                last_verified:
                    lastVerified
            });

        return {
            id:
                clean(
                    firstValue(u, [
                        "id"
                    ])
                ) ||
                "university-" +
                    (index + 1),

            name:
                clean(name),

            city:
                clean(city),

            region:
                clean(region),

            country:
                clean(country),

            established:
                clean(established),

            about:
                clean(about),

            fields:
                fields,

            course:
                getCourse(u),

            medium:
                getMedium(u),

            scholarship:
                getScholarship(u),

            tuitionFee:
                clean(tuitionFee),

            hostelFee:
                clean(hostelFee),

            tuitionStatus:
                clean(tuitionStatus),

            hostelStatus:
                clean(hostelStatus),

            officialWebsite:
                officialWebsite,

            officialFeeSource:
                officialFeeSource,

            officialSource:
                officialSource,

            internationalStudents:
                clean(
                    internationalStudents
                ),

            lastVerified:
                clean(lastVerified),

            logo:
                logo,

            image:
                image,

            sources:
                sources,

            verificationStatus:
                verificationStatus,

            raw:
                u
        };
    }

    /* =========================================================
       LOAD DATABASE
    ========================================================= */

    async function loadUniversities() {
        try {
            const response =
                await fetch(
                    DATA_URL +
                        "?v=" +
                        Date.now(),
                    {
                        cache:
                            "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "University database could not be loaded."
                );
            }

            const data =
                await response.json();

            let rawUniversities =
                [];

            if (
                Array.isArray(data)
            ) {
                rawUniversities =
                    data;
            } else if (
                data &&
                Array.isArray(
                    data.universities
                )
            ) {
                rawUniversities =
                    data.universities;
            } else {
                throw new Error(
                    "Invalid university database format."
                );
            }

            universities =
                rawUniversities
                    .map(
                        normalizeUniversity
                    )
                    .filter(
                        u => u.name
                    );

            populateCities();

            updateFilterOptions();

            renderUniversities();

            updateStatistics();

        } catch (error) {
            console.error(
                "Scholar Path Russia:",
                error
            );

            if (recordCount) {
                recordCount.textContent =
                    "Database could not be loaded";
            }

            if (grid) {
                grid.innerHTML = `
                    <article class="university-card">
                        <h3>
                            University database unavailable
                        </h3>

                        <p class="location">
                            Please refresh the page.
                        </p>

                        <p>
                            If the problem continues,
                            check that
                            data/universities.json
                            exists and contains valid JSON.
                        </p>
                    </article>
                `;
            }
        }
    }

    /* =========================================================
       FILTER OPTIONS
    ========================================================= */

    function updateFilterOptions() {
        if (!courseFilter) {
            return;
        }

        const currentValue =
            courseFilter.value;

        const courses = [
            ...new Set(
                universities
                    .map(
                        u => u.course
                    )
                    .filter(Boolean)
            )
        ].sort(
            (a, b) =>
                a.localeCompare(b)
        );

        courseFilter.innerHTML =
            `<option value="">
                All courses
            </option>`;

        courses.forEach(
            course => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    course;

                option.textContent =
                    course;

                courseFilter.appendChild(
                    option
                );
            }
        );

        if (
            courses.includes(
                currentValue
            )
        ) {
            courseFilter.value =
                currentValue;
        }
    }

    function populateCities() {
        if (!cityFilter) {
            return;
        }

        const currentValue =
            cityFilter.value;

        const cities = [
            ...new Set(
                universities
                    .map(
                        u =>
                            clean(
                                u.city
                            )
                    )
                    .filter(
                        city =>
                            city &&
                            city !==
                                "City/region to be verified"
                    )
            )
        ].sort(
            (a, b) =>
                a.localeCompare(b)
        );

        cityFilter.innerHTML =
            `<option value="">
                All cities
            </option>`;

        cities.forEach(
            city => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    city;

                option.textContent =
                    city;

                cityFilter.appendChild(
                    option
                );
            }
        );

        if (
            cities.includes(
                currentValue
            )
        ) {
            cityFilter.value =
                currentValue;
        }
    }

    /* =========================================================
       SEARCH
    ========================================================= */

    function getSearchTerm() {
        if (!searchInput) {
            return "";
        }

        return normalizeText(
            searchInput.value
        );
    }

    function searchMatches(
        university,
        term
    ) {
        if (!term) {
            return true;
        }

        const searchable = [
            university.name,
            university.city,
            university.region,
            university.country,
            university.course,
            university.medium,
            university.about,
            university.fields.join(" "),
            university.established
        ]
            .join(" ")
            .toLowerCase();

        return searchable.includes(
            term
        );
    }

    /* =========================================================
       FILTERING
    ========================================================= */

    function getFilteredUniversities() {
        const course =
            courseFilter
                ? clean(
                      courseFilter.value
                  )
                : "";

        const city =
            cityFilter
                ? clean(
                      cityFilter.value
                  )
                : "";

        const medium =
            mediumFilter
                ? clean(
                      mediumFilter.value
                  )
                : "";

        const scholarship =
            scholarshipFilter
                ? clean(
                      scholarshipFilter.value
                  )
                : "";

        const search =
            getSearchTerm();

        return universities.filter(
            u => {
                const courseMatch =
                    !course ||
                    u.course ===
                        course;

                const cityMatch =
                    !city ||
                    u.city ===
                        city;

                const mediumMatch =
                    !medium ||
                    u.medium ===
                        medium;

                const scholarshipMatch =
                    !scholarship ||
                    u.scholarship ===
                        scholarship;

                const searchMatch =
                    searchMatches(
                        u,
                        search
                    );

                return (
                    courseMatch &&
                    cityMatch &&
                    mediumMatch &&
                    scholarshipMatch &&
                    searchMatch
                );
            }
        );
    }

    /* =========================================================
       FEE DISPLAY
    ========================================================= */

    function feeDisplay(
        label,
        value,
        status,
        source
    ) {
        if (value) {
            return `
                <div class="info-box">
                    <small>
                        ${escapeHTML(label)}
                    </small>

                    <strong>
                        ${escapeHTML(value)}
                    </strong>

                    ${
                        status
                            ? `
                                <span class="small-note">
                                    ${escapeHTML(
                                        status
                                    )}
                                </span>
                            `
                            : ""
                    }

                    ${
                        source
                            ? `
                                <a
                                    href="${escapeAttribute(
                                        source
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="mini-link"
                                >
                                    Official source ↗
                                </a>
                            `
                            : `
                                <span class="small-note">
                                    Source not listed
                                </span>
                            `
                    }
                </div>
            `;
        }

        return `
            <div class="info-box">
                <small>
                    ${escapeHTML(label)}
                </small>

                <strong>
                    Verify official fee
                </strong>

                ${
                    source
                        ? `
                            <a
                                href="${escapeAttribute(
                                    source
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="mini-link"
                            >
                                Official fee source ↗
                            </a>
                        `
                        : `
                            <span class="small-note">
                                Not available in database
                            </span>
                        `
                }
            </div>
        `;
    }

    /* =========================================================
       VERIFICATION BADGE
    ========================================================= */

    function verificationBadge(
        u
    ) {
        const status =
            u.verificationStatus;

        const label =
            verificationLabel(
                status
            );

        return `
            <span
                class="badge verification-badge"
                title="Verification status: ${escapeAttribute(
                    label
                )}"
            >
                ${escapeHTML(label)}
            </span>
        `;
    }

    /* =========================================================
       UNIVERSITY CARD
    ========================================================= */

    function createUniversityCard(
        u
    ) {
        const scholarshipBadge =
            u.scholarship === "yes"
                ? `
                    <span class="badge green">
                        Scholarship listed
                    </span>
                `
                : "";

        const websiteButton =
            u.officialWebsite
                ? `
                    <a
                        href="${escapeAttribute(
                            u.officialWebsite
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="card-link"
                    >
                        Official university website ↗
                    </a>
                `
                : "";

        const feeSourceButton =
            u.officialFeeSource
                ? `
                    <a
                        href="${escapeAttribute(
                            u.officialFeeSource
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="card-link"
                    >
                        Official fee source ↗
                    </a>
                `
                : "";

        const officialSourceButton =
            u.officialSource
                ? `
                    <a
                        href="${escapeAttribute(
                            u.officialSource
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="card-link"
                    >
                        Verification source ↗
                    </a>
                `
                : "";

        const applyButton = `
            <a
                href="${escapeAttribute(
                    APPLY_URL
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="apply-button"
            >
                Apply / Register ↗
            </a>
        `;

        const locationText = [
            u.city,
            u.region,
            u.country
        ]
            .filter(Boolean)
            .join(" • ");

        const established =
            u.established
                ? `
                    <p>
                        <strong>
                            Established:
                        </strong>
                        ${escapeHTML(
                            u.established
                        )}
                    </p>
                `
                : "";

        const about =
            u.about
                ? `
                    <p class="description">
                        ${escapeHTML(
                            u.about
                        )}
                    </p>
                `
                : "";

        const fields =
            u.fields.length
                ? `
                    <p class="description">
                        <strong>
                            Fields:
                        </strong>
                        ${escapeHTML(
                            u.fields.join(
                                ", "
                            )
                        )}
                    </p>
                `
                : "";

        const international =
            u.internationalStudents
                ? `
                    <p class="description">
                        <strong>
                            International students:
                        </strong>
                        ${escapeHTML(
                            u.internationalStudents
                        )}
                    </p>
                `
                : "";

        const verified =
            u.lastVerified
                ? `
                    <div class="verify-note">
                        <strong>
                            Last database verification:
                        </strong>
                        ${escapeHTML(
                            u.lastVerified
                        )}

                        <br>

                        <span>
                            Always confirm current
                            programme, fee and admission
                            requirements with official sources.
                        </span>
                    </div>
                `
                : `
                    <div class="verify-note">
                        <strong>
                            Verification:
                        </strong>
                        ${escapeHTML(
                            verificationLabel(
                                u.verificationStatus
                            )
                        )}

                        <br>

                        <span>
                            Confirm current details
                            with official sources.
                        </span>
                    </div>
                `;

        const universityLogo =
            u.logo ||
            LOGO_URL;

        const imageBlock =
            u.image
                ? `
                    <div
                        class="university-image"
                        style="
                            width:100%;
                            height:180px;
                            overflow:hidden;
                            border-radius:14px;
                            margin-bottom:16px;
                        "
                    >
                        <img
                            src="${escapeAttribute(
                                u.image
                            )}"
                            alt="${escapeAttribute(
                                u.name
                            )}"
                            loading="lazy"
                            style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                            "
                            onerror="
                                this.parentElement.style.display='none';
                            "
                        >
                    </div>
                `
                : "";

        return `
            <article
                class="university-card"
                data-university-id="${escapeAttribute(
                    u.id
                )}"
            >

                ${imageBlock}

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        margin-bottom:12px;
                    "
                >
                    <img
                        src="${escapeAttribute(
                            universityLogo
                        )}"
                        alt=""
                        loading="lazy"
                        style="
                            width:42px;
                            height:42px;
                            object-fit:contain;
                            border-radius:10px;
                        "
                        onerror="
                            this.style.display='none';
                        "
                    >

                    <div>
                        <small
                            style="
                                display:block;
                                letter-spacing:1px;
                                opacity:.65;
                            "
                        >
                            SCHOLAR PATH RUSSIA
                        </small>

                        <small
                            style="
                                display:block;
                                opacity:.6;
                            "
                        >
                            ${escapeHTML(
                                BUSINESS_NAME
                            )}
                        </small>
                    </div>
                </div>

                <div class="badges">

                    <span class="badge">
                        UNIVERSITY RECORD
                    </span>

                    <span class="badge">
                        ${escapeHTML(
                            u.course
                        )}
                    </span>

                    ${verificationBadge(u)}

                    ${scholarshipBadge}

                </div>

                <h3>
                    ${escapeHTML(
                        u.name
                    )}
                </h3>

                <div class="location">
                    ${escapeHTML(
                        locationText
                    )}
                </div>

                <div class="info-row">

                    <div class="info-box">
                        <small>
                            Study medium
                        </small>

                        <strong>
                            ${escapeHTML(
                                u.medium
                            )}
                        </strong>
                    </div>

                    ${feeDisplay(
                        "Tuition",
                        u.tuitionFee,
                        u.tuitionStatus,
                        u.officialFeeSource
                    )}

                    ${feeDisplay(
                        "Hostel",
                        u.hostelFee,
                        u.hostelStatus,
                        ""
                    )}

                    <div class="info-box">
                        <small>
                            Scholarship
                        </small>

                        <strong>
                            ${
                                u.scholarship ===
                                "yes"
                                    ? "Listed — verify eligibility"
                                    : "Check officially"
                            }
                        </strong>
                    </div>

                </div>

                <div class="university-details">

                    ${established}

                    ${about}

                    ${fields}

                    ${international}

                </div>

                ${verified}

                <div
                    class="card-actions"
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:9px;
                        margin-top:18px;
                    "
                >

                    <button
                        type="button"
                        class="card-link"
                        data-view-profile="${escapeAttribute(
                            u.id
                        )}"
                    >
                        View full profile
                    </button>

                    ${websiteButton}

                    ${feeSourceButton}

                    ${officialSourceButton}

                    ${applyButton}

                </div>

            </article>
        `;
    }

    /* =========================================================
       FULL UNIVERSITY PROFILE MODAL
    ========================================================= */

    function createProfileModal() {
        if (
            document.getElementById(
                "scholarPathProfileModal"
            )
        ) {
            return;
        }

        const modal =
            document.createElement(
                "div"
            );

        modal.id =
            "scholarPathProfileModal";

        modal.style.display =
            "none";

        modal.style.position =
            "fixed";

        modal.style.inset = "0";

        modal.style.zIndex =
            "99999";

        modal.style.background =
            "rgba(3,18,31,.78)";

        modal.style.padding =
            "20px";

        modal.style.overflowY =
            "auto";

        modal.innerHTML = `
            <div
                id="scholarPathProfilePanel"
                style="
                    max-width:900px;
                    margin:30px auto;
                    background:#fff;
                    border-radius:22px;
                    overflow:hidden;
                    box-shadow:0 30px 90px rgba(0,0,0,.25);
                "
            >
                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:20px;
                        padding:18px 22px;
                        background:#061a2b;
                        color:#fff;
                    "
                >

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                        "
                    >
                        <img
                            src="${escapeAttribute(
                                LOGO_URL
                            )}"
                            alt="Scholar Path Russia"
                            style="
                                width:44px;
                                height:44px;
                                object-fit:contain;
                                border-radius:10px;
                            "
                        >

                        <div>
                            <strong>
                                Scholar Path Russia
                            </strong>

                            <small
                                style="
                                    display:block;
                                    opacity:.7;
                                    margin-top:3px;
                                "
                            >
                                University Profile
                            </small>
                        </div>
                    </div>

                    <button
                        type="button"
                        id="closeScholarPathProfile"
                        aria-label="Close"
                        style="
                            border:0;
                            background:rgba(255,255,255,.12);
                            color:#fff;
                            width:40px;
                            height:40px;
                            border-radius:50%;
                            font-size:22px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>

                <div
                    id="scholarPathProfileContent"
                    style="padding:25px;"
                ></div>
            </div>
        `;

        document.body.appendChild(
            modal
        );

        document
            .getElementById(
                "closeScholarPathProfile"
            )
            .addEventListener(
                "click",
                closeProfileModal
            );

        modal.addEventListener(
            "click",
            function (event) {
                if (
                    event.target ===
                    modal
                ) {
                    closeProfileModal();
                }
            }
        );
    }

    function openProfileModal(
        id
    ) {
        const university =
            universities.find(
                u =>
                    String(u.id) ===
                    String(id)
            );

        if (!university) {
            return;
        }

        createProfileModal();

        const modal =
            document.getElementById(
                "scholarPathProfileModal"
            );

        const content =
            document.getElementById(
                "scholarPathProfileContent"
            );

        const logo =
            university.logo ||
            LOGO_URL;

        const sourceLinks = [];

        if (
            university.officialWebsite
        ) {
            sourceLinks.push(`
                <a
                    href="${escapeAttribute(
                        university.officialWebsite
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card-link"
                >
                    Official university website ↗
                </a>
            `);
        }

        if (
            university.officialFeeSource
        ) {
            sourceLinks.push(`
                <a
                    href="${escapeAttribute(
                        university.officialFeeSource
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card-link"
                >
                    Official fee information ↗
                </a>
            `);
        }

        if (
            university.officialSource
        ) {
            sourceLinks.push(`
                <a
                    href="${escapeAttribute(
                        university.officialSource
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card-link"
                >
                    Verification source ↗
                </a>
            `);
        }

        content.innerHTML = `
            <div
                style="
                    display:flex;
                    gap:18px;
                    align-items:center;
                    margin-bottom:24px;
                "
            >

                <img
                    src="${escapeAttribute(
                        logo
                    )}"
                    alt="${escapeAttribute(
                        university.name
                    )}"
                    style="
                        width:72px;
                        height:72px;
                        object-fit:contain;
                        border-radius:16px;
                        border:1px solid #eee;
                    "
                    onerror="
                        this.src='${escapeAttribute(
                            LOGO_URL
                        )}';
                    "
                >

                <div>

                    <div
                        style="
                            font-size:12px;
                            letter-spacing:1.5px;
                            opacity:.6;
                            margin-bottom:5px;
                        "
                    >
                        UNIVERSITY PROFILE
                    </div>

                    <h2
                        style="
                            margin:0;
                            line-height:1.15;
                        "
                    >
                        ${escapeHTML(
                            university.name
                        )}
                    </h2>

                    <p
                        style="
                            margin:7px 0 0;
                            opacity:.7;
                        "
                    >
                        ${escapeHTML(
                            [
                                university.city,
                                university.region,
                                university.country
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    " • "
                                )
                        )}
                    </p>

                </div>

            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit,minmax(190px,1fr));
                    gap:12px;
                    margin-bottom:22px;
                "
            >

                ${profileInfoBox(
                    "Programme area",
                    university.course
                )}

                ${profileInfoBox(
                    "Study medium",
                    university.medium
                )}

                ${profileInfoBox(
                    "Tuition",
                    university.tuitionFee ||
                        "Verify officially"
                )}

                ${profileInfoBox(
                    "Hostel",
                    university.hostelFee ||
                        "Verify officially"
                )}

                ${profileInfoBox(
                    "Scholarship",
                    university.scholarship ===
                        "yes"
                        ? "Listed — verify eligibility"
                        : "Check officially"
                )}

                ${profileInfoBox(
                    "Verification",
                    verificationLabel(
                        university.verificationStatus
                    )
                )}

            </div>

            ${
                university.about
                    ? `
                        <section
                            style="
                                margin-bottom:22px;
                            "
                        >
                            <h3>
                                About the university
                            </h3>

                            <p
                                style="
                                    line-height:1.7;
                                    opacity:.8;
                                "
                            >
                                ${escapeHTML(
                                    university.about
                                )}
                            </p>
                        </section>
                    `
                    : ""
            }

            ${
                university.fields.length
                    ? `
                        <section
                            style="
                                margin-bottom:22px;
                            "
                        >
                            <h3>
                                Fields / programmes
                            </h3>

                            <p
                                style="
                                    line-height:1.7;
                                "
                            >
                                ${escapeHTML(
                                    university.fields.join(
                                        ", "
                                    )
                                )}
                            </p>
                        </section>
                    `
                    : ""
            }

            <section
                style="
                    margin-bottom:22px;
                "
            >

                <h3>
                    Verification record
                </h3>

                <div
                    style="
                        padding:16px;
                        border-radius:14px;
                        background:#f4f8f7;
                        line-height:1.7;
                    "
                >
                    <strong>
                        Status:
                    </strong>

                    ${escapeHTML(
                        verificationLabel(
                            university.verificationStatus
                        )
                    )}

                    ${
                        university.lastVerified
                            ? `
                                <br>
                                <strong>
                                    Last verified:
                                </strong>
                                ${escapeHTML(
                                    university.lastVerified
                                )}
                            `
                            : ""
                    }

                    <br>

                    <span
                        style="
                            opacity:.7;
                        "
                    >
                        Information can change.
                        Always confirm current
                        admission, fee, recognition,
                        scholarship and programme
                        requirements from official sources.
                    </span>
                </div>

            </section>

            <section>

                <h3>
                    Official sources
                </h3>

                <div
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:10px;
                    "
                >
                    ${
                        sourceLinks.length
                            ? sourceLinks.join("")
                            : `
                                <span
                                    style="
                                        opacity:.65;
                                    "
                                >
                                    No official source
                                    link is currently
                                    listed in the database.
                                </span>
                            `
                    }
                </div>

            </section>

            <div
                style="
                    margin-top:25px;
                    padding-top:18px;
                    border-top:1px solid #eee;
                    font-size:12px;
                    opacity:.65;
                "
            >
                Scholar Path Russia —
                ${escapeHTML(
                    BUSINESS_NAME
                )}
                <br>
                Source-first student guidance.
                This platform does not guarantee
                admission, scholarships, licensing
                or examination outcomes.
            </div>
        `;

        modal.style.display =
            "block";

        document.body.style.overflow =
            "hidden";
    }

    function profileInfoBox(
        label,
        value
    ) {
        return `
            <div
                style="
                    padding:15px;
                    border:1px solid #e6e9e8;
                    border-radius:14px;
                    background:#fff;
                "
            >
                <small
                    style="
                        display:block;
                        opacity:.55;
                        margin-bottom:6px;
                    "
                >
                    ${escapeHTML(
                        label
                    )}
                </small>

                <strong>
                    ${escapeHTML(
                        value
                    )}
                </strong>
            </div>
        `;
    }

    function closeProfileModal() {
        const modal =
            document.getElementById(
                "scholarPathProfileModal"
            );

        if (modal) {
            modal.style.display =
                "none";
        }

        document.body.style.overflow =
            "";
    }

    /* =========================================================
       RENDER UNIVERSITIES
    ========================================================= */

    function renderUniversities() {
        if (!grid) {
            return;
        }

        const filtered =
            getFilteredUniversities();

        currentFilteredUniversities =
            filtered;

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

                    <div
                        style="
                            text-align:center;
                            padding:30px 10px;
                        "
                    >

                        <h3>
                            No matching university found
                        </h3>

                        <p class="location">
                            Try changing one or more
                            filters
