// index.js
import "dotenv/config";
import { IssueClassifier } from "./classify.js";

async function main() {
  // Create classifier instance using keys from environment variables
  const classifier = new IssueClassifier({
    mosaiaApiKey: process.env.MOSAIA_API_KEY,
    mosaiaAgentId: process.env.MOSAIA_AGENT_ID,
    openRouterApiKey: process.env.OPENAI_API_KEY,
  });

  console.log('MOSAIA_API_KEY:', process.env.MOSAIA_API_KEY ? 'loaded' : 'missing');
  console.log('MOSAIA_AGENT_ID:', process.env.MOSAIA_AGENT_ID ? 'loaded' : 'missing');
  console.log('OPENROUTER_API_KEY:', process.env.OPENAI_API_KEY ? 'loaded' : 'missing');

  // Easy issue example
  const easyTitle = "Login button not working on Android";
  const easyDescription = "After UI update, login button doesn't respond on Android devices.";
  const easyLanguage = "JavaScript";
  const easyLabels = ["bug"];

  // Medium issue example
  const mediumTitle = "Optimize login flow to reduce race conditions on Android devices";
  const mediumDescription = "Users occasionally experience login failures due to asynchronous API call race conditions in the login process on Android. Requires debugging async logic and refactoring state management.";
  const mediumLanguage = "JavaScript";
  const mediumLabels = ["bug", "performance", "mobile"];

  // Difficult issue example
  const difficultTitle = "Implement secure biometric authentication for mobile login";
  const difficultDescription = "Add fingerprint and face ID authentication support to mobile apps, integrating native SDKs for both Android and iOS platforms, including fallback and error handling mechanisms.";
  const difficultLanguage = "JavaScript / Java / Swift";
  const difficultLabels = ["feature", "security", "mobile"];

  // Classify easy issue
  const easyClassification = await classifier.classifyIssue(
    easyTitle,
    easyDescription,
    easyLanguage,
    easyLabels
  );
  console.log("Easy issue classification:", easyClassification);

  // Classify medium issue
  const mediumClassification = await classifier.classifyIssue(
    mediumTitle,
    mediumDescription,
    mediumLanguage,
    mediumLabels
  );
  console.log("Medium issue classification:", mediumClassification);

  // Classify difficult issue
  const difficultClassification = await classifier.classifyIssue(
    difficultTitle,
    difficultDescription,
    difficultLanguage,
    difficultLabels
  );
  console.log("Difficult issue classification:", difficultClassification);
}

main();
