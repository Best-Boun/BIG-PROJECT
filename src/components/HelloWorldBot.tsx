import ChatBot from 'react-chatbotify';

// This is a minimal Hello World chatbot example
// Relevant tutorial: https://www.youtube.com/watch?v=d9UZyETtnh8
const HelloWorldBot = () => {
  // conversation flow
  const flow = {
    // default start block (entry point)
    start: {
      message: 'Hello world!',
    },
  };

  return <ChatBot flow={flow} />;
};

export default HelloWorldBot;
