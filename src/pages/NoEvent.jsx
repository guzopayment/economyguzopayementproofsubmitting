import back from "../assets/home.png";
import closedZK from "../assets/closedZK.jpg";
export default function NoEvent() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        {/* <img src={closedZK} alt="Closed Event" className="mx-auto mb-4" /> */}
        <h3 className="font-extrabold text-yellow-800 text-lg mb-3">
          <img
            src={closedZK}
            alt="Click On "
            srcset=""
            className="w-24 h-18 mx-6 rounded-full"
          />
          ይህን ሲስተም የሰራውን ሰው ቡና ይጋብዙት | By a Coffee for the Developer
        </h3>
        <h2 className="text-2xl font-extrabold mb-6 bg-emerald-900 text-white py-3 rounded">
          ይቅርታ!|Sorry!
        </h2>
        <div className="text-lg text-gray-700 mb-4">
          <p>
            {" "}
            ውድ የኢኮኖሚ ቤተሰብ ለጊዜው ምንም አይነት የክፍያ ደረሰኝ የሚጠይቅ ኩነት የልለም። Dear economy
            family, there is no any verification image required event.
          </p>
          <h2 className="text-lg text-red-700 mb-4">
            <strong>
              ጉዞ ወደ መናገሻ ጋራው መድኃኔዓለም የትኬት ሽያጭ አብቅቷል። ስለተሳተፍ እናመሰግናለን
            </strong>
          </h2>
        </div>
        <div>
          <button
            className="bg-emerald-500 text-white w-full py-3 rounded-lg mt-6"
            onClick={() => (window.location.href = "/")}
          >
            <img src={back} alt="back" className="w-5 h-5 inline mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
