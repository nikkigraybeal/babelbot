export const systemPrompt = (
  language: String,
  nativeLang: String,
  scenario: Scenario,
) => {
  return `
      You are a JSON generator.

      The user is a native ${nativeLang} speaker who is a beginning ${language} language student. 
      The user is doing a role playing exercise where they are a ${scenario.userRole} ${scenario.setting} ${scenario.action} from a ${scenario.assistantRole}. 

      Respond strictly with JSON to the user's prompts. The JSON should be compatible with the TypeScript type Response from the following:
      interface Response {
        assistant: string[], // contains 2 string items: the ${scenario.assistantRole}'s response in ${language} and ${nativeLang}
        suggestions: string[][] // contains 3 arrays with 2 string items in each: a suggestion for how the ${scenario.userRole} can respond to the ${scenario.assistantRole} in ${language} and in ${nativeLang}.
      }
  `;
};



// Respond strictly with JSON to the user's prompts. The JSON should follow this pattern:
//       {
//         assistant: "an array that contains 2 strng items: the ${scenario.assistantRole}'s response in ${language} and ${nativeLang}",
//         suggestions: "an array that contains 3 arrays with 2 string items in each: a suggestion for how the ${scenario.userRole} can respond to the ${scenario.assistantRole} in ${language} and in ${nativeLang}"
//       }

// how to control gpt response if user responds in native lang or strays from the topic? 
// do we bother or just give the user a way to regenerate the convo if it goes off the rails?

// interface Scenario {
//   action: string;
//   setting: string;
//   assistantRole: string;
//   userRole: string;

// }

export const scenarios: Scenario[] = [
  {
    action: "ordering coffee",
    setting: "in a coffee shop",
    assistantRole: "barista",
    userRole: "customer",
  },
  {
    action: "asking for directions",
    setting: "on the street",
    assistantRole: "friendly local",
    userRole: "lost tourist",
  },
  {
    action: "ordering food", 
    setting: "at a restaurant",
    assistantRole: "server",
    userRole: "customer",
  },
  {
    action: "getting intake information",
    setting: "at a doctor's office",
    assistantRole: "patient",
    userRole: "doctor",
  }
];


// The JSON should include the ${scenario.assistantRole}'s/assistant response as well as 3 suggestions in ${language} for how the ${scenario.userRole}/user might respond. Include {${nativeLang}} translations.

//       The JSON object should look like this:
//       { assistant: ["${language} Response", "${nativeLang} Translation"],
//         suggestions: [ 
//           ["suggested ${language} response for user", "${nativeLang} Translation"], 
//           ["suggested ${language} response for user", "${nativeLang} Translation"], 
//           ["suggested ${language} response for user", "${nativeLang} Translation"]
//         ]
//       }

//80%
// You are a JSON generator and ${language} tutor. Always respond with JSON.

// The user is a native ${nativeLang} speaker who is a beginning ${language} language student. 
// Do a role playing exercise where the user is a ${scenario.userRole} ${scenario.setting} ${scenario.action} from a ${scenario.assistantRole}. You are the ${scenario.assistantRole}.

