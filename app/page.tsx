"use client";
import { useState } from "react";
import ChatBoxSpeechApi from "./components/chatBox/ChatBoxSpeechApi";
import ChatBoxWhisper from "./components/chatBox/ChatBoxWhisper";

export default function Home() {
  const [speechToText, setSpeechToText] = useState<"speech api" | "whisper">(
    "speech api",
  );
  return (
    <main className="flex flex-col items-center">
      <div className="flex justify-evenly items-center w-full">
        <div className="w-4/12 h-10">{" "}</div>
        <h1 className="text-white text-3xl m-7  place-self-center">BabelBot</h1>
        <div className="flex justify-center w-4/12 h-10 gap-2">
          <button
            onClick={() => setSpeechToText("whisper")}
            style={{ background: speechToText === "whisper" ? "#3479BB" : "" }}
            className="text-white border p-2 rounded-lg mb-3 bg-bg-dark hover:bg-slate-700 h-10"
          >
            whisper
          </button>
          <button
            onClick={() => setSpeechToText("speech api")}
            style={{
              background: speechToText === "speech api" ? "#3479BB" : "",
            }}
            className="text-white border p-2 rounded-lg mb-3 bg-bg-dark hover:bg-slate-700 h-10"
          >
            speech api
          </button>
        </div>
      </div>
      {speechToText === "speech api" && <ChatBoxSpeechApi />}
      {speechToText === "whisper" && <ChatBoxWhisper />}
    </main>
  );
}
