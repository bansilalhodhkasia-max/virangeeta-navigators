// Scholar Path Russia
// AI University Assistant
// Cloudflare Pages Function
//
// File:
// functions/api/college-ai.js
//
// Requires a Cloudflare Workers AI binding named:
// AI

const MODEL = "@cf/openai/gpt-oss-20b";

const JSON_PATH = "/data/universities.json";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

function clean(value, max = 5000) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function normalise(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function universityText(u) {
  if (!u) return "";

  return [
    `University: ${u.name || "Not listed"}`,
    `ID: ${u.id || "Not listed"}`,
    `City: ${u.city || "Not listed"}`,
    `Region: ${u.region || "Not listed"}`,
    `Country: ${u.country || "Russia"}`,
    `Established: ${u.established || "Not listed"}`,
    `About: ${u.about || "Not listed"}`,
    `Category: ${u.category || "Not listed"}`,
    `Fields: ${Array.isArray(u.fields) ? u.fields.join(", ") : (u.fields || "Not listed")}`,
    `Medium: ${u.medium || "Not verified"}`,
    `English programmes: ${u.english_programs || "Not verified"}`,
    `Russian programmes: ${u.russian_programs || "Not verified"}`,
    `International students: ${u.international_students || "Not verified"}`,
    `Scholarship field: ${u.scholarship || "Not listed"}`,
    `Tuition fee: ${u.tuition_fee || "Not verified"}`,
    `Tuition status: ${u.tuition_status || "Not verified"}`,
    `Hostel fee: ${u.hostel_fee || "Not verified"}`,
    `Hostel status: ${u.hostel_status || "Not verified"}`,
    `Open Doors: ${u.openDoors || "Not listed"}`,
    `Scholarship pathway: ${u.scholarshipPathway || "Not listed"}`,
    `Government scholarship: ${u.governmentScholarship || "Not verified"}`,
    `Official website: ${u.official_website || "Not listed"}`,
    `Official fee source: ${u.official_fee_source || "Not listed"}`,
    `Study in Russia: ${u.study_in_russia || "Not listed"}`,
    `Verification status: ${u.verification_status || "Not verified"}`,
    `Last verified: ${u.last_verified || "Not listed"}`
  ].join("\n");
}

function scholarshipPresent(u) {
  if (!u) return false;

  const values = [
    u.openDoors,
    u.scholarshipPathway,
    u.governmentScholarship,
    u.scholarship
  ]
    .map(x => String(x || "").toLowerCase());

  return values.some(x =>
    x === "present" ||
    x === "available" ||
    x === "yes" ||
    x === "verified"
  );
}

function scoreUniversity(u, query) {
  const q = normalise(query);

  if (!q) return 0;

  const name = normalise(u.name);
  const city = normalise(u.city);
  const region = normalise(u.region);
  const category = normalise(u.category);

  const fields = Array.isArray(u.fields)
    ? u.fields.map(normalise).join(" ")
    : normalise(u.fields);

  const about = normalise(u.about);

  let score = 0;

  if (name === q) score += 100;
  if (name.includes(q)) score += 70;
  if (q.includes(name) && name.length > 4) score += 60;

  if (city.includes(q)) score += 35;
  if (region.includes(q)) score += 25;
  if (category.includes(q)) score += 20;
  if (fields.includes(q)) score += 20;
  if (about.includes(q)) score += 10;

  return score;
}

function findUniversity(universities, value) {
  const query = normalise(value);

  if (!query) return null;

  // Exact name first
  let found = universities.find(
    u => normalise(u.name) === query
  );

  if (found) return found;

  // ID
  found = universities.find(
    u => normalise(u.id) === query
  );

  if (found) return found;

  // Name contains query
  found = universities.find(
    u => normalise(u.name).includes(query)
  );

  if (found) return found;

  // Query contains name
  found = universities.find(
    u => query.includes(normalise(u.name))
  );

  return found || null;
}

async function loadUniversities(request) {
  const url = new URL(JSON_PATH, request.url);

  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Could not load university database. HTTP ${response.status}`
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.universities)) {
    return data.universities;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  throw new Error("University database format is invalid.");
}

function extractQuestion(body) {
  return clean(
    body.question ||
    body.query ||
    body.prompt ||
    body.message ||
    body.userQuestion ||
    "",
    6000
  );
}

function extractUniversityName(body) {
  if (typeof body.selectedUniversity === "string") {
    return clean(body.selectedUniversity, 300);
  }

  if (typeof body.university === "string") {
    return clean(body.university, 300);
  }

  if (typeof body.universityName === "string") {
    return clean(body.universityName, 300);
  }

  if (body.selectedUniversity && typeof body.selectedUniversity === "object") {
    return clean(
      body.selectedUniversity.name ||
      body.selectedUniversity.university ||
      "",
      300
    );
  }

  if (body.university && typeof body.university === "object") {
    return clean(
      body.university.name ||
      body.university.university ||
      "",
      300
    );
  }

  return "";
}

function extractMessages(body) {
  if (!Array.isArray(body.messages)) {
    return [];
  }

  return body.messages
    .filter(m =>
      m &&
      typeof m === "object" &&
      ["user", "assistant"].includes(m.role)
    )
    .slice(-8)
    .map(m => ({
      role: m.role,
      content: clean(m.content, 4000)
    }))
    .filter(m => m.content);
}

function buildSystemPrompt() {
  return `
You are Scholar Path AI, the official AI university assistant
for Scholar Path Russia by Virangeeta Navigators.

Your job is to help students understand Russian universities,
admission, MBBS/Medicine, tuition, hostel, scholarships,
English-medium programmes, documents and student considerations.

IMPORTANT DATABASE RULES:

1. The university database supplied below is your primary source.
2. Never invent tuition fees.
3. Never invent hostel fees.
4. Never claim a scholarship is guaranteed.
5. Never claim English-medium study is available unless the supplied
   database says it is verified.
6. If a field says "Not verified", "Not listed", is empty, or is missing,
   clearly say that the database does not currently verify that information.
7. Do not silently replace database information with assumptions.
8. If the student asks about something that is not contained in the
   database, say that the available database does not establish it.
9. When discussing fees, preserve the currency and wording from the database.
10. Always distinguish between "Present", "Not listed", "Verified",
    "Not verified", and other database statuses.
11. Scholarship pathways are NOT guarantees.
12. Admission eligibility and recognition should be verified with the
    university and relevant official authorities before a student applies.
13. Do not make legal, immigration, medical licensing, or regulatory
    guarantees.
14. If the student asks a simple question, answer directly.
15. If useful, use short headings and bullet points.
16. Be professional, helpful and realistic.
17. Do not mention that you are an AI model unless necessary.
18. Do not fabricate information merely to make the answer complete.

For university-specific questions, prioritize the supplied university record.

If information is missing, say:
"The current Scholar Path Russia database does not verify this."

Do not present guesses as facts.
`;
}

function buildUserPrompt(question, selectedUniversity, relevantUniversities) {
  let context = "";

  if (selectedUniversity) {
    context += `
SELECTED UNIVERSITY
===================
${universityText(selectedUniversity)}
`;
  }

  if (relevantUniversities.length > 0) {
    context += `
OTHER RELEVANT DATABASE RECORDS
===============================
${relevantUniversities
  .map((u, i) => `--- Record ${i + 1} ---\n${universityText(u)}`)
  .join("\n\n")}
`;
  }

  return `
${context}

STUDENT QUESTION
================
${question}

Answer the student's question using the database information above.

If the question concerns the selected university, focus primarily
on that university.

If the database does not contain enough information, explicitly say
what is not verified rather than guessing.

Do not fabricate current fees, scholarships, recognition,
admission requirements or deadlines.
`;
}

async function runAI(env, systemPrompt, userPrompt, history) {
  if (!env || !env.AI) {
    throw new Error(
      "Workers AI binding 'AI' is not configured."
    );
  }

  const messages = [
    {
      role: "system",
      content: systemPrompt
    }
  ];

  for (const message of history) {
    messages.push({
      role: message.role,
      content: message.content
    });
  }

  messages.push({
    role: "user",
    content: userPrompt
  });

  const result = await env.AI.run(MODEL, {
    messages,
    max_tokens: 900,
    temperature: 0.25
  });

  return result;
}

function extractAIText(result) {
  if (!result) return "";

  if (typeof result === "string") {
    return result.trim();
  }

  if (typeof result.response === "string") {
    return result.response.trim();
  }

  if (typeof result.text === "string") {
    return result.text.trim();
  }

  if (result.result && typeof result.result === "string") {
    return result.result.trim();
  }

  if (
    result.result &&
    typeof result.result.response === "string"
  ) {
    return result.result.response.trim();
  }

  if (
    result.result &&
    typeof result.result.text === "string"
  ) {
    return result.result.text.trim();
  }

  if (Array.isArray(result.choices)) {
    const choice = result.choices[0];

    if (
      choice &&
      choice.message &&
      typeof choice.message.content === "string"
    ) {
      return choice.message.content.trim();
    }

    if (
      choice &&
      typeof choice.text === "string"
    ) {
      return choice.text.trim();
    }
  }

  return "";
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const question = extractQuestion(body);

    if (!question) {
      return json(
        {
          success: false,
          error: "Please enter a question."
        },
        400
      );
    }

    const universityName = extractUniversityName(body);

    // Load the REAL university database
    const universities =
      await loadUniversities(context.request);

    if (!Array.isArray(universities) || universities.length === 0) {
      throw new Error(
        "University database is empty."
      );
    }

    // Find selected university
    const selectedUniversity =
      findUniversity(
        universities,
        universityName
      );

    // Find a few other relevant records.
    // This allows comparison questions to work
    // without sending the entire 136-record database
    // to the AI on every request.
    const relevantUniversities = universities
      .filter(u =>
        !selectedUniversity ||
        u.id !== selectedUniversity.id
      )
      .map(u => ({
        university: u,
        score: scoreUniversity(
          u,
          question
        )
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(x => x.university);

    const history =
      extractMessages(body);

    const systemPrompt =
      buildSystemPrompt();

    const userPrompt =
      buildUserPrompt(
        question,
        selectedUniversity,
        relevantUniversities
      );

    const aiResult =
      await runAI(
        context.env,
        systemPrompt,
        userPrompt,
        history
      );

    const answer =
      extractAIText(aiResult);

    if (!answer) {
      console.error(
        "Workers AI returned an unexpected response:",
        JSON.stringify(aiResult)
      );

      throw new Error(
        "The AI model returned an empty response."
      );
    }

    return json({
      success: true,

      // Main response
      response: answer,

      // Compatibility aliases for different frontend versions
      answer: answer,
      text: answer,

      // Useful information for the frontend
      university: selectedUniversity
        ? selectedUniversity.name
        : universityName || null,

      universityFound: Boolean(
        selectedUniversity
      ),

      databaseRecords: universities.length,

      // Keep this for debugging without exposing
      // the entire database to the browser.
      model: MODEL
    });

  } catch (error) {

    console.error(
      "Scholar Path AI error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return json(
      {
        success: false,
        error:
          "Scholar Path AI is temporarily unavailable.",
        details: message
      },
      500
    );
  }
}
