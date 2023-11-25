"use client";
import React, { useEffect, useState, useRef } from "react";
import micIcon from "../../../public/micIcon.svg";
import speakerIcon from "../../../public/speakerIcon.svg";
import Image from "next/image";
import { systemPrompt, scenarios } from "@/utils/systemPrompt";

interface Props {
  nativeLanguage: string;
  voice: SpeechSynthesisVoice | null;
  language: string;
  greeting: string;
  scenario: number | null;
}

const ChatBoxSpeechApi = ({
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
  const [spacebarPressed, setSpacebarPressed] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const [synthesizedSpeech, setSynthesizedSpeech] =
    useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (dialogue.length > 0) {
      const last = dialogue.length - 1;
      speakText(dialogue[last].content[0]);
      suggestions.map((suggestion) => speakText(suggestion[0]));
    }
  }, [voice]);

  const getCompletion = async () => {
    try {
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
      setDialogue([
        ...dialogue,
        userInput,
        { role: "assistant", content: result.assistant },
      ]);
      speakText(result.assistant[0]);

      setSuggestions(result.suggestions);
      result.suggestions.map((suggestion: string[]) => speakText(suggestion[0]));
    } catch {
      throw new Error("something went wrong");
    }
  };

  useEffect(() => {
    getCompletion();
  }, [userInput]);

  // toggle speech recognition on spacebar press/release
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " && !spacebarPressed) {
        setSpacebarPressed(true);
        handleStartRecognition();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === " " && spacebarPressed) {
        setSpacebarPressed(false);
        handleStopRecognition();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [spacebarPressed]);
  console.log("lang", language, "voice", voice);
  // start recording
  const handleStartRecognition = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = voice?.lang;
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onstart = () =>
        console.log("Speech recognition started.");
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        setUserInput({ role: "user", content: transcript });
      };

      recognitionRef.current.onerror = (event: any) =>
        console.error("Speech recognition error:", event.error);
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended.");
        if (spacebarPressed) {
          recognitionRef.current!.start();
        }
      };
    }
    recognitionRef.current.lang = voice?.lang;
    recognitionRef.current!.start();
  };

  // stop recording
  const handleStopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("Speech recognition stopped.");
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
    <div className="w-6/12 min-h-[75vh] bg-gradient-to-b from-chat-container-dark to-chat-container-light relative mx-auto my-1 p-2 rounded-xl flex flex-col justify-end items-center min-w-[300px]">
      <div className="scroll-container overflow-y-scroll w-full flex flex-col justfy-end items-center">
        {dialogue.map((line, idx) => {
          return idx !== 0 ? (
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
                      speakText(suggestion[0]); // Speak the assistant's response
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
          className="rounded-full my-2"
          style={{ background: spacebarPressed ? "#fc5151" : "#13ABCB" }}
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

export default ChatBoxSpeechApi;
