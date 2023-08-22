"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import ChatBoxSpeechApi from "./components/chatBox/ChatBoxSpeechApi";
import ChatBoxWhisper from "./components/chatBox/ChatBoxWhisper";
import { scenarios } from "@/utils/systemPrompt";
import Login from "./components/Login"
import GeneratedImage from "./components/GeneratedImage"

// BCP-47 language codes, language, country, dialect, "Hello!"
const langCodes = [
  ["ar-SA", "Arabic", "Saudi Arabia", "Arabic (Saudi Arabia)", "مرحبا!"],
  ["bn-BD", "Bangla", "Bangladesh", "Bangla (Bangladesh)", "হ্যালো!"],
  ["bn-IN", "Bangla", "India", "Bangla (India)", "হ্যালো!"],
  ["cs-CZ", "Czech", "Czech Republic", "Czech (Czech Republic)", "Ahoj!"],
  ["da-DK", "Danish", "Denmark", "Danish (Denmark)", "Hej!"],
  ["de-AT", "German", "Austria", "Austrian German", "Hallo!"],
  ["de-CH", "German", "Switzerland", "Swiss German", "Hallo!"],
  ["de-DE", "German", "Germany", "Standard German", "Hallo!"],
  ["el-GR", "Greek", "Greece", "Modern Greek", "Γεια σας!"],
  ["en-AU", "English", "Australia", "Australian English", "Hello!"],
  ["en-CA", "English", "Canada", "Canadian English", "Hello!"],
  ["en-GB", "English", "United Kingdom", "British English", "Hello!"],
  ["en-IE", "English", "Ireland", "Irish English", "Hello!"],
  ["en-IN", "English", "India", "Indian English", "Hello!"],
  ["en-NZ", "English", "New Zealand", "New Zealand English", "Hello!"],
  ["en-US", "English", "United States", "US English", "Hello!"],
  ["en", "English", "United States", "US English", "Hello!"],
  ["en-ZA", "English", "South Africa", "English (South Africa)", "Hello!"],
  ["es-AR", "Spanish", "Argentina", "Argentine Spanish", "¡Hola!"],
  ["es-CL", "Spanish", "Chile", "Chilean Spanish", "¡Hola!"],
  ["es-CO", "Spanish", "Columbia", "Colombian Spanish", "¡Hola!"],
  ["es-ES", "Spanish", "Spain", "Castilian Spanish (Central-Northern Spain)", "¡Hola!"],
  ["es-MX", "Spanish", "Mexico", "Mexican Spanish", "¡Hola!"],
  ["es-US", "Spanish", "United States", "American Spanish", "¡Hola!"],
  ["fi-FI", "Finnish", "Finland", "Finnish (Finland)", "Hei!"],
  ["fr-BE", "French", "Belgium", "Belgian French", "Bonjour!"],
  ["fr-CA", "French", "Canada", "Canadian French", "Bonjour!"],
  ["fr-CH", "French", "Switzerland", "Swiss French", "Bonjour!"],
  ["fr-FR", "French", "France", "Standard French", "Bonjour!"],
  ["he-IL", "Hebrew", "Israel", "Hebrew (Israel)", "שָׁלוֹם!"],
  ["hi-IN", "Hindi", "India", "Hindi (India)", "नमस्ते!"],
  ["hu-HU", "Hungarian", "Hungary", "Hungarian (Hungary)", "Helló!"],
  ["id-ID", "Indonesian", "Indonesia", "Indonesian (Indonesia)", "Halo!"],
  ["it-CH", "Italian", "Switzerland", "Swiss Italian", "Ciao!"],
  ["it-IT", "Italian", "Italy", "Standard Italian", "Ciao!"],
  ["ja-JP", "Japanese", "Japan", "Japanese (Japan)", "こんにちは!"],
  ["ko-KR", "Korean", "Republic of Korea", "Korean (Republic of Korea)", "안녕하세요!"],
  ["nl-BE", "Dutch", "Belgium", "Belgian Dutch", "Hallo!"],
  ["nl-NL", "Dutch", "The Netherlands", "Standard Dutch (The Netherlands)", "Hallo!"],
  ["nb-NO", "Norwegian", "Norway", "Norwegian (Norway)", "Hei!"],
  ["no-NO", "Norwegian", "Norway", "Norwegian (Norway)", "Hei!"],
  ["pl-PL", "Polish", "Poland", "Polish (Poland)", "Witaj!"],
  ["pt-BR", "Portuguese", "Brazil", "Brazilian Portuguese", "Olá!"],
  ["pt-PT", "Portuguese", "Portugal", "European Portuguese (Portugal)", "Olá!"],
  ["ro-RO", "Romanian", "Romania", "Romanian (Romania)", "Salut!"],
  ["ru-RU", "Russian", "Russian Federation", "Russian (Russian Federation)", "Привет!"],
  ["sk-SK", "Slovak", "Slovakia", "Slovak (Slovakia)", "Ahoj!"],
  ["sv-SE", "Swedish", "Sweden", "Swedish (Sweden)", "Hej!"],
  ["ta-IN", "Tamil", "India", "Indian Tamil", "வணக்கம்!"],
  ["ta-LK", "Tamil", "Sri Lanka", "Sri Lankan Tamil", "அவரத்தின் வணக்கம்!"],
  ["th-TH", "Thai", "Thailand", "Thai (Thailand)", "สวัสดี!"],
  ["tr-TR", "Turkish", "Turkey", "Turkish (Turkey)", "Merhaba!"],
  ["zh-CN", "Chinese", "China", "Mainland China, simple chars", "你好"],
  ["zh-HK", "Chinese", "Hong Kong", "Hong Kong, trad chars", "你好"],
  ["zh-TW", "Chinese", "Taiwan", "Taiwan, trad chars", "你好"],
];

interface Voice {
  synthObj: SpeechSynthesisVoice; // contains langConde and name
  lang: string; // comes from langCodes[1]
  dialect: string; // comes from langCodes[3]
  greeting: string; // from langCodes[4]
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [speechToText, setSpeechToText] = useState<"speech api" | "whisper" | "">("");
  const [availableVoices, setAvailableVoices] = useState<Voice[] | null>(null);
  const [voices, setVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | undefined | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState<string | null>(null)
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null)
  const [scenario, setScenario] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      setIsLoggedIn(true)
    }
  })

  const checkDropDownValues = () => {
    if (selectedVoice && nativeLanguage && selectedLanguage && scenario) {
      return true
    }
    alert("choose a value from each drop down list")
    setSpeechToText("")
    return false
  }

  useEffect(() => {
    // fetch available voices on mount and create Voice obj array
    const fetchVoices = () => {
      const speechSynthesis = window.speechSynthesis;
      if (speechSynthesis) {
        const synthObjs = speechSynthesis.getVoices();
        const voiceObjArr = synthObjs.map((sObj) => {
          const lCode = langCodes.find((code) => code[0] === sObj.lang);
          return lCode === undefined
            ? {
                synthObj: sObj,
                lang: "",
                dialect: "",
                greeting: "Hello",
              }
            : {
                synthObj: sObj,
                lang: lCode[1],
                dialect: lCode[3],
                greeting: lCode[4]
              };
        });
        setAvailableVoices(voiceObjArr); // Voice type array

        // push languages to new array, use set to remove dups
        let langs = voiceObjArr.map((voiceObj) => voiceObj.lang);
        langs = [...new Set(langs)];
        const sorted = langs.sort().filter(lang => lang !== "")
        setLanguages(sorted);
      }
    };
    fetchVoices();

    // Event listener to fetch when voices are available
    window.speechSynthesis.onvoiceschanged = () => {
      fetchVoices();
    };
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string = e.target.value;
    setSelectedLanguage(selected);
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
    setSelectedVoice(voiceObj?.synthObj);
    if (voiceObj) {
      setGreeting(voiceObj.greeting)
    } else {
      setGreeting("Hello")
    }
  };

  return (
    <main className="flex flex-col items-center">
      {!isLoggedIn && (
        <Login />
      )}
      {isLoggedIn && (
      <div className="flex justify-evenly items-center w-full">
        <div className="flex flex-col items-start w-4/12 h-10 gap-2">
          {/* NATIVE LANG */}
        <select className="text-white border p-2 rounded-lg mb-3 bg-bg-dark h-10" onChange={(e) => setNativeLanguage(e.target.value)}>
            <option value="">select native language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {/* LANG DD */}
          <select className="text-white border p-2 rounded-lg mb-3 bg-bg-dark h-10" onChange={handleLanguageChange}>
            <option value="">select language to learn</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {/* VOICE DD */}
          <select className="text-white border p-2 rounded-lg mb-3 bg-bg-dark h-10 w-48" onChange={handleVoiceChange}>
            <option value="">select a voice/dialect</option>
            {voices.map((voice) => (
              <option key={voice} value={`${voice}`}>
                {voice}
              </option>
            ))}
          </select>
           {/* SCENARIO DD */}
           <select className="text-white border p-2 rounded-lg mb-3 bg-bg-dark h-10 w-48" onChange={(e) => setScenario(e.target.value)}>
            <option value="">select a scenario</option>
            {scenarios.map((scenario, idx) => (
              <option key={scenario.action} value={idx}>
                {`${scenario.action} ${scenario.setting} from a ${scenario.assistantRole}`}
              </option>
            ))}
          </select>
        </div>
        <h1 className="text-white text-3xl m-7  place-self-center">Milti-Llingual ChatBot</h1>
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
          <button className="text-white border p-2 rounded-lg mb-3 bg-bg-dark hover:bg-slate-700 h-10" onClick={() => signOut()}>Sign Out</button>
        </div>
      </div>
      )}
      {speechToText === "speech api" && checkDropDownValues() && (
        <ChatBoxSpeechApi
          nativeLanguage={nativeLanguage}
          selectedLanguage={selectedLanguage}
          selectedVoice={selectedVoice}
          greeting={greeting}
          scenario={scenario}
        />
      )}
      {speechToText === "whisper" && checkDropDownValues() && (
        <ChatBoxWhisper
          nativeLanguage={nativeLanguage}
          selectedLanguage={selectedLanguage}
          selectedVoice={selectedVoice}
          greeting={greeting}
          scenario={scenario}
        />
      )}
      <GeneratedImage />
    </main>
  );
}
