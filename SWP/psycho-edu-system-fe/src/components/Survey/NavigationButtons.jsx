/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
const NavigationButtons = ({
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  handlePreviousQuestion,
  handleNextQuestion,
}) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={handlePreviousQuestion}
        disabled={currentQuestionIndex === 0}
        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-all duration-300"
      >
        Previous
      </button>
      <button
        onClick={handleNextQuestion}
        disabled={!isAnswered}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-300"
      >
        Next
      </button>
    </div>
  );
};

export default NavigationButtons;
