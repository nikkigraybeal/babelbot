"use client";
import React, { useEffect, useState, useRef } from "react";
import micIcon from "../../../public/micIcon.svg";
import Image from "next/image";
import { systemPrompt, scenarios } from "../../../utils/systemPrompt";

interface Prompt {
  role: "assistant" | "user" | "system";
  content: string;
}

const ChatBoxWhisper = () => {
  const [promptHistory, setPromptHistory] = useState<Prompt[]>([
    {
      role: "system",
      content: systemPrompt("Spanish", "English", scenarios[0]),
    },
    {
      role: "user",
      content: "Hola!",
    },
  ]);
  const [dialogue, setDialogue] = useState<Prompt[]>([]);
  const [suggestions, setSuggestions] = useState<string[][]>([]); // [[suggested res, translation]]
  const [userInput, setUserInput] = useState<Prompt | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  console.log("FROM WHISPER PROMPT HIST", promptHistory);
  console.log("FROM WHISPER DIALOGUE", dialogue);

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
      console.log("WHISPER DATA", data);
      if (data.error) {
       console.log("ERROR", data.error)
       return
      }

      setPromptHistory([
        ...messages,
        { role: "assistant", content: data.result },
      ]);

      const result = JSON.parse(data.result);
      console.log("WHIPSER DIALOGUE FROM GET COMP", dialogue)
      setDialogue([
        ...dialogue,
        { role: "assistant", content: result.assistant },
      ]);

      setSuggestions(result.suggestions);
    } catch {
      throw new Error("something went wrong");
    }
  };

  useEffect(() => {
    getCompletion();
  }, [userInput]);

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
            // const audioUrl = URL.createObjectURL(audioBlob);
            // const audio = new Audio(audioUrl);
            // audio.onerror = function (err) {
            //   console.error('Error playing audio:', err);
            // };
            // audio.play();

            try {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async function () {
                const base64Audio = reader.result?.split(",")[1]; // Remove the data URL prefix
                const response = await fetch("/api/transcribe", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ audio: base64Audio }),
                });
                const data = await response.json();
                console.log("WHISPER DATA", data);
                if (response.status !== 200) {
                  throw (
                    data.error ||
                    new Error(`Request failed with status ${response.status}`)
                  );
                }

                setDialogue([
                  ...dialogue,
                  { role: "user", content: data.result },
                ]);
                console.log("WHISPER DIALOGUE FROM RECORD", dialogue)
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
    console.log("START REC");
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };
  // Function to stop recording
  const stopRecording = () => {
    console.log("STOP REC");
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    // CHAT CONTAINER
    <div className="w-6/12 h-chat-container bg-gradient-to-b from-chat-container-dark to-chat-container-light relative mx-auto my-0 rounded-xl flex flex-col justify-end items-center min-w-300 px-4">
      <div className="overflow-y-scroll w-full ml-8 flex flex-col justfy-end items-center">
        {dialogue.map((line, idx) => {
          return (
            <div
              className={`text-white p-3 my-2 rounded-chat-bubble rounded-bl-none w-fit ${
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
                  <p className="text-md">{line.content[0]}</p>
                  <p className="text-white block ml-3 text-sm opacity-75">
                    {line.content[1]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* SUGGESTON BOX */}
      <div
        style={{ minHeight: "340px" }}
        className="flex flex-col justify-end items-center w-full bg-gradient-to-b from-micbox-light to-micbox-dark rounded-t-xl relative mx-auto my-0 overflow-hidden"
      >
        {suggestions.length > 0 &&
          suggestions.map((suggestion) => {
            return (
              <div
                key={suggestion[0]}
                className="self-start flex-col flex-start w-full py-2"
              >
                <p className="text-white block text-md ml-2">{suggestion[0]}</p>
                <p className="text-white block ml-5 mb-3 text-sm opacity-75">
                  {suggestion[1]}
                </p>
                <hr className="border-chat-container-light border"></hr>
              </div>
            );
          })}
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{ background: recording ? "#fc5151" : "#13ABCB" }}
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
