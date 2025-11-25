import ChatBot, { Flow, Params } from 'react-chatbotify';


const FaqBot = () => {

  const themes = [
		{id: "omen", version: "0.1.0"}
	]
  
  const flow = {
    
    start: {
      message: 'สวัสดี! ฉันคือ บอทช่วยเหลือผู้ใช้  คุณต้องการความช่วยเหลือเกี่ยวกับอะไร?',
      options: ['เคลียร์ผู้ใช้', 'สรุปผล', 'Feedback', 'จัดการผู้ใช้ใหม่'],
      path: 'handle_faq',
    },
    
    handle_faq: {
      message: async (params: Params) => {
        const userInput = params.userInput;
        let reply = '';
        switch (userInput.toLowerCase()) {
          case 'เคลียร์ผู้ใช้':
            reply = 'เคลียร์ข้อมูลผู้ใช้เรียบร้อยแล้ว';
            break;
          case 'สรุปผล':
            reply = 'สรุปผลการดำเนินงาน: ระบบทำงานได้อย่างมีประสิทธิภาพ';
            break;
          case 'Feedback':
            reply = 'ผู้ใช้ส่วนใหญ่พึงพอใจกับประสบการณ์การใช้งานของระบบ';
            break;
            case 'จัดการผู้ใช้ใหม่':
            reply = 'ผู้ใช้ใหม่ถูกเพิ่มเข้าสู่ระบบเรียบร้อยแล้ว';
            break;
          default:
            reply = "ขออภัย ฉันไม่เข้าใจคำถามของคุณ กรุณาลองอีกครั้ง";
            break;
        }
        await params.injectMessage(reply);
      },
      options: ['จัดการต่อไป'],
      path: 'start',
      chatDisabled: true,
    },
  };
  return <ChatBot flow={flow} themes={themes} />;
};

export default FaqBot;
