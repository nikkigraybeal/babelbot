"use client";
import React, { useEffect, useState, useRef } from "react";
import micIcon from "../../../public/micIcon.svg";
import Image from "next/image";

interface Line {
  role: "assistant" | "user";
  content: string;
}

const ChatBoxSpeechApi = () => {
  const [chatStream, setChatStream] = useState<Line[]>([]);
  const [nextLine, setNextLine] = useState<Line>({
    role: "assistant",
    content: "Hi! How are you?",
  });
  const [spacebarPressed, setSpacebarPressed] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  //console.log("STREAM", chatStream)

  useEffect(() => {
    setChatStream([...chatStream, nextLine]);
  }, [nextLine]);

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

  // start recording
  const handleStartRecognition = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () =>
        console.log("Speech recognition started.");
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        setNextLine({ role: "user", content: transcript });
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
    recognitionRef.current!.start();
  };
  
  // stop recording
  const handleStopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("Speech recognition stopped.");
    }
  };

  return (
    <div className="w-6/12 h-100 m-1 bg-gradient-to-b from-chat-container-dark to-chat-container-light relative mx-auto my-0 rounded-xl flex flex-col justify-end items-center min-w-300 px-4 overflow-hidden">
      {chatStream.map((line, idx) => {
        return (
          <div
            style={{
              color: "white",
              margin: "20px 0",
              padding: "20px",
              borderRadius: "30px",
              borderBottomLeftRadius: "0",
            }}
            className={
              line.role === "user"
                ? "self-end bg-slate-800"
                : "self-start bg-micbox-light"
            }
            key={idx}
          >
            {line.content}
          </div>
        );
      })}
      <div style={{minHeight: "240px"}} className="flex flex-col justify-end items-center w-full bg-gradient-to-b from-micbox-light to-micbox-dark rounded-t-xl relative mx-auto my-0">
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
