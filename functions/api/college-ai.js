export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const university = body.university || "";
    const question = body.question || "";

    if (!university && !question) {
      return Response.json(
        { error: "Please enter a university or question." },
        { status: 400 }
      );
    }

    const prompt = `
You are the official AI University Assistant for Scholar Path Russia
by Virangeeta Navigators.

Your job is to help students understand universities and study opportunities,
especially universities in Russia.

University selected:
${university || "Not specified"}

Student question:
${question || "Give a complete overview."}

Give a clear, professional and student-friendly answer.

Cover relevant information such as:
1. University overview
2. Location
3. Popular programs
4. Medicine / MBBS if applicable
5. Admission requirements
6. Duration
7. Tuition fees
8. Scholarships
9. Medium of instruction
10. Hostel and accommodation
11. Living expenses
12. International student environment
13. Advantages
14. Things students should verify before admission
15. Documents normally required
16. A short conclusion

IMPORTANT:
- Do not invent exact fees, rankings, recognition, eligibility or admission rules.
- If current information is not available, clearly say that the student
  should verify it with the university or official authority.
- Do not claim that a university is recognized by an authority unless
  reliable information is provided.
- Do not present estimates as official figures.
- Keep the answer organized with headings and bullet points.
- Be helpful but honest.
- This is an educational guidance assistant, not a legal or regulatory authority.

At the end, give:
"Need help with this university? Ask me about admission, fees,
scholarships, MBBS, hostel, documents or comparison."
`;

    const answer = await context.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      {
        prompt: prompt,
        max_tokens: 1200
      }
    );

    return Response.json({
      success: true,
      answer: answer.response || answer
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "AI assistant is temporarily unavailable."
      },
      { status: 500 }
    );
  }
}
