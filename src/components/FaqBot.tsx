import ChatBot, { Flow, Params } from 'react-chatbotify';

// This is a faq chatbot example
// Relevant tutorial: https://www.youtube.com/watch?v=prWgkEbI12U
const FaqBot = () => {
  // conversation flow
  const flow = {
    // default start block (entry point)
    start: {
      message: 'Hi! What would you like to know about React ChatBotify?',
      options: ['About', 'Features', 'Support'],
      path: 'handle_faq',
    },
    // handle faq responses
    handle_faq: {
      message: async (params: Params) => {
        const userInput = params.userInput;
        let reply = '';
        switch (userInput.toLowerCase()) {
          case 'about':
            reply = 'React ChatBotify is a simple and customizable chatbot library for React applications.';
            break;
          case 'features':
            reply = 'It offers features like easy integration, customizable UI, and support for various chat flows.';
            break;
          case 'support':
            reply = 'For support, you can visit our GitHub repository or join our community forums.';
            break;
          default:
            reply = "I'm sorry, I didn't understand that. Please choose from the options provided.";
            break;
        }
        await params.injectMessage(reply);
      },
      options: ['I have more questions'],
      path: 'start',
      chatDisabled: true,
    },
  };
  return <ChatBot flow={flow} />;
};

export default FaqBot;
