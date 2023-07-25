"use client";
import { useState, useEffect } from "react";
import ChatBoxSpeechApi from "./components/chatBox/ChatBoxSpeechApi";
import ChatBoxWhisper from "./components/chatBox/ChatBoxWhisper";

export default function Home() {
  const [speechToText, setSpeechToText] = useState<"speech api" | "whisper" | "">(
    "",
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | undefined | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)

  useEffect(() => {
    // Fetch available voices on mount
    const fetchVoices = () => {
      const speechSynthesis = window.speechSynthesis;
      if (speechSynthesis) {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      }
    };

    fetchVoices();

    // Event listener to update voices when they change (e.g., browser updates)
    window.speechSynthesis.onvoiceschanged = () => {
      fetchVoices();
    };
  }, []);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    // Handle language selection here
    let selected: string | string[]= event.target.value;
    selected = selected.split(",")
    const voice: SpeechSynthesisVoice | undefined = voices.find((voice) => selected[0] === voice.name)
    console.log("VOICE", voice)
    setSelectedVoice(voice)
    setSelectedLanguage(selected[1])
    console.log("Selected language:", selected);
  };

  return (
    <main className="flex flex-col items-center">
      <div className="flex justify-evenly items-center w-full">
        <div className="w-4/12 h-10">
          <select className="w-48" onChange={handleLanguageChange}>
            {voices.map((voice) => (
              <option key={voice.name} value={`${voice.name}, ${voice.lang}`}>
                {voice.name} - {voice.lang}
              </option>
            ))}
          </select>
        </div>
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
      {speechToText === "whisper" && <ChatBoxWhisper selectedLanguage={selectedLanguage} selectedVoice={selectedVoice}/>}
    </main>
  );
}
