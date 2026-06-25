import { useNavigate } from "react-router-dom";
import buyMeCoffee from "../assets/buyMeCoffee.gif";
const DEVELOPER_BANK = "CBE";
const DEVELOPER_ACCOUNT_NUMBER = "1000254897837";
const TELEBIRR_PHONE_NUMBER = "0955168453";
const DEVELOPER_ACCOUNT_NAME = "Semahegn Tilahun Demelashe";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4 py-6 md:py-8 overflow-x-hidden">
      <div className="bg-white p-5 md:p-8 rounded-2xl shadow-lg w-full max-w-xl text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 bg-emerald-900 text-white py-4 rounded-2xl">
          እናመሰግናለን! | Thank You!
        </h2>

        <div className="text-lg text-gray-700 space-y-4">
          <p>
            <strong>✅ የቤተሰብ ጉዞው የማረጋገጫ መረጃዎ በትክክል ደርሷል።</strong>
            Your booking verification has been submitted successfully.{" "}
            <small>
              <br /> እባክዎ ለአስተዳደር ግምገማና ማረጋገጫ ይጠብቁ። | Please wait for admin
              review and confirmation.
            </small>
          </p>
          <p className="text-sm text-emerald-700 font-semibold">
            ያስገቡት የማረጋገጫ መረጃ የጸደቀልዎት ወይም ውድቅ የሆነብዎት መሆን አለመሆኑን ወደ መነሻ ገጽ ይመለሱ
            የሚለውን በመንካት ይመልከቱ | Return to the booking home page later to check
            the approval or rejection.
          </p>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-left">
          <h3 className="font-extrabold text-yellow-800 text-lg mb-3">
            <img
              src={buyMeCoffee}
              alt="Click On "
              srcset=""
              className="w-24 h-18 mx-6 rounded-full"
            />
            ይህን ሲስተም የሰራውን ሰው ቡና ይጋብዙት | By a Coffee for the Developer
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            ፈቃደኛ ከሆኑ ይህን ሲስተም የሰራውን ሰው ቡና ይጋብዙት | If you are volunteer Buy a
            Coffee for this system developer.
          </p>

          <div className="mt-4 space-y-2 text-sm md:text-base">
            <p>
              <span className="font-bold">CBE reference:</span>{" "}
              <strong>{DEVELOPER_ACCOUNT_NUMBER}</strong>
            </p>
            <p>
              <span className="font-bold">Telebirr reference:</span>{" "}
              <strong>{TELEBIRR_PHONE_NUMBER}</strong>
            </p>
            <p>
              <span className="font-bold text-sm">Account Name:</span>{" "}
              {DEVELOPER_ACCOUNT_NAME}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-emerald-700 to-green-600 text-white flex-1 py-3 rounded-2xl font-bold hover:from-emerald-800 hover:to-green-700 transition"
          >
            ወደ መነሻ ገጽ ይመለሱ | Return to Home Page
          </button>

          <button
            onClick={() => navigate("/submit")}
            className="bg-white border border-emerald-300 text-emerald-700 flex-1 py-3 rounded-2xl font-bold hover:bg-emerald-50 transition"
          >
            የሌላ ሰው የማረጋገጫ መረጃን ያስገቡ | Submit Another One
          </button>
        </div>
      </div>
    </div>
  );
}
