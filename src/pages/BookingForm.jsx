import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import back from "../assets/home.png";
import MessageModal from "../components/MessageModal";
import { upsertTrackedBooking } from "../utils/trackedBookings";
import {
  ORGANIZATIONS,
  SEX_OPTIONS,
  SUBCITY_OPTIONS,
} from "../utils/bookingOptions";

const emptyParticipant = (organization = "", subCity = "") => ({
  name: "",
  phone: "",
  organization,
  sex: "",
  subCity,
});

const ALPHABETIC_REGEX = /^[A-Za-z\u1200-\u137F\s]*$/;
const PHONE_REGEX = /^09\d{8}$/;

function normalizeSpaces(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function isAlphabeticText(value) {
  return (
    !!normalizeSpaces(value) && ALPHABETIC_REGEX.test(normalizeSpaces(value))
  );
}

export default function BookingForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    organization: "",
    phone: "",
    sex: "",
    subCity: "",
    participants: "",
  });
  const [additionalParticipants, setAdditionalParticipants] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");

  const showModal = (title, message, type = "info") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const participantCount = useMemo(() => {
    const parsed = Number(form.participants || 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [form.participants]);

  useEffect(() => {
    const extraCount = participantCount > 1 ? participantCount - 1 : 0;

    setAdditionalParticipants((prev) =>
      Array.from({ length: extraCount }, (_, idx) => ({
        ...(prev[idx] || emptyParticipant(form.organization, form.subCity)),
        organization:
          normalizeSpaces(prev[idx]?.organization) ||
          normalizeSpaces(form.organization),
        subCity:
          normalizeSpaces(prev[idx]?.subCity) || normalizeSpaces(form.subCity),
      })),
    );
  }, [participantCount, form.organization, form.subCity]);

  const setFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameInput = (value, fieldLabel = "ሙሉ ስም") => {
    if (!ALPHABETIC_REGEX.test(value)) {
      showModal("ማስጠንቀቂያ", `${fieldLabel} ቁጥር ወይም ልዩ ምልክት መያዝ የለበትም።`, "error");
      return null;
    }
    return value;
  };

  const handlePhoneInput = (value, label = "ስልክ ቁጥር") => {
    const digits = String(value || "")
      .replace(/\D/g, "")
      .slice(0, 10);
    if (String(value || "") !== digits) {
      showModal(
        "ማስጠንቀቂያ",
        `${label} ቁጥር ብቻ መሆን አለበት፣ ከ10 ዲጂት በላይ አይፈቀድም።`,
        "error",
      );
    }
    return digits;
  };

  const handleExtraChange = (index, field, value) => {
    setAdditionalParticipants((prev) =>
      prev.map((participant, idx) => {
        if (idx !== index) return participant;

        if (field === "name") {
          const nextValue = handleNameInput(value, `የተሳታፊ ${index + 2} ስም`);
          if (nextValue === null) return participant;
          return { ...participant, [field]: nextValue };
        }

        if (field === "phone") {
          return {
            ...participant,
            [field]: handlePhoneInput(value, `የተሳታፊ ${index + 2} ስልክ ቁጥር`),
          };
        }

        return { ...participant, [field]: value };
      }),
    );
  };

  const validate = () => {
    if (!isAlphabeticText(form.name)) return "ሙሉ ስም በትክክል ያስገቡ።";
    if (!normalizeSpaces(form.organization)) return "የቤተሰብ ስም (ድርጅት) ይምረጡ።";
    if (!PHONE_REGEX.test(normalizeSpaces(form.phone))) {
      return "ስልክ ቁጥር በ09 የሚጀምር 10 ዲጂት መሆን አለበት።";
    }
    if (!normalizeSpaces(form.sex)) return "ፆታ ይምረጡ።";
    if (!normalizeSpaces(form.subCity)) return "ክ/ከተማ ይምረጡ።";
    if (!form.participants || Number(form.participants) <= 0) {
      return "ተሳታፊ ብዛት ከ 0 በላይ ያስገቡ።";
    }
    if (!file) return "የክፍያ ማስረጃ ያስገቡ።";

    for (let i = 0; i < additionalParticipants.length; i += 1) {
      const participant = additionalParticipants[i];
      if (!isAlphabeticText(participant.name))
        return `የተሳታፊ ${i + 2} ስም በትክክል ያስገቡ።`;
      if (!PHONE_REGEX.test(normalizeSpaces(participant.phone))) {
        return `የተሳታፊ ${i + 2} ስልክ ቁጥር በ09 የሚጀምር 10 ዲጂት መሆን አለበት።`;
      }
      if (!normalizeSpaces(participant.organization))
        return `የተሳታፊ ${i + 2} ድርጅት ይምረጡ።`;
      if (!normalizeSpaces(participant.sex)) return `የተሳታፊ ${i + 2} ፆታ ይምረጡ።`;
    }

    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const validationError = validate();
    if (validationError) {
      showModal("ማስጠንቀቂያ", validationError, "error");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();
      data.append("name", normalizeSpaces(form.name));
      data.append("organization", normalizeSpaces(form.organization));
      data.append("phone", normalizeSpaces(form.phone));
      data.append("sex", normalizeSpaces(form.sex));
      data.append("subCity", normalizeSpaces(form.subCity));
      data.append("participants", String(form.participants).trim());
      showModal("ተሳክቷል", "የክፍያ ማስረጃዎ በተሳካ ሁኔታ ተልኳል።", "success");

      data.append(
        "participantDetails",
        JSON.stringify(
          additionalParticipants.map((participant) => ({
            name: normalizeSpaces(participant.name),
            phone: normalizeSpaces(participant.phone),
            organization: normalizeSpaces(participant.organization),
            sex: normalizeSpaces(participant.sex),
            subCity:
              normalizeSpaces(participant.subCity) ||
              normalizeSpaces(form.subCity),
          })),
        ),
      );
      data.append("paymentProof", file);

      const res = await api.post("/bookings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const booking = res.data?.booking || res.data;
      upsertTrackedBooking({
        bookingId: booking._id,
        name: booking.name,
        status: booking.status || "Pending",
        message:
          "Your payment proof has been submitted. Waiting for admin review.",
        updatedAt:
          booking.updatedAt || booking.createdAt || new Date().toISOString(),
        unread: false,
      });

      navigate("/thank-you");
    } catch (submitError) {
      console.error(submitError.response?.data || submitError.message);
      showModal(
        "ማስጠንቀቂያ",
        submitError.response?.data?.message ||
          "የኢንተርኔት ወይም የሰርቨር መቋረጥ ተከስቷል። እባክዎ ደግመው ይሞክሩ።",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4 py-6 md:py-8 overflow-x-hidden">
      <div className="w-full max-w-3xl min-w-0">
        <div className="text-left mb-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-4 md:px-6 py-3 rounded-xl font-bold shadow hover:scale-105 transition max-w-full"
            onClick={() => navigate("/")}
          >
            <img src={back} alt="back" className="w-5 h-5" />
            መመለስ
          </button>
        </div>

        <form
          onSubmit={submit}
          className="bg-white p-6 md:p-8 rounded-3xl shadow-xl"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-center text-purple-700">
            የጉዞ ትኬት የክፍያ ማስረጃ ማስገቢያ
          </h2>

          <p className="text-center text-gray-500 mb-6">
            የክፍያ ማስረጃዎትን ከማስገባትዎት በፊት የሚከተሉትን መረጃዎች በትክክል ይሙሉ።
          </p>

          <input
            placeholder="ሙሉ ስም / Full Name"
            className="border p-3 mb-3 w-full rounded-xl"
            value={form.name}
            onChange={(e) => {
              const nextValue = handleNameInput(e.target.value);
              if (nextValue !== null) setFormField("name", nextValue);
            }}
          />

          <select
            className="border p-3 mb-3 w-full rounded-xl bg-white"
            value={form.organization}
            onChange={(e) => setFormField("organization", e.target.value)}
          >
            <option value="">የቤተሰብ ስም (ድርጅት) ይምረጡ / Select Organization</option>
            {ORGANIZATIONS.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="tel"
              placeholder="ስልክ ቁጥር / Phone Number"
              className="border p-3 w-full rounded-xl"
              value={form.phone}
              onChange={(e) =>
                setFormField("phone", handlePhoneInput(e.target.value))
              }
            />

            <select
              className="border p-3 w-full rounded-xl bg-white"
              value={form.sex}
              onChange={(e) => setFormField("sex", e.target.value)}
            >
              <option value="">ፆታ / Sex</option>
              {SEX_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <select
            className="border p-3 mb-3 w-full rounded-xl bg-white"
            value={form.subCity}
            onChange={(e) => setFormField("subCity", e.target.value)}
          >
            <option value="">ክ/ከተማ / Sub City</option>
            {SUBCITY_OPTIONS.map((subCity) => (
              <option key={subCity} value={subCity}>
                {subCity}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="የተሳታፊ ብዛት / Participants"
            className="border p-3 mb-3 w-full rounded-xl"
            value={form.participants}
            onChange={(e) => setFormField("participants", e.target.value)}
          />

          {participantCount > 1 && (
            <div className="mb-4 rounded-2xl border border-purple-100 bg-purple-50 p-4">
              <h3 className="text-lg font-bold text-purple-700 mb-3">
                Additional participants / ተጨማሪ ተሳታፊዎች
              </h3>
              <div className="space-y-4">
                {additionalParticipants.map((participant, index) => (
                  <div
                    key={`participant-${index + 2}`}
                    className="rounded-2xl bg-white p-4 shadow-sm border border-purple-100"
                  >
                    <p className="font-semibold text-purple-700 mb-3">
                      Participant {index + 2}
                    </p>
                    <input
                      placeholder="ሙሉ ስም / Full Name"
                      className="border p-3 mb-3 w-full rounded-xl"
                      value={participant.name}
                      onChange={(e) =>
                        handleExtraChange(index, "name", e.target.value)
                      }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input
                        type="tel"
                        placeholder="ስልክ ቁጥር / Phone Number"
                        className="border p-3 w-full rounded-xl"
                        value={participant.phone}
                        onChange={(e) =>
                          handleExtraChange(index, "phone", e.target.value)
                        }
                      />
                      <select
                        className="border p-3 w-full rounded-xl bg-white"
                        value={participant.sex}
                        onChange={(e) =>
                          handleExtraChange(index, "sex", e.target.value)
                        }
                      >
                        <option value="">ፆታ / Sex</option>
                        {SEX_OPTIONS.map((option) => (
                          <option key={`${option}-${index}`} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <select
                      className="border p-3 w-full rounded-xl bg-white"
                      value={participant.organization}
                      onChange={(e) =>
                        handleExtraChange(index, "organization", e.target.value)
                      }
                    >
                      <option value="">ድርጅት ይምረጡ / Select Organization</option>
                      {ORGANIZATIONS.map((org) => (
                        <option key={`${org}-${index}`} value={org}>
                          {org}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">
              የክፍያ ማስረጃ / Payment Proof
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full overflow-x-auto"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            disabled={submitting}
            className="bg-purple-500 text-white w-full py-3 rounded-xl font-bold hover:bg-purple-600 transition disabled:opacity-60"
          >
            {submitting ? "በመላክ ላይ..." : "ያስገቡ / Submit"}
          </button>

          <div className="text-sm text-gray-500 mt-4">
            * እባክዎ የሞሉት እና ያስገቡት የክፍያ ማስረጃ ትክክለኛ መሆኑን ያረጋግጡ። ትክክለኛ ካልሆነ በአስተዳድሩ
            ውድቅ ሊደረግ ይችላል።
          </div>
        </form>
      </div>

      <MessageModal
        open={modalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
