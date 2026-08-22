/* =========================================================
   SCHOLAR PATH RUSSIA
   COMPLETE APPLICATION ENGINE
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    /*
     * IMPORTANT:
     * Keep universities.json in the same folder as index.html.
     */
    UNIVERSITY_DATA_URL: "./universities.json",

    /*
     * Add your Google Form URL here later.
     *
     * Example:
     * https://docs.google.com/forms/d/e/XXXXXXXX/viewform
     */
    GOOGLE_FORM_URL: "",

    /*
     * Optional WhatsApp number.
     * Use international format without + or spaces.
     *
     * Example:
     * 919876543210
     */
    WHATSAPP_NUMBER: "",

    /*
     * Number of universities initially displayed.
     */
    FEATURED_COUNT: 4,

    /*
     * Maximum universities shown in normal search.
     */
    MAX_SEARCH_RESULTS: 60

};


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    universities: [],

    filteredUniversities: [],

    cities: [],

    fields: [],

    loading: true,

    currentUniversity: null,

    currentPath: "mbbs"

};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GENERIC VALUE HELPERS
========================================================= */

function firstValue(obj, keys, fallback = "") {

    for (const key of keys) {

        if (
            obj &&
            obj[key] !== undefined &&
            obj[key] !== null &&
            String(obj[key]).trim() !== ""
        ) {
            return obj[key];
        }

    }

    return fallback;

}


function arrayValue(value) {

    if (Array.isArray(value)) {
        return value;
    }

    if (value === null || value === undefined) {
        return [];
    }

    if (typeof value === "string") {

        return value
            .split(/[,;|]/)
            .map(x => x.trim())
            .filter(Boolean);

    }

    return [String(value)];

}


function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}


function formatNumber(number) {

    const n = Number(number);

    if (!Number.isFinite(n)) {
        return "—";
    }

    return new Intl.NumberFormat("en-IN").format(n);

}


function rubles(number) {

    if (
        number === null ||
        number === undefined ||
        number === "" ||
        !Number.isFinite(Number(number))
    ) {
        return "Not listed";
    }

    return `₽ ${formatNumber(number)}`;

}


function cleanUniversityName(university) {

    return firstValue(
        university,
        [
            "name",
            "university_name",
            "title",
            "institution"
        ],
        "University"
    );

}


function universityCity(university) {

    return firstValue(
        university,
        [
            "city",
            "location_city"
        ],
        "Not listed"
    );

}


function universityRegion(university) {

    return firstValue(
        university,
        [
            "region",
            "oblast",
            "republic",
            "location_region"
        ],
        ""
    );

}


function universityFields(university) {

    return arrayValue(
        firstValue(
            university,
            [
                "fields",
                "field",
                "programmes",
                "programs",
                "specializations",
                "specialties"
            ],
            []
        )
    );

}


function universityMedium(university) {

    return arrayValue(
        firstValue(
            university,
            [
                "medium",
                "language",
                "languages",
                "instruction_language"
            ],
            []
        )
    );

}


function universityEnglishPrograms(university) {

    return firstValue(
        university,
        [
            "english_programs",
            "english_programmes",
            "english_program",
            "english"
        ],
        ""
    );

}


function universityTuition(university) {

    return firstValue(
        university,
        [
            "tuition_fee",
            "tuition",
            "annual_tuition",
            "tuition_per_year"
        ],
        ""
    );

}


function universityHostel(university) {

    return firstValue(
        university,
        [
            "hostel_fee",
            "hostel",
            "accommodation_fee"
        ],
        ""
    );

}


function universityOfficialURL(university) {

    return firstValue(
        university,
        [
            "official_url",
            "official_website",
            "website",
            "url"
        ],
        ""
    );

}


function universityAbout(university) {

    return firstValue(
        university,
        [
            "about",
            "description",
            "overview",
            "summary"
        ],
        ""
    );

}


function universityVerification(university) {

    return firstValue(
        university,
        [
            "verification_status",
            "verified",
            "verification"
        ],
        ""
    );

}


function universityOpenDoors(university) {

    return firstValue(
        university,
        [
            "open_doors",
            "open_doors_status",
            "open_doors_program",
            "opendoors"
        ],
        ""
    );

}


function universityScholarship(university) {

    return firstValue(
        university,
        [
            "government_scholarship",
            "scholarship",
            "scholarship_status",
            "government_scholarship_status"
        ],
        ""
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    setupYear();

    setupMobileNavigation();

    setupSmoothNavigation();

    setupHeroSearch();

    setupBudgetCalculator();

    setupApplicationPath();

    setupDocumentChecklist();

    setupCitySearch();

    setupUniversitySearch();

    setupUniversityComparison();

    setupUniversityMatch();

    setupAIInterface();

    setupContactForm();

    setupModal();

    await loadUniversities();

}


/* =========================================================
   YEAR
========================================================= */

function setupYear() {

    const year = $("#currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function setupMobileNavigation() {

    const button = $("#mobileMenuButton");

    const nav = $("#mobileNav");

    if (!button || !nav) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const isOpen =
                nav.classList.toggle("open");

            button.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    nav.querySelectorAll("a").forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    nav.classList.remove("open");

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );

}


/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

function setupSmoothNavigation() {

    $$("[data-scroll]").forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.scroll;

                    if (!target) {
                        return;
                    }

                    const element =
                        document.querySelector(target);

                    if (element) {

                        element.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        }
    );

}


/* =========================================================
   LOAD UNIVERSITY DATABASE
========================================================= */

async function loadUniversities() {

    const status =
        $("#universitySearchStatus");

    try {

        if (status) {
            status.textContent =
                "Loading university database...";
        }


        const response =
            await fetch(CONFIG.UNIVERSITY_DATA_URL, {
                cache: "no-store"
            });


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        /*
         * Support common JSON structures:
         *
         * [
         *   {...}
         * ]
         *
         * OR
         *
         * {
         *   universities: [...]
         * }
         */

        let universities = [];


        if (Array.isArray(data)) {

            universities = data;

        } else if (
            data &&
            Array.isArray(data.universities)
        ) {

            universities = data.universities;

        } else if (
            data &&
            Array.isArray(data.data)
        ) {

            universities = data.data;

        } else if (
            data &&
            Array.isArray(data.results)
        ) {

            universities = data.results;

        }


        state.universities =
            universities.filter(
                item =>
                    item &&
                    typeof item === "object"
            );


        state.loading = false;


        processUniversityData();

        renderFeaturedUniversities();

        populateFilters();

        populateComparisonSelectors();

        populateMatchFields();

        populateAIUniversities();

        renderCities();


        if (status) {

            status.textContent =
                `${state.universities.length} universities loaded. Search by university, city or programme.`;

        }

    } catch (error) {

        console.error(
            "University database error:",
            error
        );


        state.loading = false;


        if (status) {

            status.innerHTML = `
                <strong>University database could not be loaded.</strong>
                Please make sure <code>universities.json</code>
                is in the same folder as this website.
            `;

        }


        renderDatabaseError();

    }

}


/* =========================================================
   PROCESS DATA
========================================================= */

function processUniversityData() {

    const cities =
        new Set();

    const fields =
        new Set();


    state.universities.forEach(
        university => {

            const city =
                universityCity(university);

            if (city && city !== "Not listed") {
                cities.add(city);
            }


            universityFields(university).forEach(
                field => {

                    if (field) {
                        fields.add(field);
                    }

                }
            );

        }
    );


    state.cities =
        [...cities].sort(
            (a, b) =>
                normalizeText(a)
                    .localeCompare(
                        normalizeText(b)
                    )
        );


    state.fields =
        [...fields].sort(
            (a, b) =>
                normalizeText(a)
                    .localeCompare(
                        normalizeText(b)
                    )
        );

}


/* =========================================================
   DATABASE ERROR
========================================================= */

function renderDatabaseError() {

    const container =
        $("#featuredUniversities");

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="no-results">

            <h3>
                University database unavailable
            </h3>

            <p>
                Check that <strong>universities.json</strong>
                is located beside index.html.
            </p>

        </div>
    `;

}


/* =========================================================
   UNIVERSITY CARD
========================================================= */

function getUniversityImage(university) {

    return firstValue(
        university,
        [
            "image",
            "image_url",
            "photo",
            "photo_url",
            "logo",
            "logo_url"
        ],
        ""
    );

}


function universityCard(university) {

    const name =
        cleanUniversityName(university);

    const city =
        universityCity(university);

    const region =
        universityRegion(university);

    const fields =
        universityFields(university);

    const medium =
        universityMedium(university);

    const tuition =
        universityTuition(university);

    const hostel =
        universityHostel(university);

    const verification =
        universityVerification(university);

    const image =
        getUniversityImage(university);


    const index =
        state.universities.indexOf(
            university
        );


    const tags =
        [
            ...fields.slice(0, 2),
            ...medium.slice(0, 1)
        ];


    return `
        <article
            class="university-card"
            data-university-index="${index}"
        >

            <div class="university-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(name)}"
                                loading="lazy"
                                onerror="this.style.display='none';"
                            >
                          `
                        : ""
                }

            </div>


            <div class="university-body">

                <div class="university-location">
                    📍
                    ${escapeHTML(city)}
                    ${
                        region
                            ? ` • ${escapeHTML(region)}`
                            : ""
                    }
                </div>


                <h3>
                    ${escapeHTML(name)}
                </h3>


                ${
                    universityAbout(university)
                        ? `
                            <p class="university-about">
                                ${escapeHTML(
                                    universityAbout(
                                        university
                                    )
                                )}
                            </p>
                          `
                        : `
                            <p class="university-about">
                                University information
                                available in the database.
                            </p>
                          `
                }


                <div class="university-tags">

                    ${
                        tags
                            .map(
                                tag => `
                                    <span class="university-tag">
                                        ${escapeHTML(tag)}
                                    </span>
                                `
                            )
                            .join("")
                    }

                </div>


                <div class="university-meta">

                    <div class="meta-item">

                        <span>
                            Tuition
                        </span>

                        <strong>
                            ${rubles(tuition)}
                        </strong>

                    </div>


                    <div class="meta-item">

                        <span>
                            Hostel
                        </span>

                        <strong>
                            ${rubles(hostel)}
                        </strong>

                    </div>

                </div>


                ${
                    verification
                        ? `
                            <span
                                class="status-pill ${
                                    isVerified(
                                        verification
                                    )
                                        ? "verified"
                                        : "unverified"
                                }"
                            >
                                ${
                                    isVerified(
                                        verification
                                    )
                                        ? "✓ Information verified"
                                        : escapeHTML(
                                            verification
                                        )
                                }
                            </span>
                          `
                        : ""
                }


                <div class="university-card-actions">

                    <button
                        type="button"
                        class="card-button primary"
                        data-view-university="${index}"
                    >
                        View Profile
                    </button>


                    ${
                        universityOfficialURL(
                            university
                        )
                            ? `
                                <a
                                    class="card-button"
                                    href="${escapeHTML(
                                        universityOfficialURL(
                                            university
                                        )
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Official Site
                                </a>
                              `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;

}


/* =========================================================
   VERIFIED CHECK
========================================================= */

function isVerified(value) {

    const text =
        normalizeText(value);

    return [
        "verified",
        "official",
        "yes",
        "true",
        "verified information"
    ].some(
        word =>
            text.includes(
                normalizeText(word)
            )
    );

}


/* =========================================================
   FEATURED UNIVERSITIES
========================================================= */

function renderFeaturedUniversities() {

    const container =
        $("#featuredUniversities");

    if (!container) {
        return;
    }


    const universities =
        state.universities.slice(
            0,
            CONFIG.FEATURED_COUNT
        );


    if (!universities.length) {

        container.innerHTML = `
            <div class="no-results">
                <h3>No university records found</h3>
            </div>
        `;

        return;
    }


    container.innerHTML =
        universities
            .map(
                university =>
                    universityCard(
                        university
                    )
            )
            .join("");


    attachUniversityCardEvents();

}


/* =========================================================
   UNIVERSITY CARD EVENTS
========================================================= */

function attachUniversityCardEvents() {

    $$("[data-view-university]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset
                                    .viewUniversity
                            );

                        openUniversityModal(
                            state.universities[
                                index
                            ]
                        );

                    }
                );

            }
        );

}


/* =========================================================
   UNIVERSITY MODAL
========================================================= */

function setupModal() {

    const modal =
        $("#universityModal");

    const close =
        $("#closeUniversityModal");

    if (!modal) {
        return;
    }


    if (close) {

        close.addEventListener(
            "click",
            closeUniversityModal
        );

    }


    modal
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeUniversityModal
                );

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("open")
            ) {
                closeUniversityModal();
            }

        }
    );

}


function openUniversityModal(university) {

    const modal =
        $("#universityModal");

    const body =
        $("#universityModalBody");

    if (!modal || !body) {
        return;
    }


    state.currentUniversity =
        university;


    const name =
        cleanUniversityName(university);

    const city =
        universityCity(university);

    const region =
        universityRegion(university);

    const fields =
        universityFields(university);

    const medium =
        universityMedium(university);

    const tuition =
        universityTuition(university);

    const hostel =
        universityHostel(university);

    const english =
        universityEnglishPrograms(
            university
        );

    const verification =
        universityVerification(university);

    const openDoors =
        universityOpenDoors(university);

    const scholarship =
        universityScholarship(university);

    const official =
        universityOfficialURL(
            university
        );


    body.innerHTML = `

        <div class="modal-profile">

            <div class="modal-profile-header">

                <span class="mini-label">
                    UNIVERSITY PROFILE
                </span>

                <div class="university-location">
                    📍
                    ${escapeHTML(city)}
                    ${
                        region
                            ? ` • ${escapeHTML(region)}`
                            : ""
                    }
                </div>

                <h2 id="modalUniversityName">
                    ${escapeHTML(name)}
                </h2>

                ${
                    universityAbout(university)
                        ? `
                            <p class="modal-profile-about">
                                ${escapeHTML(
                                    universityAbout(
                                        university
                                    )
                                )}
                            </p>
                          `
                        : ""
                }

            </div>


            <div class="modal-profile-grid">

                <div class="modal-info">

                    <span>
                        Tuition
                    </span>

                    <strong>
                        ${rubles(tuition)}
                    </strong>

                </div>


                <div class="modal-info">

                    <span>
                        Hostel
                    </span>

                    <strong>
                        ${rubles(hostel)}
                    </strong>

                </div>


                <div class="modal-info">

                    <span>
                        Instruction
                    </span>

                    <strong>
                        ${
                            medium.length
                                ? escapeHTML(
                                    medium.join(
                                        ", "
                                    )
                                )
                                : "Not listed"
                        }
                    </strong>

                </div>


                <div class="modal-info">

                    <span>
                        English programmes
                    </span>

                    <strong>
                        ${
                            english
                                ? escapeHTML(
                                    String(
                                        english
                                    )
                                )
                                : "Not listed"
                        }
                    </strong>

                </div>


                <div class="modal-info">

                    <span>
                        Verification
                    </span>

                    <strong>
                        ${
                            verification
                                ? escapeHTML(
                                    verification
                                )
                                : "Not listed"
                        }
                    </strong>

                </div>


                <div class="modal-info">

                    <span>
                        Open Doors
                    </span>

                    <strong>
                        ${
                            openDoors
                                ? escapeHTML(
                                    String(
                                        openDoors
                                    )
                                )
                                : "Not listed"
                        }
                    </strong>

                </div>


                <div class="modal-info">

                    <span>
                        Scholarship
                    </span>

                    <strong>
                        ${
                            scholarship
                                ? escapeHTML(
                                    String(
                                        scholarship
                                    )
                                )
                                : "Not listed"
                        }
                    </strong>

                </div>

            </div>


            <div class="modal-fields">

                <h3>
                    Fields / Programmes
                </h3>


                <div class="modal-field-tags">

                    ${
                        fields.length
                            ? fields
                                .map(
                                    field => `
                                        <span
                                            class="university-tag"
                                        >
                                            ${escapeHTML(
                                                field
                                            )}
                                        </span>
                                    `
                                )
                                .join("")
                            : `
                                <span class="university-tag">
                                    Not listed
                                </span>
                              `
                    }

                </div>

            </div>


            <div class="modal-links">

                ${
                    official
                        ? `
                            <a
                                href="${escapeHTML(
                                    official
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="button button-primary"
                            >
                                Official University Website →
                            </a>
                          `
                        : ""
                }


                <button
                    type="button"
                    class="button button-light"
                    id="modalBudgetButton"
                >
                    Calculate My Budget
                </button>


                <button
                    type="button"
                    class="button button-light"
                    id="modalCompareButton"
                >
                    Compare This University
                </button>

            </div>


            <div class="verification-note">

                <strong>
                    Important
                </strong>

                <p>
                    Database information is provided for research
                    and planning. Fees, programmes, scholarship
                    availability and admission requirements can change.
                    Verify current information with the official
                    university or relevant authority before applying.
                </p>

            </div>

        </div>

    `;


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );


    const budgetButton =
        $("#modalBudgetButton");

    if (budgetButton) {

        budgetButton.addEventListener(
            "click",
            () => {

                closeUniversityModal();

                setTimeout(
                    () => {

                        $("#budget")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                    },
                    100
                );

            }
        );

    }


    const compareButton =
        $("#modalCompareButton");

    if (compareButton) {

        compareButton.addEventListener(
            "click",
            () => {

                closeUniversityModal();

                setTimeout(
                    () => {

                        const select =
                            $("#compareOne");

                        if (select) {

                            const index =
                                state.universities
                                    .indexOf(
                                        university
                                    );

                            select.value =
                                String(index);

                        }

                        $("#compare")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                    },
                    100
                );

            }
        );

    }

}


function closeUniversityModal() {

    const modal =
        $("#universityModal");

    if (!modal) {
        return;
    }


    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   FILTER POPULATION
========================================================= */

function populateFilters() {

    const programme =
        $("#programmeFilter");

    const city =
        $("#cityFilter");


    if (programme) {

        programme.innerHTML =
            `
                <option value="">
                    All programmes
                </option>
            `;


        state.fields.forEach(
            field => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    field;

                option.textContent =
                    field;

                programme.appendChild(
                    option
                );

            }
        );

    }


    if (city) {

        city.innerHTML =
            `
                <option value="">
                    All cities
                </option>
            `;


        state.cities.forEach(
            cityName => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    cityName;

                option.textContent =
                    cityName;

                city.appendChild(
                    option
                );

            }
        );

    }


    const count =
        $("#databaseCount");

    if (count) {

        count.textContent =
            state.universities.length;

    }

}


/* =========================================================
   UNIVERSITY SEARCH
========================================================= */

function setupUniversitySearch() {

    const form =
        $("#universitySearchForm");

    const reset =
        $("#resetUniversitySearch");


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                performUniversitySearch();

            }
        );

    }


    [
        "#universitySearch",
        "#programmeFilter",
        "#cityFilter",
        "#languageFilter",
        "#verifiedOnly",
        "#openDoorsOnly",
        "#scholarshipOnly"
    ].forEach(
        selector => {

            const element =
                $(selector);

            if (!element) {
                return;
            }

            element.addEventListener(
                "change",
                performUniversitySearch
            );

        }
    );


    if (reset) {

        reset.addEventListener(
            "click",
            resetUniversitySearch
        );

    }

}


function performUniversitySearch() {

    const query =
        normalizeText(
            $("#universitySearch")?.value
        );

    const programme =
        normalizeText(
            $("#programmeFilter")?.value
        );

    const city =
        normalizeText(
            $("#cityFilter")?.value
        );

    const language =
        normalizeText(
            $("#languageFilter")?.value
        );

    const verifiedOnly =
        Boolean(
            $("#verifiedOnly")?.checked
        );

    const openDoorsOnly =
        Boolean(
            $("#openDoorsOnly")?.checked
        );

    const scholarshipOnly =
        Boolean(
            $("#scholarshipOnly")?.checked
        );


    const results =
        state.universities.filter(
            university => {

                const name =
                    normalizeText(
                        cleanUniversityName(
                            university
                        )
                    );

                const cityName =
                    normalizeText(
                        universityCity(
                            university
                        )
                    );

                const region =
                    normalizeText(
                        universityRegion(
                            university
                        )
                    );

                const fields =
                    universityFields(
                        university
                    )
                    .map(normalizeText);

                const medium =
                    universityMedium(
                        university
                    )
                    .map(normalizeText);

                const about =
                    normalizeText(
                        universityAbout(
                            university
                        )
                    );


                const queryMatch =
                    !query ||
                    name.includes(query) ||
                    cityName.includes(query) ||
                    region.includes(query) ||
                    about.includes(query) ||
                    fields.some(
                        field =>
                            field.includes(query)
                    );


                const programmeMatch =
                    !programme ||
                    fields.some(
                        field =>
                            field.includes(
                                programme
                            )
                    );


                const cityMatch =
                    !city ||
                    cityName === city;


                const languageMatch =
                    !language ||
                    medium.some(
                        item =>
                            item.includes(
                                language
                            )
                    ) ||
                    normalizeText(
                        universityEnglishPrograms(
                            university
                        )
                    ).includes(language);


                const verifiedMatch =
                    !verifiedOnly ||
                    isVerified(
                        universityVerification(
                            university
                        )
                    );


                const openDoorsMatch =
                    !openDoorsOnly ||
                    Boolean(
                        universityOpenDoors(
                            university
                        )
                    );


                const scholarshipMatch =
                    !scholarshipOnly ||
                    Boolean(
                        universityScholarship(
                            university
                        )
                    );


                return (
                    queryMatch &&
                    programmeMatch &&
                    cityMatch &&
                    languageMatch &&
                    verifiedMatch &&
                    openDoorsMatch &&
                    scholarshipMatch
                );

            }
        );


    state.filteredUniversities =
        results;


    renderSearchResults(
        results,
        Boolean(
            query ||
            programme ||
            city ||
            language ||
            verifiedOnly ||
            openDoorsOnly ||
            scholarshipOnly
        )
    );

}


function renderSearchResults(
    results,
    showResults
) {

    const section =
        $("#searchResultsSection");

    const container =
        $("#universityResults");

    const title =
        $("#searchResultsTitle");

    if (!section || !container) {
        return;
    }


    if (!showResults) {

        section.hidden = true;

        return;

    }


    section.hidden = false;


    if (title) {

        title.textContent =
            `${results.length} ${
                results.length === 1
                    ? "university"
                    : "universities"
            } found`;

    }


    if (!results.length) {

        container.innerHTML = `
            <div class="no-results">

                <h3>
                    No universities found
                </h3>

                <p>
                    Try another university name,
                    city, field or language.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        results
            .slice(
                0,
                CONFIG.MAX_SEARCH_RESULTS
            )
            .map(
                university =>
                    universityCard(
                        university
                    )
            )
            .join("");


    attachUniversityCardEvents();

}


function resetUniversitySearch() {

    [
        "#universitySearch",
        "#programmeFilter",
        "#cityFilter",
        "#languageFilter"
    ].forEach(
        selector => {

            const element =
                $(selector);

            if (element) {

                if (
                    element.tagName ===
                    "SELECT"
                ) {
                    element.selectedIndex = 0;
                } else {
                    element.value = "";
                }

            }

        }
    );


    [
        "#verifiedOnly",
        "#openDoorsOnly",
        "#scholarshipOnly"
    ].forEach(
        selector => {

            const checkbox =
                $(selector);

            if (checkbox) {
                checkbox.checked = false;
            }

        }
    );


    $("#searchResultsSection")
        ?.setAttribute(
            "hidden",
            ""
        );


    const status =
        $("#universitySearchStatus");

    if (status) {

        status.textContent =
            `${state.universities.length} universities loaded. Search by university, city or programme.`;

    }

}


/* =========================================================
   HERO SEARCH
========================================================= */

function setupHeroSearch() {

    const form =
        $("#heroSearchForm");

    const input =
        $("#heroSearchInput");


    if (!form || !input) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const query =
                input.value.trim();


            $("#universitySearch").value =
                query;


            performUniversitySearch();


            $("#universities")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


/* =========================================================
   CITY EXPLORER
========================================================= */

function renderCities(
    filter = ""
) {

    const container =
        $("#cityGrid");

    if (!container) {
        return;
    }


    const normalized =
        normalizeText(filter);


    const cities =
        state.cities.filter(
            city =>
                !normalized ||
                normalizeText(city)
                    .includes(normalized)
        );


    if (!cities.length) {

        container.innerHTML = `
            <div class="no-results">
                <h3>No city found</h3>
                <p>Try another city name.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        cities
            .map(
                city => {

                    const count =
                        state.universities.filter(
                            university =>
                                normalizeText(
                                    universityCity(
                                        university
                                    )
                                ) ===
                                normalizeText(
                                    city
                                )
                        ).length;


                    return `
                        <article
                            class="city-card"
                            data-city="${escapeHTML(
                                city
                            )}"
                        >

                            <strong>
                                ${escapeHTML(city)}
                            </strong>

                            <span>
                                ${count}
                                ${
                                    count === 1
                                        ? "university"
                                        : "universities"
                                }
                            </span>

                        </article>
                    `;

                }
            )
            .join("");


    container
        .querySelectorAll(
            ".city-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const city =
                            card.dataset.city;


                        $("#cityFilter").value =
                            city;


                        performUniversitySearch();


                        $("#universities")
                            .scrollIntoView({
                                behavior: "smooth"
                            });

                    }
                );

            }
        );

}


function setupCitySearch() {

    const input =
        $("#citySearch");

    const clear =
        $("#clearCitySearch");


    if (input) {

        input.addEventListener(
            "input",
            () => {

                renderCities(
                    input.value
                );

            }
        );

    }


    if (clear) {

        clear.addEventListener(
            "click",
            () => {

                if (input) {
                    input.value = "";
                }

                renderCities();

            }
        );

    }

}


/* =========================================================
   COMPARISON
========================================================= */

function populateComparisonSelectors() {

    [
        "#compareOne",
        "#compareTwo",
        "#compareThree"
    ].forEach(
        selector => {

            const select =
                $(selector);

            if (!select) {
                return;
            }


            select.innerHTML = `
                <option value="">
                    Select university
                </option>
            `;


            state.universities.forEach(
                (university, index) => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(index);

                    option.textContent =
                        cleanUniversityName(
                            university
                        );

                    select.appendChild(
                        option
                    );

                }
            );

        }
    );

}


function setupUniversityComparison() {

    const button =
        $("#runCompare");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        renderComparison
    );

}


function renderComparison() {

    const indexes =
        [
            $("#compareOne")?.value,
            $("#compareTwo")?.value,
            $("#compareThree")?.value
        ]
        .filter(
            value =>
                value !== ""
        );


    const uniqueIndexes =
        [...new Set(indexes)];


    const container =
        $("#comparisonContainer");

    if (!container) {
        return;
    }


    if (!uniqueIndexes.length) {

        container.innerHTML = `
            <div class="empty-tool-state">
                Select universities above to compare them.
            </div>
        `;

        return;

    }


    const universities =
        uniqueIndexes.map(
            index =>
                state.universities[
                    Number(index)
                ]
        );


    const rows = [

        [
            "City",
            university =>
                universityCity(
                    university
                )
        ],

        [
            "Region",
            university =>
                universityRegion(
                    university
                )
        ],

        [
            "Fields",
            university =>
                universityFields(
                    university
                ).join(", ") || "Not listed"
        ],

        [
            "Instruction",
            university =>
                universityMedium(
                    university
                ).join(", ") || "Not listed"
        ],

        [
            "English programmes",
            university =>
                universityEnglishPrograms(
                    university
                ) || "Not listed"
        ],

        [
            "Tuition",
            university =>
                rubles(
                    universityTuition(
                        university
                    )
                )
        ],

        [
            "Hostel",
            university =>
                rubles(
                    universityHostel(
                        university
                    )
                )
        ],

        [
            "Verification",
            university =>
                universityVerification(
                    university
                ) || "Not listed"
        ],

        [
            "Open Doors",
            university =>
                universityOpenDoors(
                    university
                ) || "Not listed"
        ],

        [
            "Scholarship",
            university =>
                universityScholarship(
                    university
                ) || "Not listed"
        ]

    ];


    container.innerHTML = `

        <table class="comparison-table">

            <thead>

                <tr>

                    <th>
                        Information
                    </th>

                    ${
                        universities
                            .map(
                                university =>
                                    `
                                        <th>
                                            ${escapeHTML(
                                                cleanUniversityName(
                                                    university
                                                )
                                            )}
                                        </th>
                                    `
                            )
                            .join("")
                    }

                </tr>

            </thead>


            <tbody>

                ${
                    rows
                        .map(
                            ([label, getter]) => `
                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            label
                                        )}
                                    </td>

                                    ${
                                        universities
                                            .map(
                                                university =>
                                                    `
                                                        <td>
                                                            ${escapeHTML(
                                                                String(
                                                                    getter(
                                                                        university
                                                                    )
                                                                )
                                                            )}
                                                        </td>
                                                    `
                                            )
                                            .join("")
                                    }

                                </tr>
                            `
                        )
                        .join("")
                }

            </tbody>

        </table>

    `;

}


/* =========================================================
   UNIVERSITY MATCH
========================================================= */

function populateMatchFields() {

    const select =
        $("#matchField");

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Any programme
        </option>
    `;


    state.fields.forEach(
        field => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                field;

            option.textContent =
                field;

            select.appendChild(
                option
            );

        }
    );

}


function setupUniversityMatch() {

    const button =
        $("#runMatch");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        runUniversityMatch
    );

}


function runUniversityMatch() {

    const field =
        normalizeText(
            $("#matchField")?.value
        );

    const language =
        normalizeText(
            $("#matchLanguage")?.value
        );

    const budget =
        normalizeText(
            $("#matchBudget")?.value
        );

    const scholarship =
        normalizeText(
            $("#matchScholarship")?.value
        );


    const scored =
        state.universities
            .map(
                university => {

                    let score = 0;


                    const fields =
                        universityFields(
                            university
                        )
                        .map(
                            normalizeText
                        );


                    const languages =
                        universityMedium(
                            university
                        )
                        .map(
                            normalizeText
                        );


                    if (
                        field &&
                        fields.some(
                            item =>
                                item.includes(
                                    field
                                )
                        )
                    ) {
                        score += 5;
                    }


                    if (
                        language &&
                        languages.some(
                            item =>
                                item.includes(
                                    language
                                )
                        )
                    ) {
                        score += 3;
                    }


                    const tuition =
                        Number(
                            universityTuition(
                                university
                            )
                        );


                    if (
                        budget === "low" &&
                        Number.isFinite(tuition) &&
                        tuition > 0
                    ) {

                        if (tuition < 500000) {
                            score += 3;
                        }

                    }


                    if (
                        budget === "medium" &&
                        Number.isFinite(tuition) &&
                        tuition >= 300000 &&
                        tuition <= 800000
                    ) {
                        score += 3;
                    }


                    if (
                        budget === "high" &&
                        Number.isFinite(tuition) &&
                        tuition > 0
                    ) {
                        score += 2;
                    }


                    const scholarshipValue =
                        normalizeText(
                            universityScholarship(
                                university
                            )
                        );


                    if (
                        scholarship === "yes" &&
                        scholarshipValue
                    ) {
                        score += 4;
                    }


                    if (
                        scholarship === "no"
                    ) {
                        score += 1;
                    }


                    if (
                        isVerified(
                            universityVerification(
                                university
                            )
                        )
                    ) {
                        score += 1;
                    }


                    return {
                        university,
                        score
                    };

                }
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 6);


    renderMatchResults(
        scored
    );

}


function renderMatchResults(
    scored
) {

    const container =
        $("#matchResults");

    if (!container) {
        return;
    }


    if (!scored.length) {

        container.innerHTML = `
            <div class="empty-tool-state">
                No matching universities were found.
            </div>
        `;

        return;

    }


    container.innerHTML = `

        <div class="match-result-list">

            ${
                scored
                    .map(
                        item => {

                            const university =
                                item.university;

                            const index =
                                state.universities
                                    .indexOf(
                                        university
                                    );


                            return `

                                <article class="match-result">

                                    <span class="mini-label">
                                        MATCH ${item.score}
                                    </span>

                                    <h4>
                                        ${escapeHTML(
                                            cleanUniversityName(
                                                university
                                            )
                                        )}
                                    </h4>

                                    <p>
                                        📍
                                        ${escapeHTML(
                                            universityCity(
                                                university
                                            )
                                        )}
                                    </p>

                                    <button
                                        type="button"
                                        class="card-button primary"
                                        style="margin-top:12px;width:100%;"
                                        data-view-university="${index}"
                                    >
                                        View Profile
                                    </button>

                                </article>

                            `;

                        }
                    )
                    .join("")
            }

        </div>

    `;


    attachUniversityCardEvents();

}


/* =========================================================
   BUDGET CALCULATOR
========================================================= */

function setupBudgetCalculator() {

    const calculate =
        $("#calculateBudget");

    const reset =
        $("#resetBudget");


    if (calculate) {

        calculate.addEventListener(
            "click",
            calculateBudget
        );

    }


    if (reset) {

        reset.addEventListener(
            "click",
            resetBudget
        );

    }

}


function getNumberValue(selector) {

    const value =
        Number(
            $(selector)?.value
        );

    return Number.isFinite(value)
        ? Math.max(0, value)
        : 0;

}


function calculateBudget() {

    const tuition =
        getNumberValue(
            "#calcTuition"
        );

    const hostel =
        getNumberValue(
            "#calcHostel"
        );

    const food =
        getNumberValue(
            "#calcFood"
        );

    const transport =
        getNumberValue(
            "#calcTransport"
        );

    const insurance =
        getNumberValue(
            "#calcInsurance"
        );

    const other =
        getNumberValue(
            "#calcOther"
        );


    const living =
        food +
        transport +
        insurance +
        other;


    const total =
        tuition +
        hostel +
        living;


    setText(
        "#budgetTotal",
        rubles(total)
    );

    setText(
        "#resultTuition",
        rubles(tuition)
    );

    setText(
        "#resultHostel",
        rubles(hostel)
    );

    setText(
        "#resultLiving",
        rubles(living)
    );

    setText(
        "#budgetFiveYear",
        rubles(total * 5)
    );

}


function resetBudget() {

    [
        "#calcTuition",
        "#calcHostel",
        "#calcFood",
        "#calcTransport",
        "#calcInsurance",
        "#calcOther"
    ].forEach(
        selector => {

            const element =
                $(selector);

            if (element) {
                element.value = "";
            }

        }
    );


    setText(
        "#budgetTotal",
        "₽ 0"
    );

    setText(
        "#resultTuition",
        "₽ 0"
    );

    setText(
        "#resultHostel",
        "₽ 0"
    );

    setText(
        "#resultLiving",
        "₽ 0"
    );

    setText(
        "#budgetFiveYear",
        "₽ 0"
    );

}


/* =========================================================
   APPLICATION PATH
========================================================= */

const applicationPaths = {

    mbbs: [

        {
            title: "Check eligibility",
            text:
                "Confirm academic eligibility and any programme-specific requirements."
        },

        {
            title: "Choose university",
            text:
                "Compare medical universities, language, fees, city and available information."
        },

        {
            title: "Prepare documents",
            text:
                "Prepare passport, academic documents and other required materials."
        },

        {
            title: "Apply",
            text:
                "Submit the application through the applicable official route."
        },

        {
            title: "Admission & invitation",
            text:
                "Follow the university process and required immigration documentation."
        },

        {
            title: "Visa & arrival",
            text:
                "Complete the current visa process and prepare for arrival and enrollment."
        }

    ],


    engineering: [

        {
            title: "Choose field",
            text:
                "Select engineering, IT or another technical field."
        },

        {
            title: "Compare universities",
            text:
                "Check programmes, language, tuition, city and accommodation."
        },

        {
            title: "Prepare documents",
            text:
                "Collect academic, identity and programme-specific documents."
        },

        {
            title: "Apply",
            text:
                "Submit the application through the applicable official route."
        },

        {
            title: "Admission",
            text:
                "Complete admission steps and required formalities."
        },

        {
            title: "Visa & arrival",
            text:
                "Complete the current visa process and prepare for enrollment."
        }

    ],


    other: [

        {
            title: "Choose programme",
            text:
                "Identify your intended course and study level."
        },

        {
            title: "Research universities",
            text:
                "Compare programmes, language, cost, city and scholarship options."
        },

        {
            title: "Prepare documents",
            text:
                "Collect documents according to the current official requirements."
        },

        {
            title: "Apply",
            text:
                "Follow the university's current application procedure."
        },

        {
            title: "Admission",
            text:
                "Complete admission and receive the relevant documentation."
        },

        {
            title: "Visa & arrival",
            text:
                "Follow the applicable visa and enrollment process."
        }

    ]

};


function setupApplicationPath() {

    const buttons =
        $$(".path-option");


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    state.currentPath =
                        button.dataset.path ||
                        "other";


                    renderApplicationPath();

                }
            );

        }
    );


    renderApplicationPath();

}


function renderApplicationPath() {

    const container =
        $("#applicationTimeline");

    if (!container) {
        return;
    }


    const path =
        applicationPaths[
            state.currentPath
        ] ||
        applicationPaths.other;


    container.innerHTML =
        path
            .map(
                (step, index) => `

                    <article class="timeline-step">

                        <div class="timeline-number">
                            ${index + 1}
                        </div>

                        <h3>
                            ${escapeHTML(
                                step.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                step.text
                            )}
                        </p>

                    </article>

                `
            )
            .join("");

}


/* =========================================================
   DOCUMENT CHECKLIST
========================================================= */

function setupDocumentChecklist() {

    const checkboxes =
        $$(".document-item input");


    checkboxes.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                updateChecklistProgress
            );

        }
    );


    updateChecklistProgress();

}


function updateChecklistProgress() {

    const checkboxes =
        [...$$(
            ".document-item input"
        )];


    const total =
        checkboxes.length;


    const completed =
        checkboxes.filter(
            checkbox =>
                checkbox.checked
        ).length;


    const percentage =
        total
            ? Math.round(
                completed /
                total *
                100
            )
            : 0;


    setText(
        "#checklistProgress",
        `${percentage}%`
    );


    const bar =
        $("#checklistProgressBar");


    if (bar) {

        bar.style.width =
            `${percentage}%`;

    }

}


/* =========================================================
   AI INTERFACE
========================================================= */

function populateAIUniversities() {

    const select =
        $("#aiUniversity");

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select a university
        </option>
    `;


    state.universities.forEach(
        (university, index) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(index);

            option.textContent =
                cleanUniversityName(
                    university
                );

            select.appendChild(
                option
            );

        }
    );

}


function setupAIInterface() {

    const ask =
        $("#askAI");


    if (ask) {

        ask.addEventListener(
            "click",
            askScholarPathAI
        );

    }


    $$("[data-ai-topic]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const topic =
                            button.dataset
                                .aiTopic;


                        const textarea =
                            $("#aiQuestion");


                        if (textarea) {

                            textarea.value =
                                `Tell me about ${topic.toLowerCase()} for this university. What should I verify before applying?`;

                            textarea.focus();

                        }

                    }
                );

            }
        );

}


async function askScholarPathAI() {

    const universityIndex =
        $("#aiUniversity")?.value;

    const question =
        $("#aiQuestion")?.value.trim();


    const responseBox =
        $("#aiResponse");


    if (!question) {

        showToast(
            "Please enter your question."
        );

        return;

    }


    const university =
        universityIndex !== undefined &&
        universityIndex !== ""
            ? state.universities[
                Number(
                    universityIndex
                )
            ]
            : null;


    /*
     * Until your secure AI backend is connected,
     * provide a useful local answer based strictly
     * on the selected JSON record.
     */

    if (!university) {

        if (responseBox) {

            responseBox.innerHTML = `
                <strong>
                    Scholar Path AI
                </strong>

                <p>
                    Please select a university first.
                    Then ask your question about fees,
                    programmes, scholarships, hostel,
                    documents or admission.
                </p>
            `;

        }

        return;

    }


    const name =
        cleanUniversityName(
            university
        );


    const answer =
        buildLocalAIAnswer(
            university,
            question
        );


    if (responseBox) {

        responseBox.innerHTML = `

            <strong>
                Scholar Path AI • ${escapeHTML(name)}
            </strong>

            <p>
                ${escapeHTML(answer)}
            </p>

            <p>
                <strong>
                    Verification reminder:
                </strong>
                This response uses the university information
                currently available in the Scholar Path Russia
                database. Verify current requirements and costs
                with official sources before applying.
            </p>

        `;

    }

}


function buildLocalAIAnswer(
    university,
    question
) {

    const q =
        normalizeText(question);


    if (
        q.includes("fee") ||
        q.includes("cost") ||
        q.includes("tuition")
    ) {

        return `
            The database currently lists tuition as
            ${rubles(
                universityTuition(
                    university
                )
            )}.
            Hostel information is listed as
            ${rubles(
                universityHostel(
                    university
                )
            )}.
        `;

    }


    if (
        q.includes("hostel") ||
        q.includes("accommodation")
    ) {

        return `
            The current database lists hostel information as
            ${rubles(
                universityHostel(
                    university
                )
            )}.
            Confirm the current accommodation fee,
            room type and availability directly with the university.
        `;

    }


    if (
        q.includes("scholarship")
    ) {

        return `
            The database records the following scholarship information:
            ${universityScholarship(
                university
            ) || "No scholarship information is currently listed"}.
            This should be checked against the current official scholarship
            announcement before applying.
        `;

    }


    if (
        q.includes("english") ||
        q.includes("language") ||
        q.includes("medium")
    ) {

        return `
            The database lists the instruction information as:
            ${
                universityMedium(
                    university
                ).join(", ") ||
                "Not listed"
            }.
            English-programme information is listed as:
            ${
                universityEnglishPrograms(
                    university
                ) || "Not listed"
            }.
        `;

    }


    if (
        q.includes("programme") ||
        q.includes("program") ||
        q.includes("course") ||
        q.includes("study")
    ) {

        return `
            The database lists these fields/programmes:
            ${
                universityFields(
                    university
                ).join(", ") ||
                "Not listed"
            }.
        `;

    }


    if (
        q.includes("city") ||
        q.includes("location")
    ) {

        return `
            This university is listed in
            ${universityCity(
                university
            )}${
                universityRegion(
                    university
                )
                    ? `, ${universityRegion(
                        university
                    )}`
                    : ""
            }.
        `;

    }


    return `
        The current database information for this university includes
        its location, fields/programmes, instruction language, tuition,
        hostel and scholarship/verification information where available.
        For a reliable answer to your specific question, the corresponding
        official university source should be checked.
    `;

}


/* =========================================================
   CONTACT / GOOGLE FORM
========================================================= */

function setupContactForm() {

    const form =
        $("#contactForm");

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            submitContactForm();

        }
    );

}


function submitContactForm() {

    const name =
        $("#contactName")?.value.trim();

    const whatsapp =
        $("#contactWhatsApp")?.value.trim();

    const email =
        $("#contactEmail")?.value.trim();

    const programme =
        $("#contactProgramme")?.value;

    const country =
        $("#contactCountry")?.value.trim();

    const message =
        $("#contactMessage")?.value.trim();


    const messageBox =
        $("#contactFormMessage");


    if (!name || !email) {

        if (messageBox) {

            messageBox.textContent =
                "Please enter your name and email.";

            messageBox.style.color =
                "#b64a4a";

        }

        return;

    }


    /*
     * If a Google Form URL is configured,
     * open it for submission.
     *
     * Otherwise provide a clear message.
     */

    if (CONFIG.GOOGLE_FORM_URL) {

        const params =
            new URLSearchParams({

                name,

                whatsapp,

                email,

                programme,

                country,

                message

            });


        const url =
            `${CONFIG.GOOGLE_FORM_URL}?${params.toString()}`;


        window.open(
            url,
            "_blank",
            "noopener"
        );


        if (messageBox) {

            messageBox.textContent =
                "Your application form has been opened.";

            messageBox.style.color =
                "#277a59";

        }

    } else {

        if (messageBox) {

            messageBox.innerHTML = `
                Form interface is ready.
                Add your Google Form URL in
                <strong>app.js → CONFIG.GOOGLE_FORM_URL</strong>
                to connect submissions.
            `;

            messageBox.style.color =
                "#9c7938";

        }

    }

}


/* =========================================================
   UTILITY: SET TEXT
========================================================= */

function setText(
    selector,
    text
) {

    const element =
        $(selector);

    if (element) {

        element.textContent =
            text;

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message
) {

    const toast =
        $("#toast");

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   HERO QUICK BUTTONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".hero-topic"
            );


        if (!button) {
            return;
        }


        const field =
            button.dataset.field;


        if (field) {

            const programme =
                $("#programmeFilter");


            if (programme) {

                const matchingOption =
                    [...programme.options]
                        .find(
                            option =>
                                normalizeText(
                                    option.value
                                ).includes(
                                    normalizeText(
                                        field
                                    )
                                )
                        );


                if (matchingOption) {

                    programme.value =
                        matchingOption.value;

                }

            }


            performUniversitySearch();

        }

    }
);


/* =========================================================
   GENERAL IMAGE ERROR HANDLING
========================================================= */

document.addEventListener(
    "error",
    event => {

        const target =
            event.target;


        if (
            target &&
            target.tagName === "IMG"
        ) {

            target.style.opacity =
                "0";

        }

    },
    true
);


/* =========================================================
   PREVENT BROKEN EMPTY LINKS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                "a"
            );


        if (!link) {
            return;
        }


        const href =
            link.getAttribute(
                "href"
            );


        if (
            href === "#" ||
            href === ""
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   DEBUG INFORMATION
========================================================= */

window.ScholarPathRussia = {

    state,

    config: CONFIG,

    search:
        performUniversitySearch,

    calculateBudget,

    openUniversityModal,

    closeUniversityModal,

    renderCities,

    runUniversityMatch,

    renderComparison

};


console.log(
    "Scholar Path Russia application initialized."
);
