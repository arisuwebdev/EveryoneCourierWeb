import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-slate-700 leading-relaxed">

          <section>
            <p>
              These Terms of Service ("Terms") govern your use of the <strong>Everyone's a Courier</strong> platform ("Platform"), operated in Australia. By creating an account or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must be at least 17 years of age to use this Platform.</li>
              <li>You must be located in Australia or be delivering within Australia.</li>
              <li>By registering, you confirm that all information you provide is accurate and up to date.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. The Platform</h2>
            <p>
              Everyone's a Courier is a peer-to-peer delivery marketplace that connects customers who need items delivered ("Customers") with individuals willing to make those deliveries ("Couriers"). We are a platform intermediary only and are not a party to any delivery agreement between Customers and Couriers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must not share your account with any other person.</li>
              <li>You must notify us immediately if you suspect unauthorised access to your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Courier Obligations</h2>
            <p>If you use the Platform as a Courier, you agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Only accept jobs you are genuinely able to complete safely and on time.</li>
              <li>Hold a valid driver's licence (where applicable) and ensure your vehicle is roadworthy and insured.</li>
              <li>Handle all packages with reasonable care and in accordance with any special instructions.</li>
              <li>Not transport prohibited, dangerous, or illegal items.</li>
              <li>Comply with all applicable Australian road and transport laws.</li>
              <li>Understand that you operate as an independent contractor, not an employee of Everyone's a Courier.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Customer Obligations</h2>
            <p>If you use the Platform as a Customer, you agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide accurate pickup and delivery addresses and package descriptions.</li>
              <li>Not request delivery of prohibited, dangerous, illegal, or hazardous items.</li>
              <li>Pay the agreed job price through the Platform's secure payment system.</li>
              <li>Treat Couriers with respect and fairness.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Prohibited Items</h2>
            <p>You must not use the Platform to request or perform delivery of:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Illegal drugs or controlled substances</li>
              <li>Weapons, firearms, or ammunition</li>
              <li>Hazardous, flammable, or toxic materials</li>
              <li>Any item whose transport is prohibited by Australian law</li>
              <li>Stolen or fraudulently obtained goods</li>
            </ul>
            <p className="mt-2">Violation of this clause may result in immediate account termination and referral to law enforcement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Payments and Fees</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All payments are processed securely via Stripe.</li>
              <li>Everyone's a Courier charges a platform fee (currently 10%) on each completed job.</li>
              <li>Couriers receive their payout after the delivery is marked as complete.</li>
              <li>Refunds are handled at our discretion in cases of dispute.</li>
              <li>All prices are in Australian Dollars (AUD) and are inclusive of GST where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Liability Limitation</h2>
            <p>
              To the maximum extent permitted by Australian Consumer Law, Everyone's a Courier is not liable for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Loss or damage to packages during delivery</li>
              <li>Delays or failure to complete a delivery</li>
              <li>Any indirect, consequential, or special losses</li>
              <li>Actions or omissions of Couriers or Customers</li>
            </ul>
            <p className="mt-2">
              Nothing in these Terms excludes rights under the <strong>Australian Consumer Law (Schedule 2, Competition and Consumer Act 2010)</strong> that cannot be excluded by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Dispute Resolution</h2>
            <p>
              In the event of a dispute between a Customer and Courier, we encourage both parties to resolve the matter directly. If unresolved, you may contact us and we will endeavour to mediate in good faith. If a dispute cannot be resolved, it shall be subject to the laws of the state of New South Wales, Australia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Intellectual Property</h2>
            <p>
              All content, branding, and technology on the Platform belongs to Everyone's a Courier. You may not copy, reproduce, or use our intellectual property without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Platform at any time, with or without notice, if you breach these Terms or engage in conduct we deem harmful to the Platform or its users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms. We will notify users of material changes where reasonably practicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of New South Wales, Australia. Any disputes are subject to the exclusive jurisdiction of the courts of New South Wales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">14. Contact</h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800">Everyone's a Courier</p>
              <p className="text-slate-600">Australia</p>
              <p className="text-slate-600">Email: legal@everyoneisacourier.com.au</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}