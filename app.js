/*
============================================================
SCHOLAR PATH RUSSIA
University Explorer
Virangeeta Navigators
============================================================
*/

(function () {
    "use strict";

    const DATA_URL = "./data/universities.json";

    const grid = document.getElementById("universityGrid");
    const recordCount = document.getElementById("recordCount");

    const courseFilter = document.getElementById("courseFilter");
    const cityFilter = document.getElementById("cityFilter");
    const mediumFilter = document.getElementById("mediumFilter");
    const scholarshipFilter = document.getElementById("scholarshipFilter");

    let universities = [];

    /*
    ============================================================
    BASIC HELPERS
    ============================================================
    */

    function clean(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value).trim();
    }

    function firstValue(obj, keys) {
        for (const key of keys) {
            if (
                obj &&
                Object.prototype.hasOwnProperty.call(obj, key) &&
                clean(obj[key]) !== ""
            ) {
                return obj[key];
            }
        }

        return "";
    }

    function escapeHTML(value) {
        return String(value === undefined || value === null ? "" : value)
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

    /*
    ============================================================
    COURSE / FIELD DETECTION
    ============================================================
    */

    function getCourse(u) {
        const text = [
            firstValue(u, ["course"]),
            firstValue(u, ["category"]),
            firstValue(u, ["program"]),
            firstValue(u, ["programme"]),
            Array.isArray(u.fields) ? u.fields.join(" ") : ""
        ]
            .join(" ")
            .toLowerCase();

        if (
            text.includes("medicine") ||
            text.includes("medical") ||
            text.includes("mbbs") ||
            text.includes("health") ||
            text.includes("dentistry") ||
            text.includes("pharmacy")
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
            text.includes("it") ||
            text.includes("information technology") ||
            text.includes("informatics") ||
            text.includes("computer") ||
            text.includes("electronic")
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

        if (
            text.includes("law")
        ) {
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

        return clean(
            firstValue(u, ["category", "course"])
        ) || "Other";
    }

    /*
    ============================================================
    STUDY MEDIUM
    ============================================================
    */

    /*
=============================================================
SCHOLARSHIP STATUS
=============================================================
*/
    /*
    ============================================================
    SCHOLARSHIP
    ============================================================
    */

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
        const text = clean(value).toLowerCase();

        if (!text) {
            continue;
        }

        if (negativeWords.some(word => text === word)) {
            continue;
        }

        if (
            positiveWords.some(word => text === word) ||
            text.includes("scholarship") ||
            text.includes("government") ||
            text.includes("open door")
        ) {
            return "yes";
        }
    }

    return "no";
    }

    /*
    ============================================================
    NORMALIZE UNIVERSITY DATABASE
    ============================================================
    */

    function normalizeUniversity(u, index) {
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
            firstValue(u, ["country"]) || "Russia";

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

        const fields = Array.isArray(u.fields)
            ? u.fields
            : clean(u.fields)
                ? [clean(u.fields)]
                : [];

        const officialWebsite = validURL(
            firstValue(u, [
                "official_website",
                "officialWebsite",
                "website",
                "url"
            ])
        );

        const officialFeeSource = validURL(
            firstValue(u, [
                "official_fee_source",
                "officialFeeStructure",
                "official_fee_structure",
                "fee_source",
                "tuition_source"
            ])
        );

        const officialSource = validURL(
            firstValue(u, [
                "official_source",
                "officialSource",
                "source"
            ])
        );

        const tuitionFee = firstValue(u, [
            "tuition_fee",
            "tuitionFee",
            "tuition",
            "fee"
        ]);

        const hostelFee = firstValue(u, [
            "hostel_fee",
            "hostelFee",
            "hostel",
            "hostel_cost"
        ]);

        const tuitionStatus = firstValue(u, [
            "tuition_status",
            "tuitionStatus"
        ]);

        const hostelStatus = firstValue(u, [
            "hostel_status",
            "hostelStatus"
        ]);

        const lastVerified = firstValue(u, [
            "last_verified",
            "lastVerified"
        ]);

        const internationalStudents = firstValue(u, [
            "international_students",
            "internationalStudents"
        ]);

        return {
            id:
                clean(firstValue(u, ["id"])) ||
                "university-" + (index + 1),

            name: clean(name),

            city: clean(city),

            region: clean(region),

            country: clean(country),

            established: clean(established),

            about: clean(about),

            fields: fields,

            course: getCourse(u),

            medium: getMedium(u),

            scholarship: getScholarship(u),

            tuitionFee: clean(tuitionFee),

            hostelFee: clean(hostelFee),

            tuitionStatus: clean(tuitionStatus),

            hostelStatus: clean(hostelStatus),

            officialWebsite: officialWebsite,

            officialFeeSource: officialFeeSource,

            officialSource: officialSource,

            internationalStudents:
                clean(internationalStudents),

            lastVerified:
                clean(lastVerified)
        };
    }

    /*
    ============================================================
    LOAD DATABASE
    ============================================================
    */

    async function loadUniversities() {
        try {
            const response = await fetch(
                DATA_URL + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "University database could not be loaded."
                );
            }

            const data = await response.json();

            let rawUniversities = [];

            if (Array.isArray(data)) {
                rawUniversities = data;
            } else if (
                data &&
                Array.isArray(data.universities)
            ) {
                rawUniversities = data.universities;
            } else {
                throw new Error(
                    "Invalid university database format."
                );
            }

            universities = rawUniversities
                .map(normalizeUniversity)
                .filter(u => u.name);

            populateCities();

            updateFilterOptions();

            renderUniversities();

        } catch (error) {
            console.error(error);

            if (recordCount) {
                recordCount.textContent =
                    "Database could not be loaded";
            }

            if (grid) {
                grid.innerHTML = `
                    <article class="university-card">
                        <h3>University database unavailable</h3>
                        <p class="location">
                            Please refresh the page.
                        </p>
                        <p>
                            If the problem continues, check that
                            data/universities.json exists and contains
                            valid JSON.
                        </p>
                    </article>
                `;
            }
        }
    }

    /*
    ============================================================
    DYNAMIC COURSE OPTIONS
    ============================================================
    */

    function updateFilterOptions() {
        if (!courseFilter) {
            return;
        }

        const currentValue = courseFilter.value;

        const courses = [
            ...new Set(
                universities
                    .map(u => u.course)
                    .filter(Boolean)
            )
        ].sort((a, b) =>
            a.localeCompare(b)
        );

        const firstOption =
            courseFilter.querySelector(
                'option[value=""]'
            );

        courseFilter.innerHTML = "";

        if (firstOption) {
            courseFilter.appendChild(
                firstOption.cloneNode(true)
            );
        } else {
            courseFilter.innerHTML =
                `<option value="">All courses</option>`;
        }

        courses.forEach(course => {
            const option =
                document.createElement("option");

            option.value = course;
            option.textContent = course;

            courseFilter.appendChild(option);
        });

        if (
            courses.includes(currentValue)
        ) {
            courseFilter.value = currentValue;
        }
    }

    /*
    ============================================================
    CITY FILTER
    ============================================================
    */

    function populateCities() {
        if (!cityFilter) {
            return;
        }

        const currentValue = cityFilter.value;

        const cities = [
            ...new Set(
                universities
                    .map(u => clean(u.city))
                    .filter(city =>
                        city &&
                        city !==
                            "City/region to be verified"
                    )
            )
        ].sort((a, b) =>
            a.localeCompare(b)
        );

        cityFilter.innerHTML =
            `<option value="">All cities</option>`;

        cities.forEach(city => {
            const option =
                document.createElement("option");

            option.value = city;
            option.textContent = city;

            cityFilter.appendChild(option);
        });

        if (
            cities.includes(currentValue)
        ) {
            cityFilter.value = currentValue;
        }
    }

    /*
    ============================================================
    FILTERING
    ============================================================
    */

    function getFilteredUniversities() {
        const course =
            courseFilter
                ? clean(courseFilter.value)
                : "";

        const city =
            cityFilter
                ? clean(cityFilter.value)
                : "";

        const medium =
            mediumFilter
                ? clean(mediumFilter.value)
                : "";

        const scholarship =
            scholarshipFilter
                ? clean(scholarshipFilter.value)
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

    /*
    ============================================================
    FEE DISPLAY
    ============================================================
    */

    function feeDisplay(
        label,
        value,
        status,
        source
    ) {
        if (value) {
            return `
                <div class="info-box">
                    <small>${escapeHTML(label)}</small>
                    <strong>
                        ${escapeHTML(value)}
                    </strong>
                    ${
                        status
                            ? `<span class="small-note">
                                ${escapeHTML(status)}
                               </span>`
                            : ""
                    }
                    ${
                        source
                            ? `
                            <a
                                href="${escapeAttribute(source)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="mini-link"
                            >
                                Official source ↗
                            </a>
                            `
                            : ""
                    }
                </div>
            `;
        }

        return `
            <div class="info-box">
                <small>${escapeHTML(label)}</small>
                <strong>
                    Verify official fee
                </strong>
                ${
                    source
                        ? `
                        <a
                            href="${escapeAttribute(source)}"
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

    /*
    ============================================================
    UNIVERSITY CARD
    ============================================================
    */

    function createUniversityCard(u) {

        const scholarshipBadge =
            u.scholarship === "yes"
                ? `
                    <span class="badge green">
                        Scholarship available 
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
                href="https://docs.google.com/forms/d/1lIqIdQQW0ORfNvPE1pR63_nSV4lORq_-bOJwnLPkS3M/viewform"
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
                        ${escapeHTML(u.about)}
                    </p>
                  `
                : "";

        const fields =
            u.fields.length
                ? `
                    <p class="description">
                        <strong>Fields:</strong>
                        ${escapeHTML(
                            u.fields.join(", ")
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
                            Database record:
                        </strong>
                        ${escapeHTML(
                            u.lastVerified
                        )}

                        <br>

                        <span>
                            Programme, fee and admission
                            details should be confirmed
                            from official university sources.
                        </span>
                    </div>
                  `
                : `
                    <div class="verify-note">
                        <strong>
                            Verification status:
                        </strong>
                        University record available.
                        Programme, fee and admission
                        details require official-source
                        confirmation.
                    </div>
                  `;

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
                    ${escapeHTML(locationText)}
                </div>

                <div class="info-row">

                    <div class="info-box">
                        <small>
                            Study medium
                        </small>

                        <strong>
                            ${escapeHTML(u.medium)}
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
                                u.scholarship === "yes"
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

                    ${websiteButton}

                    ${feeSourceButton}

                    ${officialSourceButton}

                    ${applyButton}

                </div>

            </article>
        `;
    }

    /*
    ============================================================
    RENDER UNIVERSITIES
    ============================================================
    */

    function renderUniversities() {

        if (!grid) {
            return;
        }

        const filtered =
            getFilteredUniversities();

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
                    <h3>
                        No matching university found
                    </h3>

                    <p class="location">
                        Try changing one or more filters.
                    </p>
                </article>
            `;

            return;
        }

        grid.innerHTML =
            filtered
                .map(createUniversityCard)
                .join("");
    }

    /*
    ============================================================
    FILTER EVENTS
    ============================================================
    */

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

    /*
    ============================================================
    START
    ============================================================
    */

    loadUniversities();

})();
