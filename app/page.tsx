"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

// components
import ChatBoxSpeechApi from "./components/chatBox/ChatBoxSpeechApi";
import ChatBoxWhisper from "./components/chatBox/ChatBoxWhisper";
import Login from "./components/Login";
import OptionsModal from "./components/OptionsModal";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [language, setLanguage] = useState("");
  const [greeting, setGreeting] = useState("");
  const [scenario, setScenario] = useState<number | null>(null);
  const [speechToText, setSpeechToText] = useState<
    "speech api" | "whisper" | ""
  >("");

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setIsLoggedIn(true);
    }
  }, [session]);

  const validateInputs = () => {
    if (
      nativeLanguage &&
      language &&
      voice &&
      scenario != null &&
      scenario >= 0
    ) {
      return true;
    }
    alert("choose a value from each drop down list");
    setSpeechToText("");
    setIsOpen(true);
    return false;
  };

  if (isOpen === false) {
    validateInputs();
  }

  return (
    <main className="flex justify-center items-start w-screen h-screen mt-7">
      {!isLoggedIn && <Login />}

      {isLoggedIn && isOpen && (
        <OptionsModal
          setNativeLanguage={setNativeLanguage}
          setLanguage={setLanguage}
          setVoice={setVoice}
          setGreeting={setGreeting}
          setScenario={setScenario}
          setIsOpen={setIsOpen}
        />
      )}

      {isLoggedIn && !isOpen && (
        <div className="flex flex-col justify-center items-center w-screen">
          <button
            className="text-white hover:text-slate-400 absolute top-0 right-0 m-2"
            onClick={() => signOut()}
          >
            Logout
          </button>
          <div className="flex flex-col gap-2 w-6/12 min-w-[300px] items-center mt-4">
            <h1 className="whitespace-nowrap text-white text-3xl">
              Multilingual ChatBot
            </h1>

            <span className="self-start text-gray-400 text-xs">
              Transcription service:
            </span>
          </div>
          <div className="flex justify-between items-end w-6/12 min-w-[300px] gap-2">
            <div className="flex flex-wrap md:flex-no-wrap items-end">
              <button
                onClick={() => setSpeechToText("whisper")}
                style={{
                  background: speechToText === "whisper" ? "#3479BB" : "",
                }}
                className="text-white whitespace-nowrap hover:text-slate-400"
              >
                Whisper
              </button>
              <span className="text-white mx-1 xs:hidden">|</span>
              <button
                onClick={() => setSpeechToText("speech api")}
                style={{
                  background: speechToText === "speech api" ? "#3479BB" : "",
                }}
                className="text-white whitespace-nowrap hover:text-slate-400"
              >
                WebSpeech API
              </button>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="text-white flex-shrink-0 ml-auto self-end whitespace-nowrap hover:text-slate-400"
            >
              Options
            </button>
          </div>
          {speechToText === "" && (
            <div className="w-6/12 min-h-[75vh] bg-gradient-to-b from-chat-container-dark to-chat-container-light relative mx-auto my-1 p-2 rounded-xl flex flex-col justify-end items-center min-w-[300px]"></div>
          )}
          {speechToText === "speech api" && (
            <ChatBoxSpeechApi
              nativeLanguage={nativeLanguage}
              language={language}
              voice={voice}
              greeting={greeting}
              scenario={scenario}
            />
          )}
          {speechToText === "whisper" && (
            <ChatBoxWhisper
              nativeLanguage={nativeLanguage}
              language={language}
              voice={voice}
              greeting={greeting}
              scenario={scenario}
            />
          )}
        </div>
      )}
    </main>
  );
}
