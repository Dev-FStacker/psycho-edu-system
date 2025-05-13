import { useEffect, useMemo, useState } from "react";

const FeedbackForm = ({ appointment, role }) => {
  const [notes, setNotes] = useState("");

  // Effect to update notes based on role and appointment changes
  useEffect(() => {
    if (role !== "Student") {
      setNotes(appointment.details?.notes || "");
    } else {
      setNotes(appointment.notes || "");
    }
  }, [appointment, role]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!notes.trim()) {
      setMessage("Feedback cannot be empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `https://localhost:7192/api/appointments/${appointment.id}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Feedback submitted successfully!");
      } else {
        setMessage(data.message || "Failed to submit feedback.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 mt-4 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-blue-700 font-bold text-2xl">Feedback</p>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 mt-2"
        placeholder="Write your feedback here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows="3"
      ></textarea>

      {["Teacher", "Psychologist"].includes(role) && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      )}

      {message && <p className="mt-2 text-red-600">{message}</p>}
    </div>
  );
};

export default FeedbackForm;
