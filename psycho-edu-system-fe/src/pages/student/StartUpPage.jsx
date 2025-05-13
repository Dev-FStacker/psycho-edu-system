/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loadings/Loading";
import { useOutletContext } from "react-router-dom";
import { SurveyService } from "../../api/services/surveyService";
import { motion } from "framer-motion";

const StartUpPage = () => {
  const location = useLocation();
  const context = useOutletContext() || {};
  const navigate = useNavigate();

  const surveyData = location.state?.surveyData ?? context.surveyData;
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurveyData = async () => {
      if (!surveyData) {
        setError("There is no survey data to display. Please try again.");
        setLoading(false);
        return;
      }
      try {
        const response = await SurveyService.getSurveyContent(surveyData);
        localStorage.setItem("questions", JSON.stringify(response));
        console.log("Survey data saved to localStorage ✅");
      } catch (error) {
        console.error("Error saving survey to localStorage:", error);
        setError("Unable to load survey data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [surveyData]);

  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );

  return (
    <div className="h-screen flex items-center justify-center bg-white relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
      >
        Back
      </button>

      {surveyData ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center items-center gap-6 text-gray-800 text-center p-8 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-lg mx-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold">Start Your Survey</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Explore and share your thoughts with us.
          </p>
          <p className="text-sm text-red-500 font-medium">
            *As per school regulations, students are required to complete this
            survey.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300"
            onClick={() => navigate("/student/survey-for-student")}
          >
            Start Now
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-4 text-center border border-gray-200"
        >
          <p className="text-gray-800 text-lg font-medium">
            You’ve already completed the survey! See you next time 🎉
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StartUpPage;
