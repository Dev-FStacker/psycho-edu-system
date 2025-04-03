const NotFoundPage = () => {
  return (
    <section className="flex items-center h-screen p-16 bg-[#C9EDE4]">
      <div className="container flex flex-col items-center ">
        <div className="flex flex-col gap-6 max-w-md text-center">
          <h2 className="font-extrabold text-9xl text-[#002B36]">
            <span className="sr-only">Error</span>404
          </h2>
          <p className="text-2xl md:text-3xl">
            Sorry, we couldn&apos;t find this page.
          </p>
          <a
            href="/"
            className="px-8 py-4 text-xl font-semibold rounded bg-[#33BB99] text-gray-50 hover:scale-110 transition-all duration-300"
          >
            Back to home
          </a>
        </div>
      </div>
    </section>
  );
};
export default NotFoundPage;
