import { Configuration, OpenAIApi } from "openai";
import { NextRequest, NextResponse } from "next/server";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(req: NextRequest) {
  if (!configuration.apiKey) {
    return NextResponse.json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
  }

  try {
    const imagePrompt = await req.json(); // res now contains body
    console.log("prompt", imagePrompt.prompt)

    const response = await openai.createImage({
      prompt: imagePrompt.prompt,
      n: 1,
      size: "1024x1024",
    });
    const image_url = response.data.data[0].url;

    let result: string | undefined = image_url
    console.log("RETURNED RESULT", result)
    return NextResponse.json({
      result: result,
    }) 
  } catch (error: any) {
    if (error.response) {
      console.log("STATUS:", error.response.status);
      console.log("ERROR:", error.response.data);
      return NextResponse.json({
        error: {
          message: "An error occurred during your request.",
        },
      })
    } else {
      console.log("ERROR:", error.message);
      return NextResponse.json({
        error: {
          message: "An error occurred during your request.",
        },
      })
    }
  }

 
}


