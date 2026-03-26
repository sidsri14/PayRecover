export const sendAlertEmail = async (to: string, monitorUrl: string, status: string, statusCode?: number | null) => {
  // In a real application, we would use Resend or Nodemailer here.
  // For the MVP, we will simulate the email being sent.
  console.log('--------------------------------------------------');
  console.log(`📠 EMAIL ALERT TRIGGERED!`);
  console.log(`To: ${to}`);
  console.log(`Subject: Monitor Alert - ${monitorUrl} is ${status}`);
  console.log(`Body: Your monitor for ${monitorUrl} has changed status to ${status}. Status Code: ${statusCode}`);
  console.log('--------------------------------------------------');
};
