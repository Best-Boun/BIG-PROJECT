import LlmConnector, { WebLlmProvider, LlmConnectorBlock } from '@rcb-plugins/llm-connector';
import ChatBot from 'react-chatbotify';



const BrowserLlmBot = () => {
  
  const plugins = [LlmConnector()];

  const themes = [
		{id: "omen", version: "0.1.0"}
	]

  const flow = {
    
    start: {
      message: 'Hi, what would you like to find out today?',
      transition: 0,
      path: 'llm',
    },

    llm: {
      llmConnector: {
        provider: new WebLlmProvider({
          model: 'Qwen2-0.5B-Instruct-q4f16_1-MLC',
        }),
        outputType: 'character',
      },
    } as LlmConnectorBlock,
  };
  return <ChatBot flow={flow} plugins={plugins} themes={themes} />;
};

export default BrowserLlmBot;
