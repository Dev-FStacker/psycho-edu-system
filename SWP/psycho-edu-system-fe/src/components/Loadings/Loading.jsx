const Loading = () => {
  return (
    <div
      aria-label="Loading..."
      role="status"
      className="h-screen w-full flex justify-center items-center"
    >
      <span className="text-xl sm:text-xl md:text-xl font-medium text-gray-500 animate-bounce">
        Loading...
      </span>
    </div>
  );
};

export default Loading;
