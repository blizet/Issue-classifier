// classify.js
import OpenAI from "openai";
import "dotenv/config"

/**
 * IssueClassifier class abstracts interaction with AI clients to classify GitHub issues.
 * Uses primary Mosaia agent and fallback OpenRouter model.
 */
export class IssueClassifier {
  /**
   * Creates a new classifier instance.
   * @param {Object} config
   * @param {string} config.mosaiaApiKey - API key for Mosaia.
   * @param {string} config.mosaiaAgentId - Agent ID for Mosaia.
   * @param {string} config.openRouterApiKey - API key for OpenRouter (fallback).
   */
  constructor({ mosaiaApiKey, mosaiaAgentId, openRouterApiKey }) {
    if (!mosaiaApiKey || !mosaiaAgentId || !openRouterApiKey) {
      throw new Error(
        "All API keys and agent IDs must be provided: mosaiaApiKey, mosaiaAgentId, openRouterApiKey"
      );
    }

    // Initialize Mosaia client (primary)
    this.mosaiaClient = new OpenAI({
      apiKey: mosaiaApiKey,
      baseURL: "https://api.mosaia.ai/v1/agent",
    });

    // Initialize OpenRouter client (fallback)
    this.fallbackClient = new OpenAI({
      apiKey: openRouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    this.mosaiaAgentId = mosaiaAgentId;
  }

  /**
   * Extracts the first JSON object from AI model response text.
   * @param {string} text - Raw response text from AI model.
   * @returns {Object} Parsed JSON object.
   * @throws Will throw error if no valid JSON found.
   */
  extractJSON(text) {
    // Remove markdown code blocks
    const cleaned = text.replace(/```json|```/g, "").trim();

    // Extract first JSON object (supports multiline)
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in model response");

    return JSON.parse(match[0]);
  }

  /**
   * Builds the prompt for the AI model based on issue details.
   * @param {string} title - Issue title.
   * @param {string} description - Issue description.
   * @param {string} language - Programming language or tech stack.
   * @param {string[]} labels - Issue labels (optional).
   * @returns {string} Prompt string.
   */
  buildPrompt(title, description, language, labels = []) {
    const labelString = labels.length > 0 ? labels.join(", ") : "None";

    return `
    You are an expert AI assistant specializing in classifying GitHub issues by difficulty: easy, medium, or difficult.

    Use the following criteria for classification:

    - **Easy:** Issues that involve minor bug fixes or simple UI/UX adjustments with minimal code changes. These tasks are well-scoped, localized to a specific module or component, have low risk of side effects, and can typically be resolved quickly without extensive debugging or testing. Examples include fixing typos, small layout corrections, or straightforward event handling fixes.
    - **Medium:** Issues that require moderate debugging, code refactoring, or the addition of new features that impact multiple components or modules. These tasks demand a solid understanding of the overall system architecture, asynchronous flows, or state management. They may involve integrating with third-party APIs, updating data flows, or handling edge cases. Testing and validation across different environments or devices may be necessary to ensure stability.
    - **Difficult:** Complex challenges involving significant architectural redesign, cross-platform or multi-service integration, critical security improvements, or major performance optimizations. These issues require deep expertise in the technology stack, comprehensive knowledge of system dependencies, and careful planning to minimize risks. They often necessitate extensive code changes, multi-phase development, thorough testing (including regression and load testing), and possibly coordination across teams.

    Analyze the issue considering:
    - Title
    - Description
    - Programming language and relevant technology stack
    - Issue labels: ${labelString}
    - Complexity of debugging, implementation, or testing needed
    - Potential impact on the overall system

    **IMPORTANT:** Respond ONLY with a JSON object in the following format, without any explanation:

    { "difficulty": "easy" | "medium" | "difficult" }

    Example:

    { "difficulty": "easy" }

    Classify this issue:

    Title: ${title}
    Description: ${description}
    Language: ${language}
    Labels: ${labelString}
    `;
  }

  /**
   * Classifies a GitHub issue based on title, description, language, and labels.
   * Tries Mosaia first; on failure, falls back to OpenRouter.
   * @param {string} title - Issue title.
   * @param {string} description - Issue description.
   * @param {string} language - Programming language.
   * @param {string[]} labels - Issue labels (optional).
   * @returns {Promise<Object|null>} Classification result or null if failed.
   */
  async classifyIssue(title, description, language, labels = []) {
    const prompt = this.buildPrompt(title, description, language, labels);

    // --- Try Mosaia Primary ---
    try {
      const mosaiaRes = await this.mosaiaClient.chat.completions.create({
        model: this.mosaiaAgentId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });

      const mosaiaText = mosaiaRes.choices[0].message.content;
      console.log("[Mosaia] Raw response:", mosaiaText);
      return this.extractJSON(mosaiaText);
    } catch (err) {
      console.warn("[Mosaia] Failed:", err.message);
    }

    // --- Fallback: OpenRouter ---
    try {
      const fallbackRes = await this.fallbackClient.chat.completions.create({
        model: "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });

      const fallbackText = fallbackRes.choices[0].message.content;
      console.log("[OpenRouter] Raw response:", fallbackText);
      return this.extractJSON(fallbackText);
    } catch (fallbackErr) {
      console.error("[OpenRouter] Failed:", fallbackErr.message);
      return null;
    }
  }
}
