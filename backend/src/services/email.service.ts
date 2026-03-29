const formatAmount = (paise: number, currency: string): string => {
  const symbol = currency === 'INR' ? '₹' : currency + ' ';
  return `${symbol}${(paise / 100).toLocaleString('en-IN')}`;
};

export const sendPaymentFailedEmail = async (
  to: string,
  params: {
    customerName?: string;
    amount: number;
    currency: string;
    paymentLink: string;
    paymentId: string;
  }
): Promise<void> => {
  // In production, replace with Resend/Nodemailer/SendGrid
  const greeting = params.customerName ? `Hi ${params.customerName},` : 'Hi,';
  console.log('--------------------------------------------------');
  console.log('💸 PAYMENT FAILED EMAIL');
  console.log(`To: ${to}`);
  console.log(`Subject: Your payment of ${formatAmount(params.amount, params.currency)} failed`);
  console.log(`Body:`);
  console.log(`  ${greeting}`);
  console.log(`  Your payment of ${formatAmount(params.amount, params.currency)} could not be processed.`);
  console.log(`  Click here to retry: ${params.paymentLink}`);
  console.log(`  Payment ID: ${params.paymentId}`);
  console.log('--------------------------------------------------');
};

export const sendPaymentReminderEmail = async (
  to: string,
  params: {
    customerName?: string;
    amount: number;
    currency: string;
    paymentLink: string;
    dayOffset: number;
    paymentId: string;
  }
): Promise<void> => {
  // In production, replace with Resend/Nodemailer/SendGrid
  const greeting = params.customerName ? `Hi ${params.customerName},` : 'Hi,';
  const isFinal = params.dayOffset >= 5;
  console.log('--------------------------------------------------');
  console.log(`🔔 PAYMENT REMINDER EMAIL (Day ${params.dayOffset})`);
  console.log(`To: ${to}`);
  console.log(
    `Subject: ${isFinal ? 'Final reminder' : 'Reminder'} — complete your payment of ${formatAmount(params.amount, params.currency)}`
  );
  console.log(`Body:`);
  console.log(`  ${greeting}`);
  if (isFinal) {
    console.log(`  This is your final reminder. Your payment of ${formatAmount(params.amount, params.currency)} is still pending.`);
  } else {
    console.log(`  Just a reminder that your payment of ${formatAmount(params.amount, params.currency)} is still pending.`);
  }
  console.log(`  Complete your payment here: ${params.paymentLink}`);
  console.log(`  Payment ID: ${params.paymentId}`);
  console.log('--------------------------------------------------');
};
