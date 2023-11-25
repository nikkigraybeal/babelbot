// Import necessary libraries
import { Configuration, OpenAIApi } from "openai";
import fs from 'fs';
import { NextResponse, NextRequest } from "next/server";
import { exec } from 'child_process';
import util from 'util'

// Promisify the exec function from child_process
const execAsync = util.promisify(exec);
// Configure the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(request: NextRequest) {
  // Check if the OpenAI API key is configured
  if (!configuration.apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured, please follow instructions in README.md" }, {status:500});
  }
  const req = await request.json()
  // Extract the audio data from the request body
  const base64Audio = req.audio;
  // Convert the Base64 audio data back to a Buffer
  const audio = Buffer.from(base64Audio, 'base64');
  try {
    // Convert the audio data to text
    const text = await convertAudioToText(audio);
    // Return the transcribed text in the response
    return NextResponse.json({result: text}, {status:200});
  } catch(error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return NextResponse.json({ error: error.response.data }, {status:500});
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      return NextResponse.json({ error: "An error occurred during your request." }, {status:500});
    }
  }
}
// This function converts audio data to text using the OpenAI API
async function convertAudioToText(audioData: Buffer) {
  // Convert the audio data to MP3 format
  const mp3AudioData = await convertAudioToMp3(audioData);
  // Write the MP3 audio data to a file
  const outputPath = '/tmp/output.mp3';
  fs.writeFileSync(outputPath, mp3AudioData);

  // Type assertion to treat ReadStream as File
  const fileStream: fs.ReadStream = fs.createReadStream(outputPath) as fs.ReadStream;

  // Transcribe the audio
  const response = await openai.createTranscription(
      fileStream as unknown as File,
      'whisper-1'
  );
  // Delete the temporary file
  fs.unlinkSync(outputPath);
  // The API response contains the transcribed text
  const transcribedText = response.data.text;
  return transcribedText;
}
// This function converts audio data to MP3 format using ffmpeg
async function convertAudioToMp3(audioData: any) {
  // Write the audio data to a file
  const inputPath = '/tmp/input.webm';
  fs.writeFileSync(inputPath, audioData);
  // Convert the audio to MP3 using ffmpeg
  const outputPath = '/tmp/output.mp3';
  await execAsync(`ffmpeg -i ${inputPath} ${outputPath}`);
  // Read the converted audio data
  const mp3AudioData = fs.readFileSync(outputPath);
  // Delete the temporary files
  fs.unlinkSync(inputPath);
  fs.unlinkSync(outputPath);
  return mp3AudioData;
}

