import back from "../assets/home.png";
export default function NoEvent() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h2 className="text-2xl font-extrabold mb-6 bg-purple-900 text-white py-3 rounded">
          ይቅርታ!|Sorry!
        </h2>
        <div className="text-lg text-gray-700 mb-4">
          <p>
            {" "}
            ውድ የኢኮኖሚ ቤተሰብ ለጊዜው ምንም አይነት የክፍያ ደረሰኝ የሚጠይቅ ኩነት የልለም። Dear economy
            family, there is no any payment proof required event.
          </p>
        </div>
        <div>
          <button
            className="bg-purple-500 text-white w-full py-3 rounded-lg mt-6"
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
