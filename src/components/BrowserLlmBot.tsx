import LlmConnector, { WebLlmProvider, LlmConnectorBlock } from '@rcb-plugins/llm-connector';
import ChatBot from 'react-chatbotify';

// This is a browser-based LLM chatbot example
// Relevant tutorial: https://www.youtube.com/watch?v=Ff_Tm99fU-Y
const BrowserLlmBot = () => {
  // initialize the plugin
  const plugins = [LlmConnector()];

  // conversation flow
  const flow = {
    // default start block (entry point)
    start: {
      message: 'Hi, what would you like to find out today?',
      transition: 0,
      path: 'llm',
    },
    // browser llm block
    llm: {
      llmConnector: {
        // provider configuration guide:
        // https://github.com/react-chatbotify-plugins/llm-connector/blob/main/docs/providers/WebLlm.md
        provider: new WebLlmProvider({
          model: 'Qwen2-0.5B-Instruct-q4f16_1-MLC',
        }),
        outputType: 'character',
      },
    } as LlmConnectorBlock,
  };
  return <ChatBot flow={flow} plugins={plugins} />;
};

export default BrowserLlmBot;
