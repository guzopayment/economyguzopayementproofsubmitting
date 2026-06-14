import { useState } from "react";

export default function UserForm() {
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(form).forEach((k) => data.append(k, form[k]));
    if (file) data.append("paymentProof", file);

    await fetch("https://server-y72m.onrender.com/api/submissions/submit", {
      method: "POST",
      body: data,
    });

    alert("Submitted successfully!");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Vacation Ticket Submission</h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          placeholder="Full Name"
          className="input"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Organization"
          className="input"
          onChange={(e) => setForm({ ...form, organization: e.target.value })}
        />

        <input
          placeholder="Phone"
          className="input"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="number"
          placeholder="Number of Participants"
          className="input"
          onChange={(e) =>
            setForm({
              ...form,
              participants: e.target.value,
            })
          }
        />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
