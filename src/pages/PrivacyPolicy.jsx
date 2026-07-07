import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: April 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <p>
              Everyone's a Courier ("we", "us", "our") is committed to protecting your personal information in accordance with the <strong>Privacy Act 1988 (Cth)</strong> and the <strong>Australian Privacy Principles (APPs)</strong>. This Privacy Policy explains how we collect, use, disclose, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. What Information We Collect</h2>
            <p>We collect personal information that is necessary to provide our peer-to-peer delivery services, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Full name and email address</li>
              <li>Phone number and physical address</li>
              <li>Payment details (processed securely via Stripe — we do not store card numbers)</li>
              <li>Identity verification documents (for couriers)</li>
              <li>Delivery pickup and drop-off addresses</li>
              <li>Device location data (only during active deliveries, with your consent)</li>
              <li>Reviews and ratings you submit</li>
              <li>Communications you send through the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Collect Information</h2>
            <p>We collect information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Directly from you when you register, post a job, or apply for a job</li>
              <li>Automatically through your use of our platform (e.g. location data during deliveries)</li>
              <li>From third-party services such as Stripe for payment processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Why We Collect and Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Create and manage your account</li>
              <li>Facilitate delivery jobs between customers and couriers</li>
              <li>Process payments and issue payouts to couriers</li>
              <li>Enable real-time delivery tracking</li>
              <li>Send notifications about your jobs and account activity</li>
              <li>Verify courier identity and maintain platform safety</li>
              <li>Improve our services and resolve disputes</li>
              <li>Comply with our legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Disclosure of Your Information</h2>
            <p>We may share your personal information with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Other users:</strong> Your name, rating, and general location are shared with the customer or courier you are matched with for a job.</li>
              <li><strong>Stripe:</strong> For secure payment processing and courier payouts. Stripe's Privacy Policy applies to information shared with them.</li>
              <li><strong>Google Maps:</strong> For address lookups and delivery tracking.</li>
              <li><strong>Law enforcement or regulators:</strong> Where required by Australian law or court order.</li>
            </ul>
            <p className="mt-2">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Location Data</h2>
            <p>
              We collect your device's location data only when you are an active courier on a live delivery job, and only with your explicit consent. Location sharing stops when the delivery is complete. You may withdraw consent at any time through your device settings, though this may affect your ability to use courier features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Data Security</h2>
            <p>
              We take reasonable steps to protect your personal information from misuse, loss, and unauthorised access. This includes encrypted data storage, secure HTTPS connections, and restricted staff access. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services. We may also retain information to comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion of your account and associated data (see Section 9).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Overseas Disclosure</h2>
            <p>
              Some of our service providers (including Stripe and our hosting infrastructure) may process or store data outside Australia. We take reasonable steps to ensure these providers maintain standards consistent with the Australian Privacy Principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Your Rights</h2>
            <p>Under the Privacy Act 1988, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or outdated information</li>
              <li>Request deletion of your account and personal data</li>
              <li>Make a complaint about how we handle your data</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at the details below.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Complaints</h2>
            <p>
              If you believe we have breached the Australian Privacy Principles, please contact us first so we can attempt to resolve your concern. If you are not satisfied with our response, you may lodge a complaint with the <strong>Office of the Australian Information Commissioner (OAIC)</strong> at <a href="https://www.oaic.gov.au" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Contact Us</h2>
            <p>For any privacy-related questions or requests, please contact:</p>
            <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800">Everyone's a Courier</p>
              <p className="text-slate-600">Australia</p>
              <p className="text-slate-600">Email: privacy@everyoneisacourier.com.au</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}