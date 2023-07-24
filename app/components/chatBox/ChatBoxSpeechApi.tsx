"use client";
import React, { useEffect, useState, useRef } from "react";
import micIcon from "../../../public/micIcon.svg";
import { systemPrompt, scenarios } from "@/utils/systemPrompt";
import Image from "next/image";

interface Prompt {
  role: "assistant" | "user" | "system";
  content: string;
}

const ChatBoxSpeechApi = () => {
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
  const [spacebarPressed, setSpacebarPressed] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  console.log("SPEECH API PROMPT HIST", promptHistory)
  console.log("FROM SPEECH API DIALOGUE", dialogue)


  const getCompletion = async () => {
    try {
      const messages = userInput
        ? [...promptHistory, userInput]
        : [...promptHistory];
        console.log("PREPOST!!!")
      const res = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });
      console.log("POSTPOST!!!!")
      const data = await res.json();
      console.log("SPEECH API DATA", data);
      if (data.error) {
       console.log("ERROR", data.error)
       return
      }

      setPromptHistory([
        ...messages,
        { role: "assistant", content: data.result },
      ]);

      const result = JSON.parse(data.result);
      console.log("DIALOGUE FROM GET COMP", dialogue)
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

        setDialogue([...dialogue, { role: "user", content: transcript }])
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
    // <div className="w-6/12 h-100 m-1 bg-gradient-to-b from-chat-container-dark to-chat-container-light relative mx-auto my-0 rounded-xl flex flex-col justify-end items-center min-w-300 px-4 overflow-hidden">
    //   {dialogue.map((line, idx) => {
    //     return (
    //       <div
    //         style={{
    //           color: "white",
    //           margin: "20px 0",
    //           padding: "20px",
    //           borderRadius: "30px",
    //           borderBottomLeftRadius: "0",
    //         }}
    //         className={
    //           line.role === "user"
    //             ? "self-end bg-slate-800"
    //             : "self-start bg-micbox-light"
    //         }
    //         key={idx}
    //       >
    //         {line.content}
    //       </div>
    //     );
    //   })}
    //   <div style={{minHeight: "240px"}} className="flex flex-col justify-end items-center w-full bg-gradient-to-b from-micbox-light to-micbox-dark rounded-t-xl relative mx-auto my-0">
    //     <button
    //       className="rounded-full my-2"
    //       style={{ background: spacebarPressed ? "#fc5151" : "#13ABCB" }}
    //     >
    //       <Image
    //         className="text-white"
    //         src={micIcon}
    //         alt="mic icon"
    //         height="75"
    //         width="75"
    //       />
    //     </button>
    //   </div>
    // </div>
  
};

export default ChatBoxSpeechApi;
