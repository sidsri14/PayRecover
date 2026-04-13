import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const Terms = () => {
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
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm font-medium text-stone-400">Last updated: April 13, 2026</p>
        </div>

        <div className="space-y-10 text-stone-600 dark:text-stone-400">

          {/* Intro */}
          <p className="text-base leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the PayRecover platform, including our
            web application, APIs, and related services ("Service"). By creating an account or using the Service, you
            agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">1. Service Description</h2>
            <p className="text-sm leading-relaxed">
              PayRecover provides <strong className="font-semibold text-stone-700 dark:text-stone-300">automated failed payment recovery</strong> for
              businesses using Razorpay as their payment processor. The Service monitors your Razorpay account via
              webhooks, identifies failed payment events, and automatically sends payment recovery links to your
              customers via email. Recovery attempts follow a configurable retry schedule (immediate, +24h, +72h)
              before a payment is marked abandoned.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">2. Merchant Responsibilities</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>As a merchant using PayRecover, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  You <strong className="font-semibold text-stone-700 dark:text-stone-300">own or are duly authorized</strong> to access and connect
                  the Razorpay account(s) you link to PayRecover.
                </li>
                <li>
                  You have obtained all necessary consents from your customers to share their contact information
                  (email/phone) with third-party payment recovery services, as required by applicable law including
                  the DPDP Act 2023.
                </li>
                <li>
                  The API credentials you provide are valid, kept confidential, and not shared with unauthorized parties.
                </li>
                <li>
                  You will promptly revoke or update credentials in PayRecover if you suspect they have been compromised.
                </li>
                <li>
                  You will not use the Service to process payments for prohibited or illegal goods or services.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">3. Limitation of Liability</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                PayRecover provides the Service on an <strong className="font-semibold text-stone-700 dark:text-stone-300">"as is" and "as available"</strong> basis.
                We make no guarantees regarding:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>The success rate of payment recovery</li>
                <li>Delivery of recovery emails to end-consumers</li>
                <li>Continuous, uninterrupted availability of the Service</li>
              </ul>
              <p>
                To the maximum extent permitted by law, PayRecover's total liability to you for any claim arising
                out of or relating to these Terms or the Service shall not exceed the amount you paid us in the
                three (3) months preceding the claim. In no event shall PayRecover be liable for indirect,
                incidental, punitive, or consequential damages of any kind.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">4. Acceptable Use</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="font-semibold text-stone-700 dark:text-stone-300">Abuse recovery links</strong> — do not
                  artificially trigger failed payments or generate recovery links for illegitimate purposes.
                </li>
                <li>
                  Send unsolicited or spam communications using the recovery email system.
                </li>
                <li>
                  Attempt to reverse-engineer, decompile, or tamper with the PayRecover platform or its APIs.
                </li>
                <li>
                  Use the Service in a way that imposes an unreasonable load on our infrastructure or Razorpay's systems.
                </li>
                <li>
                  Resell or sublicense access to the Service without explicit written consent from PayRecover.
                </li>
              </ul>
              <p>
                Violation of this section may result in immediate suspension or termination of your account without
                refund.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">5. Subscription and Billing</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Paid plans (Starter at ₹799/mo, Pro at ₹1,499/mo) are billed monthly via Razorpay Subscriptions.
                Your subscription renews automatically unless cancelled before the renewal date. Refunds are not
                provided for partial billing periods.
              </p>
              <p>
                The free plan provides monitoring access only. Automated recovery (email dispatch and payment link
                creation) requires an active paid subscription.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">6. Governing Law</h2>
            <p className="text-sm leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of{' '}
              <strong className="font-semibold text-stone-700 dark:text-stone-300">India</strong>. Any disputes arising
              under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts
              located in India. If any provision of these Terms is found to be unenforceable, the remaining
              provisions shall continue in full force and effect.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">7. Changes to These Terms</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of material changes via
              email at least 14 days before they take effect. Continued use of the Service after that date
              constitutes your acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-warm-border dark:border-stone-800 pt-8">
            <p className="text-sm leading-relaxed">
              Questions about these Terms? Contact us at{' '}
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
            <Link to="/privacy" className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
