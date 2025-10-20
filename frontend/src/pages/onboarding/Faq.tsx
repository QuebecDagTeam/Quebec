import { useState } from "react";

export const Faq= () => {
  const faqs = [
    {
      id: 1,
      question: "What is Quebec?",
      answer:
        "Quebec is a blockchain-based innovation hub focused on secure digital verification, KYC integration, and decentralized project collaboration.",
    },
    {
      id: 2,
      question: "How does Quebec ensure data privacy?",
      answer:
        "We use end-to-end encryption, secure smart contracts, and decentralized identity management to ensure user data remains private and tamper-proof.",
    },
    {
      id: 3,
      question: "Can I integrate Quebec with my existing platform?",
      answer:
        "Yes. Quebec offers APIs and SDKs that make it easy to integrate with your web or mobile platform for seamless verification and decentralized transactions.",
    },
    {
      id: 4,
      question: "Is Quebec open source?",
      answer:
        "Quebec promotes transparency and collaboration. Our core smart contracts and SDKs are open source and available on our GitHub page.",
    },
  ];

  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="w-full py-16 " id="faq">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <button
                className="w-full flex justify-between items-center p-4 text-left text-gray-800 font-medium"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              >
                {faq.question}
                <span className="text-indigo-600">
                  {openId === faq.id ? "−" : "+"}
                </span>
              </button>
              {openId === faq.id && (
                <p className="px-4 pb-4 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
