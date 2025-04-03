import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProgressBar from "../../components/Survey/ProgressBar";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { SurveyService } from "../../api/services/surveyService";
import { TargetProgramService } from "../../api/services/targetProgram";

const SurveyPage = () => {
  const [questionsData, setQuestionsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [error, setError] = useState(null);
  const questionsPerPage = 5;
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    const storedQuestions = localStorage.getItem("questions");
    if (storedQuestions) {
      setQuestionsData(JSON.parse(storedQuestions));
    } else {
      setError("No survey data found. Please go back to the previous step.");
    }
  }, []);

  // Add useLayoutEffect to handle scrolling after page changes
  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  if (!questionsData && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <span className="text-xl font-medium text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <span className="text-xl font-medium text-red-600">{error}</span>
      </div>
    );
  }

  const totalPages = Math.ceil(
    questionsData.questions.length / questionsPerPage
  );

  const handleAnswerSelection = (questionId, answerPoint) => {
    setAnsweredQuestions((prev) => [
      ...prev.filter((item) => item.questionId !== questionId),
      { questionId, answerPoint },
    ]);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to submit the survey?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, submit!",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const scores = {
          "Lo Âu": 0,
          "Căng Thẳng": 0,
          "Trầm Cảm": 0,
          date: new Date().toISOString(),
        };

        answeredQuestions.forEach(({ questionId, answerPoint }) => {
          const question = questionsData.questions.find(
            (q) => q.questionId === questionId
          );
          if (question) {
            scores[question.categoryName] += answerPoint;
          }
        });

        localStorage.setItem("surveyScores", JSON.stringify(scores));

        const surveyId = questionsData.surveyId;
        const responses = answeredQuestions
          .map(({ questionId, answerPoint }) => {
            const question = questionsData.questions.find(
              (q) => q.questionId === questionId
            );
            if (!question) return null;

            const answer = question.answers.find(
              (a) => a.point === answerPoint
            );
            if (!answer) return null;

            return { questionId: questionId, answerId: answer.answerId };
          })
          .filter(Boolean);

        const surveyResult = { surveyId, responses };
        localStorage.setItem("surveyResponses", JSON.stringify(surveyResult));
        try {
          await SurveyService.submitSurvey(surveyResult);

          try {
            await TargetProgramService.assignStudentToTargetProgram(scores);
          } catch (error) {
            if (error.response) {
              if (
                error.response.status === 404 &&
                error.response.data.message === "No matching programs found"
              ) {
                console.warn("No matching programs found. Proceeding anyway.");
                Swal.fire(
                  "Survey submitted!",
                  "Your responses have been saved, but no matching programs were found.",
                  "info"
                );
              } else if (
                error.response.status === 400 &&
                error.response.data.includes("is full")
              ) {
                console.warn("Some programs are full. Proceeding anyway.");
                Swal.fire(
                  "Survey submitted!",
                  "Some programs are full, but your responses have been saved.",
                  "warning"
                );
              } else {
                throw error;
              }
            } else {
              throw error;
            }
          }

          Swal.fire(
            "Survey submitted!",
            "Your responses have been saved.",
            "success"
          ).then(() => {
            navigate("/survey-result", {
              state: { message: "Khảo sát đã được gửi thành công!" },
            });
            setAnsweredQuestions([]);
          });
        } catch (error) {
          console.error("Survey submission failed:", error);
          Swal.fire(
            "Error",
            error.message || "There was an issue submitting your survey.",
            "error"
          );
        }
      }
    });
  };

  const handleResetSurvey = () => {
    setCurrentPage(0);
    setAnsweredQuestions([]);
  };

  const progressPercentage = Math.round(
    (answeredQuestions.length / questionsData.questions.length) * 100
  );

  const startIndex = currentPage * questionsPerPage;
  const displayedQuestions = questionsData.questions.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
      >
        Back
      </button>

      <motion.div
        ref={contentRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto px-6 py-8 bg-white rounded-lg shadow-lg mt-16"
      >
        <div className="sticky top-0 left-0 right-0 bg-white shadow-md py-3 z-50">
          <ProgressBar progressPercentage={progressPercentage} />
        </div>

        {displayedQuestions.map((question) => (
          <motion.div
            key={question.questionId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="border rounded-md p-4 w-full mx-auto max-w-2xl mt-4"
          >
            <h4 className="text-xl lg:text-2xl font-semibold mb-4">
              {question.content}
            </h4>
            <div>
              {question.answers.map((answer) => (
                <label
                  key={answer.answerId}
                  className="flex items-center bg-gray-100 text-gray-700 rounded-md px-3 py-2 my-3 hover:bg-gray-300 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${question.questionId}`}
                    value={answer.point}
                    checked={
                      answeredQuestions.find(
                        (item) => item.questionId === question.questionId
                      )?.answerPoint === answer.point
                    }
                    onChange={() =>
                      handleAnswerSelection(question.questionId, answer.point)
                    }
                    className="mr-3"
                  />
                  <i className="pl-2">{answer.content}</i>
                </label>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-all duration-300"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all duration-300"
          >
            Next
          </button>
        </div>

        {/* Survey Actions */}
        <div className="mt-6 text-center">
          {answeredQuestions.length === questionsData.questions.length && (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300"
            >
              Submit
            </button>
          )}
          <div className="mt-4">
            <button
              onClick={handleResetSurvey}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300"
            >
              Reset Survey
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SurveyPage;
