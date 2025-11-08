import LlmConnector, { OpenaiProvider, LlmConnectorBlock } from '@rcb-plugins/llm-connector';
import ChatBot, { Flow, Params } from 'react-chatbotify';

// This is an openai chatbot example (direct mode)
// Relevant tutorial: https://www.youtube.com/watch?v=MIi58N_J1ew
const OpenAiBot = () => {
  // enter your openai api key here
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
        return 'openai';
      },
    },
    // openai llm block
    openai: {
      llmConnector: {
        // provider configuration guide:
        // https://github.com/react-chatbotify-plugins/llm-connector/blob/main/docs/providers/OpenAI.md
        provider: new OpenaiProvider({
          mode: 'direct',
          model: 'gpt-3.5-turbo',
          responseFormat: 'stream',
          apiKey: apiKey,
        }),
        outputType: 'character',
      },
    } as LlmConnectorBlock,
  };
  return <ChatBot flow={flow} plugins={plugins} />;
};

export default OpenAiBot;
