import React from "react";
import Image from "next/image";

const Newsletter = () => {
  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl feedback-banner-bg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                Give us your feedback
              </h2>
              <p className="text-white">Give us your feedback</p>
            </div>

            <div className="max-w-[477px] w-full">
              <form>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    name="feedback"
                    id="feedback"
                    placeholder="Write your feedback"
                    className="w-full bg-white/90 border border-blue-light-4 outline-none rounded-md placeholder:text-dark-4 py-3 px-5"
                  />
                  <button
                    type="button"
                    className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
