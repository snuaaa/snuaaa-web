import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sendMail = async ({ to, subject, text }: {to: string, subject: string, text: string}) => {

  const client = new SESClient({ region: 'ap-northeast-2' });
   
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: text
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      }
    },
    Source: 'no-reply@snuaaa.net'
  });
   
  // simple 메일 보내기
  await client.send(command);  
};

export { sendMail };
