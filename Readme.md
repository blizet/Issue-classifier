
# Issue Classifier

A lightweight Node.js tool that uses AI models to classify GitHub issues by difficulty level: **easy**, **medium**, or **difficult**.  
It analyzes the issue's title, description, programming language, and labels to provide a structured difficulty rating.

---

## Getting API Keys

### 1. OpenRouter API Key

This project uses OpenRouter as a fallback AI provider with the model `mistralai/mistral-small-3.2-24b-instruct:free`.

- Go to [OpenRouter](https://openrouter.ai/)
- Sign in and navigate to your **Profile**.
- Go to the **Keys** section.
- Click **Create API Key** to generate a new key.
- Copy the API key for use in your `.env` file.

### 2. Mosaia API Key and Agent ID

Mosaia is the primary AI provider used.

- Visit [Mosaia](https://www.mosaia.io/)
- Sign up or log in.
- Navigate to your user dashboard at:  
  `https://www.mosaia.ai/user/blizet/agent/Issue-classifier`  
  *(Replace `blizet` with your username if different.)*
- Create a new **Agent** for your project if you haven't already.
- Copy the **Agent ID** (example: `6861a37adc8f3af29840e926`).
- Create a new **App** within your Mosaia account to generate an **API Key**.
- Copy the API key for use in your `.env` file.

---

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/issue-classifier.git
   cd issue-classifier
   ````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project with the following content:

   ```env
   MOSAIA_API_KEY=your_mosaia_api_key_here
   MOSAIA_AGENT_ID=your_mosaia_agent_id_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

   Replace the placeholders with your actual keys.

---

## Usage

```js
import { IssueClassifier } from "./classify.js";
import "dotenv/config";

async function main() {
  const classifier = new IssueClassifier({
    mosaiaApiKey: process.env.MOSAIA_API_KEY,
    mosaiaAgentId: process.env.MOSAIA_AGENT_ID,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
  });

  const title = "Fix login bug on mobile";
  const description = "The login button doesn't respond on Android devices after recent UI update.";
  const language = "JavaScript";
  const labels = ["bug", "mobile"];

  const classification = await classifier.classifyIssue(title, description, language, labels);
  console.log("Classification result:", classification);
}

main();
```

Run the code using:

```bash
node index.js
```

---

## Notes

* Keep your `.env` file secure and add it to `.gitignore` to avoid exposing your API keys.
* The classifier attempts to use Mosaia first, then falls back to OpenRouter if needed.
* Labels are optional but can improve classification accuracy.

---

## License

MIT License ©Blizet
```
