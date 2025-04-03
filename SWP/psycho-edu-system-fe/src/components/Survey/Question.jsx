/* eslint-disable react/prop-types */
const Question = ({ question, currentAnswer, handleAnswerSelection }) => {
  return (
    <div className="border rounded-md p-4 w-full mx-auto max-w-2xl">
      <h4 className="text-xl lg:text-2xl font-semibold mb-4">
        {question.content}
      </h4>
      <div>
        {question.answers.map((answer) => (
          <label
            key={answer.answerId}
            className="flex items-center bg-gray-100 text-gray-700 rounded-md px-3 py-2 my-3 hover:bg-indigo-300 cursor-pointer"
          >
            <input
              type="radio"
              name={`question-${question.questionId}`}
              value={answer.point}
              checked={currentAnswer?.point === answer.point}
              onChange={() =>
                handleAnswerSelection(question.questionId, answer.point)
              }
              className="mr-3"
            />
            <i className="pl-2">{answer.content}</i>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Question;
