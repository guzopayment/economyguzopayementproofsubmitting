import { useNavigate } from "react-router-dom";

const DEVELOPER_BANK = "CBE";
const DEVELOPER_ACCOUNT_NUMBER = "1000254897837";
const TELEBIRR_PHONE_NUMBER = "0955168453";
const DEVELOPER_ACCOUNT_NAME = "Semahegn Tilahun Demelashe";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4 py-6 md:py-8 overflow-x-hidden">
      <div className="bg-white p-5 md:p-8 rounded-2xl shadow-lg w-full max-w-xl text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 bg-purple-900 text-white py-4 rounded-2xl">
          እናመሰግናለን! | Thank You!
        </h2>

        <div className="text-lg text-gray-700 space-y-4">
          <p>
            <strong>✅ የቤተሰብ ጉዞው የክፍያ ማስረጃዎ በትክክል ደርሷል።</strong>
          </p>
          <p>✅ Your payment proof have been submitted successfully.</p>
          <p>Please wait for admin review and confirmation.</p>
          <p className="text-sm text-purple-700 font-semibold">
            ወደ መነሻ ገጽ ይመለሱና የተረጋገጠልዎት ወይም ውድቅ የሆነብዎት መሆን አለመሆኑን የማሳወቂያ ምልክቷን
            በመንካት ይመልከቱ | Return to the booking home page later to see approval
            or rejection notifications.
          </p>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-left">
          <h3 className="font-extrabold text-yellow-800 text-lg mb-3">
            ይህን ሲስተም የሰራውን ሰው ቡና ይጋብዙት | By a Coffee for the Developer
          </h3>
          <p className="text-gray-700 leading-relaxed">
            ፈቃደኛ ከሆኑ ይህን ሲስተም የሰራውን ሰው ቡና ይጋብዙት | If you are volunteer to
            support this system developer, Buy a Coffee.
          </p>

          <div className="mt-4 space-y-2 text-sm md:text-base">
            <p>
              <span className="font-bold">Bank:</span> {DEVELOPER_BANK}
            </p>

            <p>
              <span className="font-bold">Account Number:</span>
              <strong> {DEVELOPER_ACCOUNT_NUMBER}</strong>
            </p>
            <p>
              <span className="font-bold">Telebirr phone number:</span>{" "}
              <strong>{TELEBIRR_PHONE_NUMBER}</strong>
            </p>
            <p>
              <span className="font-bold">Account Name:</span>{" "}
              {DEVELOPER_ACCOUNT_NAME}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white flex-1 py-3 rounded-2xl font-bold hover:bg-purple-700 transition"
          >
            ወደ መነሻ ገጽ ይመለሱ | Return to Home Page
          </button>

          <button
            onClick={() => navigate("/submit")}
            className="bg-white border border-purple-300 text-purple-700 flex-1 py-3 rounded-2xl font-bold hover:bg-purple-50 transition"
          >
            የሌላ ሰው የክፍያ መረጃን ያስገቡ | Submit Another One
          </button>
        </div>
      </div>
    </div>
  );
}
