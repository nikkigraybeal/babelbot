import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { langData } from "@/data/languages";
import { scenarios } from "@/utils/systemPrompt";

interface Voice {
  synthObj: SpeechSynthesisVoice; // contains langCode and name
  lang: string;
  dialect: string;
  greeting: string;
}

interface Props {
  setNativeLanguage: Dispatch<SetStateAction<string>>,
  setLanguage: Dispatch<SetStateAction<string>>,
  setVoice: Dispatch<SetStateAction<SpeechSynthesisVoice | null>>,
  setGreeting: Dispatch<SetStateAction<string>>,
  setScenario: Dispatch<SetStateAction<number | null>>,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
}

export default function OptionsModal({
  setNativeLanguage,
  setLanguage,
  setVoice,
  setGreeting,
  setScenario,
  setIsOpen,
}: Props) {
  const [availableVoices, setAvailableVoices] = useState<Voice[] | null>(null);
  const [voices, setVoices] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    // fetch available voices on mount and create Voice obj array
    const fetchVoices = () => {
      const speechSynthesis = window.speechSynthesis;
      if (speechSynthesis) {
        const synthObjs = speechSynthesis.getVoices();
        const voiceObjArr = synthObjs.map((sObj) => {
          const language = langData.find((lang) => lang.langCode === sObj.lang);
          return language === undefined
            ? {
                synthObj: sObj,
                lang: "",
                dialect: "",
                greeting: "Hello",
              }
            : {
                synthObj: sObj,
                lang: language.language,
                dialect: language.dialect,
                greeting: language.greeting,
              };
        });
        // set all available voices
        setAvailableVoices(voiceObjArr); // Voice type array

        // push languages to new array, use Set to remove dups
        let langs = voiceObjArr.map((voiceObj) => voiceObj.lang);
        langs = [...new Set(langs)];
        const sorted = langs.sort().filter((lang) => lang !== "");
        // set all available languages
        setLanguages(sorted);
      }
    };
    fetchVoices();
    setScenario(null);

    // Event listener to fetch when voices are available
    window.speechSynthesis.onvoiceschanged = () => {
      fetchVoices();
    };
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string = e.target.value;
    setLanguage(selected);
    // filter voices DD for selected language
    const filteredVoices = availableVoices!.filter(
      (voiceObj) => voiceObj.lang === selected,
    );
    const voiceArr = filteredVoices.map(
      (voiceObj) => `${voiceObj.synthObj.name} - ${voiceObj.dialect}`,
    );

    setVoices(voiceArr);
  };
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // setSelectedVoice to synthObj
    const selected = e.target.value; // name - dialect
    const voiceName = selected.split(" - ")[0];
    const voiceObj = availableVoices!.find((voice) => {
      return voice.synthObj.name.trim() === voiceName.trim();
    });
    if (voiceObj) {
      setVoice(voiceObj.synthObj);
      setGreeting(voiceObj.greeting);
    } else {
      setVoice(null)
      setGreeting("Hello");
    }
  };

  return (
    <div className="h-[40%] w-1/2 min-w-[300px] py-64 flex flex-col items-center justify-center gap-6 text-center rounded-lg bg-chat-container-dark">
      <h1 className="text-white text-2xl place-self-center">
        Select Language Options
      </h1>
      {/* NATIVE LANG */}
      <label className="text-white self-center">
        Native Language
        <select
          className="text-white block w-[225px] p-2 mt-1 rounded-lg bg-chat-container-light h-10"
          onChange={(e) => setNativeLanguage(e.target.value)}
        >
          <option value="">select native language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </label>
      {/* LANG DD */}
      <label className="text-white">
        Lanugage to Learn
        <select
          className="text-white block w-[225px] p-2 mt-1 rounded-lg bg-chat-container-light h-10"
          onChange={(e) => handleLanguageChange(e)}
        >
          <option value="">select language to learn</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </label>
      {/* VOICE DD */}
      <label className="text-white">
        Chatbot Voice
        <select
          className="text-white block w-[225px] p-2 mt-1 rounded-lg bg-chat-container-light h-10"
          onChange={(e) => handleVoiceChange(e)}
        >
          <option value="">select a voice/dialect</option>
          {voices.map((voice) => (
            <option key={voice} value={`${voice}`}>
              {voice}
            </option>
          ))}
        </select>
      </label>
      {/* SCENARIO DD */}
      <label className="text-white">
        Role Play Scenario
        <select
          className="text-white block w-[225px] p-2 mt-1 rounded-lg bg-chat-container-light h-10"
          onChange={(e) => setScenario(parseInt(e.target.value))}
        >
          <option value="">select a scenario</option>
          {scenarios.map((scenario, idx) => (
            <option key={scenario.action} value={idx}>
              {`${scenario.action} ${scenario.setting} from a ${scenario.assistantRole}`}
            </option>
          ))}
        </select>
      </label>
      <button
        className="text-white w-20 p-2 rounded-lg border border-white bg-chat-container-light h-10"
        onClick={() => setIsOpen(false)}
      >
        Next
      </button>
    </div>
  );
}
