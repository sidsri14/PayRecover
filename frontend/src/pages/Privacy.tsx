import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-cream dark:bg-stone-900 transition-colors">
      {/* Header */}
      <header className="border-b border-warm-border dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="bg-stone-800 dark:bg-stone-100 p-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-white dark:text-stone-900" />
          </div>
          <span className="font-black text-lg text-stone-900 dark:text-white tracking-tight">PayRecover</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm font-medium text-stone-400">Last updated: April 13, 2026</p>
        </div>

        <div className="space-y-10 text-stone-600 dark:text-stone-400">

          {/* Intro */}
          <p className="text-base leading-relaxed">
            PayRecover ("we", "us", or "our") is committed to protecting the privacy of both our merchant customers and
            the end-consumers whose payment data we process on merchants' behalf. This policy explains what data we
            collect, how we use it, and the rights available to you under applicable law.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">1. What Data We Collect</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                <strong className="font-semibold text-stone-700 dark:text-stone-300">Merchant account data:</strong>{' '}
                Name, email address, hashed password, and Razorpay API credentials (encrypted at rest using AES-256-GCM).
              </p>
              <p>
                <strong className="font-semibold text-stone-700 dark:text-stone-300">End-consumer payment data:</strong>{' '}
                Customer email addresses and phone numbers received via Razorpay payment failure webhooks. We do not
                store full card numbers, CVVs, or any payment instrument details beyond what Razorpay provides in the
                webhook payload.
              </p>
              <p>
                <strong className="font-semibold text-stone-700 dark:text-stone-300">Usage and audit logs:</strong>{' '}
                Actions taken within the PayRecover dashboard, timestamps, and IP addresses for security auditing.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">2. How We Use It</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                End-consumer data (email / phone) is used <strong className="font-semibold text-stone-700 dark:text-stone-300">solely</strong> for
                sending payment recovery links on behalf of the merchant whose Razorpay account triggered the webhook. We do not:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Sell or share consumer data with third parties</li>
                <li>Use consumer data for advertising or profiling</li>
                <li>Cross-reference consumer data across different merchant accounts</li>
              </ul>
              <p>
                Merchant account data is used to authenticate users, decrypt Razorpay credentials at runtime for
                payment-link creation, and generate billing invoices.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">3. Data Retention</h2>
            <p className="text-sm leading-relaxed">
              End-consumer payment data is retained only as long as the recovery workflow is active. Once a payment
              is marked <strong className="font-semibold text-stone-700 dark:text-stone-300">recovered</strong> or{' '}
              <strong className="font-semibold text-stone-700 dark:text-stone-300">abandoned</strong> (after 7 days of
              no response), the associated personal data is eligible for deletion in accordance with our automated
              cleanup schedule. Merchant account data is retained for the duration of the subscription and deleted
              within 30 days of account closure upon request.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">4. Your Rights (DPDP Act 2023)</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                PayRecover complies with the <strong className="font-semibold text-stone-700 dark:text-stone-300">Digital Personal Data Protection (DPDP) Act, 2023</strong> of India.
                As a Data Principal (end-consumer) you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Access information about the personal data we hold about you</li>
                <li>Request correction of inaccurate personal data</li>
                <li>Request erasure of your personal data (right to be forgotten)</li>
                <li>Withdraw consent for processing at any time</li>
                <li>Nominate a representative to exercise these rights on your behalf</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:support@payrecover.app" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                  support@payrecover.app
                </a>.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">5. Data Processor Notice</h2>
            <p className="text-sm leading-relaxed">
              With respect to end-consumer data, PayRecover acts exclusively as a{' '}
              <strong className="font-semibold text-stone-700 dark:text-stone-300">Data Processor</strong>, not a Data
              Controller. The merchant who has connected their Razorpay account is the Data Controller and is
              responsible for having a lawful basis (e.g., customer consent) to share that data with PayRecover for
              recovery processing. Merchants agree to this responsibility upon accepting our Terms of Service.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">6. Security</h2>
            <p className="text-sm leading-relaxed">
              All Razorpay API credentials stored in PayRecover are encrypted at rest using{' '}
              <strong className="font-semibold text-stone-700 dark:text-stone-300">AES-256-GCM</strong> with unique
              initialization vectors per record. Connections to our database and Redis queue are encrypted in transit
              via TLS. We do not log decrypted credential values.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">7. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify registered merchants via email of
              material changes at least 14 days before they take effect. Continued use of the service after that
              date constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-warm-border dark:border-stone-800 pt-8">
            <p className="text-sm leading-relaxed">
              Questions about this policy? Email us at{' '}
              <a href="mailto:support@payrecover.app" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                support@payrecover.app
              </a>{' '}
              or visit our{' '}
              <Link to="/contact" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Contact page
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="py-10 border-t border-warm-border dark:border-stone-800 mt-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold text-stone-400">
          <p>© 2026 PayRecover. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
