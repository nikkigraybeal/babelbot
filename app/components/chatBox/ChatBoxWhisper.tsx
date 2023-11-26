"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import micIcon from "../../../public/micIcon.svg";
import speakerIcon from "../../../public/speakerIcon.svg";
import Image from "next/image";
import { systemPrompt, scenarios } from "../../../utils/systemPrompt";
import { langData } from "@/data/languages";

interface Props {
  nativeLanguage: string;
  voice: SpeechSynthesisVoice | null;
  language: string;
  greeting: string;
  scenario: number | null;
}

const ChatBoxWhisper = ({
  nativeLanguage,
  voice,
  language,
  greeting,
  scenario,
}: Props) => {
  const [promptHistory, setPromptHistory] = useState<Prompt[]>([
    {
      role: "system",
      content: systemPrompt(language, nativeLanguage, scenarios[scenario!]),
    },
  ]);
  const [dialogue, setDialogue] = useState<Prompt[]>([]);
  const [suggestions, setSuggestions] = useState<string[][]>([]); // [[suggested res, translation]]
  const [userInput, setUserInput] = useState<Prompt>({
    role: "user",
    content: greeting,
  });
  //const [spacebarPressed, setSpacebarPressed] = useState<boolean>(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [synthesizedSpeech, setSynthesizedSpeech] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const langCode = langData.find(lang => { lang.language === language})?.langCode

  //// CHAT COMPLETION /////
  console.log("USER INPUT", userInput);
  const getCompletion = async () => {
    try {
      setIsLoading(true);
      const messages = userInput
        ? [...promptHistory, userInput]
        : [...promptHistory];
      const res = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const data = await res.json();
      if (data.error) {
        console.log("ERROR", data.error);
        return;
      }

      setPromptHistory([
        ...messages,
        { role: "assistant", content: data.result },
      ]);

      const result = JSON.parse(data.result);
      setIsLoading(false);
      setDialogue([
        ...dialogue,
        { ...userInput },
        { role: "assistant", content: result.assistant },
      ]);
      setUserInput({ ...userInput, content: "" });
      speakText(result.assistant[0]);

      setSuggestions(result.suggestions);
      result.suggestions.map((suggestion: string) => speakText(suggestion[0]));
    } catch {
      throw new Error("something went wrong");
    }
  };

  useEffect(() => {
    if (!userInput.content) {
      return;
    }
    setDialogue([...dialogue, { ...userInput }]);
    getCompletion();
  }, [userInput]);

  ////// SPEECH TO TEXT ///////
  // set up media recorder on mount
  useEffect(() => {
    let chunks: any = [];
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newMediaRecorder: MediaRecorder = new MediaRecorder(stream);
          newMediaRecorder.onstart = () => {
            chunks = [];
          };
          newMediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
          };
          newMediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });

            try {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async function () {
                let base64Audio;
                if (typeof reader.result === "string") {
                  base64Audio = reader.result?.split(",")[1]; // Remove the data URL prefix
                }
                const response = await fetch("/api/transcribe", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ audio: base64Audio, language: langCode }),
                });
                const data = await response.json();
                if (response.status !== 200) {
                  throw (
                    data.error ||
                    new Error(`Request failed with status ${response.status}`)
                  );
                }
                setUserInput({ role: "user", content: data.result });
              };
            } catch (error: any) {
              console.error(error);
              alert(error.message);
            }
          };
          setMediaRecorder(newMediaRecorder);
        })
        .catch((err) => console.error("Error accessing microphone:", err));
    }
  }, []);

  // Function to start recording
  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };
  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  ////// TEXT TO SPEECH //////
  useEffect(() => {
    if (synthesizedSpeech) {
      synthesizedSpeech.onend = () => {
        // The speech synthesis has finished.
        // implement additional logic here if needed.
      };
      synthesizedSpeech.onerror = (error) => {
        console.error("Error during speech synthesis:", error);
      };
    }
  }, [synthesizedSpeech]);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = language;
      utterance.text = text;
      utterance.rate = 0.8;
      setSynthesizedSpeech(utterance);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    // CHAT CONTAINER
    <div className="w-6/12 min-h-[75vh] bg-gradient-to-b from-chat-container-dark to-chat-container-light relative mx-auto my-1 p-2 rounded-xl flex flex-col justify-end items-center min-w-[300px]">
      <div className="scroll-container overflow-y-scroll w-full flex flex-col justfy-end items-center">
        {dialogue.map((line, idx) => {
          return idx != 0 ? (
            <div
              className={`text-white p-3 my-2 rounded-chat-bubble rounded-bl-none max-w-xs ${
                line.role === "user"
                  ? "self-end bg-bg-dark"
                  : "self-start bg-micbox-light"
              }
            `}
              key={idx}
            >
              {line.role === "user" ? (
                line.content
              ) : (
                <div>
                  <p
                    className="text-md"
                    onClick={() => {
                      speakText(line.content[0]); // Speak the assistant's response
                    }}
                  >
                    <Image
                      className="inline-block relative bottom-1 mr-1"
                      src={speakerIcon}
                      alt="speaker icon"
                      height="20"
                      width="20"
                    />
                    {line.content[0]}
                  </p>
                  <p className="text-white block ml-8 text-sm opacity-75">
                    {line.content[1]}
                  </p>
                </div>
              )}
            </div>
          ) : (
            ""
          );
        })}
        {isLoading && "loading..."}
      </div>
      {/* SUGGESTON BOX */}
      <div
        style={{ height: "auto", minHeight: "250px" }}
        className="flex flex-col justify-end items-center w-full bg-gradient-to-b from-micbox-light to-micbox-dark rounded-t-xl"
      >
        <div className="scroll-container overflow-y-scroll w-full">
          {suggestions.length > 0 &&
            suggestions.map((suggestion) => {
              return (
                <div
                  key={suggestion[0]}
                  className="self-start flex-col flex-start w-full"
                >
                  <div
                    className="flex ml-2"
                    onClick={() => {
                      speakText(suggestion[0]); // Speak the suggestion
                    }}
                  >
                    <Image
                      className="inline-block "
                      src={speakerIcon}
                      alt="speaker icon"
                      height="20"
                      width="20"
                    />
                    <p className="text-white block text-md ml-2">
                      {suggestion[0]}
                    </p>
                  </div>
                  <p className="text-white block ml-12 mb-1 text-sm opacity-75">
                    {suggestion[1]}
                  </p>
                  <hr className="border-chat-container-light border"></hr>
                </div>
              );
            })}
        </div>
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            background: recording ? "#fc5151" : "#13ABCB",
          }}
          className="rounded-full my-2"
        >
          <Image
            className="text-white"
            src={micIcon}
            alt="mic icon"
            height="75"
            width="75"
          />
        </button>
      </div>
    </div>
  );
};

export default ChatBoxWhisper;
