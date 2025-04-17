import OpenAI from 'openai';
import { NextResponse } from 'next/server';
// Import the schema definition from the JSON file
import customWorkoutSchemaDefinition from '@/lib/schemas/custom-workout.schema.json';
// No need to import specific types for response_format variable

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the response_format object - REMOVED the schema key
const responseFormatOptions = {
    type: "json_object" as const, // Use 'as const' for stricter typing if desired
    // schema: customWorkoutSchemaDefinition // <--- REMOVED THIS LINE
};


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Add a system prompt to guide the AI - Updated for RxW format
    const systemPrompt = {
      role: "system",
      content: `You are a helpful fitness assistant. Generate a custom workout plan based on the user's request.
      You MUST respond ONLY with a valid JSON object that strictly adheres to the following JSON schema:
      ${JSON.stringify(customWorkoutSchemaDefinition)}
      Ensure the 'date' and 'lastPerformed' fields are valid YYYY-MM-DD dates or an empty string for lastPerformed if not applicable.
      Ensure the 'sets.value' field strictly follows the 'RxW' numeric format (e.g., '10x50').
      Calculate 'volume' correctly as reps * weight * number of sets for the exercise.`
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Correct model name
      messages: [systemPrompt, ...messages],
      // Pass the simplified object directly to response_format
      response_format: responseFormatOptions,
      temperature: 0.7,
      // max_tokens: 1000,
    });

    const assistantMessage = response.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json({ error: 'Failed to get response from OpenAI' }, { status: 500 });
    }

    // Validate if the response is actually JSON before sending back (optional but recommended)
    try {
        JSON.parse(assistantMessage); // Try parsing
    } catch {
        console.error("OpenAI response was not valid JSON:", assistantMessage);
        return NextResponse.json({ error: 'Received invalid JSON response from AI' }, { status: 500 });
    }


    return NextResponse.json({ response: assistantMessage });

  } catch (error) {
    console.error('[API Chat Error]', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
     if (error instanceof OpenAI.APIError) {
      errorMessage = `OpenAI Error: ${error.status} ${error.name} ${error.message}`;
      // You might want to inspect error.error or error.body for more details from OpenAI
      console.error('OpenAI API Error Details:', error.error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 