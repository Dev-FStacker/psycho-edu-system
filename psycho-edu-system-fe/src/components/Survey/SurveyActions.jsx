/* eslint-disable react/prop-types */
const SurveyActions = ({
  answeredQuestions,
  totalQuestions,
  handleSubmit,
  handleResetSurvey,
}) => {
  return (
    <div className="mt-6 text-center">
      {answeredQuestions.length === totalQuestions && (
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300"
        >
          Submit
        </button>
      )}
      <div className="mt-4">
        <button
          onClick={handleResetSurvey}
          className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300"
        >
          Reset Survey
        </button>
      </div>
    </div>
  );
};

export default SurveyActions;
