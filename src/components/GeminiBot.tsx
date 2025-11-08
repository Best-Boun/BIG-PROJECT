import LlmConnector, { GeminiProvider, LlmConnectorBlock } from '@rcb-plugins/llm-connector';
import ChatBot, { Flow, Params } from 'react-chatbotify';

// This is a gemini chatbot example (direct mode)
// Relevant tutorial: https://www.youtube.com/watch?v=HDz48kmDZ4w
const GeminiBot = () => {
  // enter your gemini api key here
  let apiKey = '';

  // initialize the plugin
  const plugins = [LlmConnector()];

  // conversation flow
  const flow: Flow = {
    // default start block (entry point)
    start: {
      message: "Hello! Make sure you've set your API key before getting started!",
      options: ['I am ready!'],
      chatDisabled: true,
      path: async (params: Params) => {
        if (!apiKey) {
          await params.simulateStreamMessage('You have not set your API key!');
          return 'start';
        }
        await params.simulateStreamMessage('Ask away!');
        return 'gemini';
      },
    },
    // gemini llm block
    gemini: {
      llmConnector: {
        // provider configuration guide:
        // https://github.com/react-chatbotify-plugins/llm-connector/blob/main/docs/providers/Gemini.md
        provider: new GeminiProvider({
          mode: 'direct',
          model: 'gemini-1.5-flash',
          responseFormat: 'stream',
          apiKey: apiKey,
        }),
        outputType: 'character',
      },
    } as LlmConnectorBlock,
  };
  return <ChatBot flow={flow} plugins={plugins} />;
};

export default GeminiBot;
