/* eslint-disable react/prop-types */
const ProgressBar = ({ progressPercentage }) => {
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div className="text-xs font-semibold inline-block py-1 uppercase">
          Progress: {progressPercentage}%
        </div>
      </div>
      <div className="flex mb-4">
        <div className="flex w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
