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
    console.log("prompt", imagePrompt)

    const response = await openai.createImage({
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
    });
    const image_url = response.data.data[0].url;

    let result: string | undefined = image_url
    console.log("RETURNED RESULT", result)
    // let slicedResult = result!.slice(result!.indexOf("{"))
    // console.log("SLICED RESULT", slicedResult)
    // try {
    //   if (result) {
    //     JSON.parse(result)
    //   }
    // } catch (err: any) {
    //   return NextResponse.json({
    //     error: `PARSE ERROR: ${err.message}`
    //   })
    // }
    return NextResponse.json({
      result: result,
    });
  } catch (error) {
    return NextResponse.json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
}


