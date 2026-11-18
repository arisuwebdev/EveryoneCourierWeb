import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Mail,
  MessageSquare,
  ArrowLeft,
  Package,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { deleteAccountService } from "../../api/ApiServices/auth/deleteAccountService";
import { useAuth } from "../../lib/AuthContext";

const DeleteAccount = () => {
  const { user, isAuthenticated } = useAuth();

//   console.log("Is Authenticated:", isAuthenticated);
// console.log("Logged-in User:", user);
// console.log("User Email:", user?.email);
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await deleteAccountService({
        email: isAuthenticated ? user?.email : formData.email,
        message: formData.message || "Please delete my account.",
      });

      if (response.status === 1) {
        toast.success(
          response.msg || "Account deletion request submitted successfully!",
        );
        setFormData({
          email: "",
          message: "",
        });
      } else {
        toast.error(response.msg || "Unable to submit your request.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "Unable to submit your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="px-4 py-12 sm:py-16">
        <div className="max-w-xl mx-auto">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Title Section */}
            <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8 sm:pb-2 text-left border-t border-slate-100">
              {/* <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-blue-600" />
              </div> */}

              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 text-xs font-semibold tracking-wide mb-3">
                ACCOUNT DELETE REQUEST
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Delete Account
              </h1>

              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete your account? This action is
                irreversible.
              </p>
            </div>

            {/* Form */}
            <div className="px-6 pt-0 pb-8 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <input
                      type="email"
                      name="email"
                      value={
                        isAuthenticated ? user?.email || "" : formData.email
                      }
                      onChange={handleChange}
                      placeholder="Enter your registered email"
                      required
                      readOnly={isAuthenticated}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 ${
                        isAuthenticated
                          ? "bg-slate-100 cursor-not-allowed"
                          : "bg-slate-50/50 focus:bg-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason for Deletion
                    <span className="text-slate-400 font-normal ml-1">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-4 w-5 h-5 text-slate-400" />

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us why you want to delete your account..."
                      rows={5}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>

                {/* Information */}
                {/* <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />

                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">
                      Important Information
                    </h3>

                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Account deletion may permanently remove your
                      personal information and account data. Please
                      ensure that you have completed any pending jobs
                      and payments before requesting deletion.
                    </p>
                  </div>
                </div> */}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 transition-all"
                >
                  <Trash2 size={18} />
                  {loading ? "Submitting..." : "Submit Deletion Request"}
                </button>

                <p className="text-xs text-center text-slate-400">
                  Need help? Contact our support team before deleting your
                  account.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeleteAccount;

// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { ArrowLeft, Check, Mail, Trash2 } from "lucide-react";
// import { toast } from "react-toastify";

// /* ------------------------------------------------------------------ */
// /* Edit these to match your real deletion policy.                      */
// /* ------------------------------------------------------------------ */
// const STEPS = [
//   {
//     title: "You send the request",
//     body: "Use the form with the email linked to your account.",
//   },
//   {
//     title: "We confirm it's you",
//     body: "We'll email you to verify before anything is touched.",
//   },
//   {
//     title: "Your account is deleted",
//     body: "Your profile and data are permanently removed.",
//   },
// ];

// const BEFORE_YOU_GO = [
//   "Finish any active deliveries so nobody is left waiting.",
//   "Withdraw any balance you still have in the app.",
//   "Records the law requires us to keep, such as completed payments, may be retained.",
// ];

// /* Replace with your real API call. */
// const submitDeletionRequest = async (payload) => {
//   await new Promise((resolve) => setTimeout(resolve, 600));
//   return payload;
// };

// const FONTS = `
// @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap');
// .ra-display { font-family: 'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif; letter-spacing: -0.02em; }
// .ra-body { font-family: 'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif; }
// `;

// const inputBase =
//   "w-full rounded-lg border border-[#D6D2C7] bg-white px-3.5 py-3 text-[15px] text-[#1C2230] placeholder:text-[#8A8F9C] outline-none transition focus:border-[#1C2230] focus:ring-4 focus:ring-[#1C2230]/10";

// const DeleteAccount = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     message: "",
//     confirmed: false,
//   });
//   const [loading, setLoading] = useState(false);
//   const [submittedTo, setSubmittedTo] = useState(null);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.confirmed) return;

//     try {
//       setLoading(true);
//       await submitDeletionRequest({
//         email: formData.email,
//         message: formData.message,
//       });
//       setSubmittedTo(formData.email);
//       toast.success("Deletion request sent");
//       setFormData({ email: "", message: "", confirmed: false });
//     } catch (error) {
//       toast.error("Couldn't send your request. Check your connection and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="ra-body min-h-screen bg-[#F5F4F0] text-[#1C2230]">
//       <style>{FONTS}</style>

//       <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
//         <Link
//           to="/home"
//           className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-[#5B6070] transition-colors hover:text-[#1C2230] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1C2230]/15"
//         >
//           <ArrowLeft size={16} />
//           Back to home
//         </Link>

//         <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
//           {/* ---------------- Left: what happens ---------------- */}
//           <section className="lg:pt-4">
//             <h1 className="ra-display text-4xl font-bold leading-[1.05] sm:text-5xl">
//               Delete your
//               <br />
//               RouteRunner account
//             </h1>
//             <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[#4A4F5E]">
//               We're sorry to see you go. Here's exactly what happens after you
//               send a request.
//             </p>

//             <ol className="mt-10 max-w-md">
//               {STEPS.map((step, i) => (
//                 <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
//                   {i < STEPS.length - 1 && (
//                     <span
//                       aria-hidden="true"
//                       className="absolute left-[15px] top-9 bottom-1 w-px bg-[#D6D2C7]"
//                     />
//                   )}
//                   <span className="ra-display relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1C2230] text-sm font-semibold text-[#F5F4F0]">
//                     {i + 1}
//                   </span>
//                   <div>
//                     <h2 className="text-[15px] font-semibold">{step.title}</h2>
//                     <p className="mt-0.5 text-sm leading-relaxed text-[#5B6070]">
//                       {step.body}
//                     </p>
//                   </div>
//                 </li>
//               ))}
//             </ol>

//             <div className="mt-10 max-w-md border-l-[3px] border-[#E8A33D] pl-4">
//               <h2 className="text-[15px] font-semibold">Before you go</h2>
//               <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#4A4F5E]">
//                 {BEFORE_YOU_GO.map((item) => (
//                   <li key={item}>{item}</li>
//                 ))}
//               </ul>
//             </div>
//           </section>

//           {/* ---------------- Right: the label card ---------------- */}
//           <section aria-labelledby="request-heading" className="lg:pt-2">
//             <div className="relative rounded-2xl border border-[#D6D2C7] bg-[#FDFCFA] shadow-[0_1px_0_#D6D2C7]">
//               {submittedTo ? (
//                 <div className="p-7 sm:p-9" role="status" aria-live="polite">
//                   <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F6F5C] text-white">
//                     <Check size={22} strokeWidth={2.5} />
//                   </span>
//                   <h2
//                     id="request-heading"
//                     className="ra-display mt-5 text-2xl font-bold"
//                   >
//                     Check your inbox
//                   </h2>
//                   <p className="mt-2 text-[15px] leading-relaxed text-[#4A4F5E]">
//                     We sent a confirmation email to{" "}
//                     <span className="font-semibold text-[#1C2230]">
//                       {submittedTo}
//                     </span>
//                     . Your account will be deleted once you confirm.
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => setSubmittedTo(null)}
//                     className="mt-6 text-sm font-semibold underline underline-offset-4 hover:text-[#5B6070] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1C2230]/15 rounded"
//                   >
//                     Use a different email
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   {/* Header */}
//                   <div className="p-7 pb-6 sm:p-9 sm:pb-7">
//                     <h2
//                       id="request-heading"
//                       className="ra-display text-2xl font-bold"
//                     >
//                       Request deletion
//                     </h2>
//                     <p className="mt-1.5 text-sm text-[#5B6070]">
//                       This takes about a minute.
//                     </p>
//                   </div>

//                   {/* Tear line */}
//                   <div className="relative" aria-hidden="true">
//                     <div className="border-t-2 border-dashed border-[#D6D2C7]" />
//                     <span className="absolute -left-[13px] -top-3 h-6 w-6 rounded-full border-r border-[#D6D2C7] bg-[#F5F4F0]" />
//                     <span className="absolute -right-[13px] -top-3 h-6 w-6 rounded-full border-l border-[#D6D2C7] bg-[#F5F4F0]" />
//                   </div>

//                   {/* Form */}
//                   <form
//                     onSubmit={handleSubmit}
//                     className="space-y-5 p-7 pt-8 sm:p-9 sm:pt-9"
//                   >
//                     <div>
//                       <label
//                         htmlFor="email"
//                         className="mb-1.5 block text-sm font-semibold"
//                       >
//                         Account email
//                       </label>
//                       <div className="relative">
//                         <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8A8F9C]" />
//                         <input
//                           id="email"
//                           type="email"
//                           name="email"
//                           autoComplete="email"
//                           value={formData.email}
//                           onChange={handleChange}
//                           placeholder="you@example.com"
//                           required
//                           className={`${inputBase} pl-11`}
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="message"
//                         className="mb-1.5 flex items-baseline justify-between text-sm font-semibold"
//                       >
//                         Why are you leaving?
//                         <span className="text-xs font-normal text-[#8A8F9C]">
//                           Optional
//                         </span>
//                       </label>
//                       <textarea
//                         id="message"
//                         name="message"
//                         value={formData.message}
//                         onChange={handleChange}
//                         placeholder="Your feedback helps us improve."
//                         rows={4}
//                         className={`${inputBase} resize-none`}
//                       />
//                     </div>

//                     <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-[#F5F4F0] p-3.5 text-sm leading-relaxed text-[#2F3544]">
//                       <input
//                         type="checkbox"
//                         name="confirmed"
//                         checked={formData.confirmed}
//                         onChange={handleChange}
//                         required
//                         className="mt-0.5 h-4 w-4 shrink-0 accent-[#B42318]"
//                       />
//                       <span>
//                         I understand my account and data will be
//                         permanently deleted and this can't be undone.
//                       </span>
//                     </label>

//                     <button
//                       type="submit"
//                       disabled={loading || !formData.confirmed}
//                       className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B42318] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#9A1D14] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B42318]/25 disabled:cursor-not-allowed disabled:bg-[#D9B8B4]"
//                     >
//                       <Trash2 size={17} />
//                       {loading ? "Sending request…" : "Request account deletion"}
//                     </button>

//                     <p className="text-center text-xs text-[#8A8F9C]">
//                       Not sure yet? Contact support before you delete.
//                     </p>
//                   </form>
//                 </>
//               )}
//             </div>
//           </section>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DeleteAccount;
