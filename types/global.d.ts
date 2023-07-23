interface Window {
  webkitSpeechRecognition: new () => SpeechRecognition;
}

interface Scenario {
  action: string;
  setting: string;
  assistantRole: string;
  userRole: string;
  
}