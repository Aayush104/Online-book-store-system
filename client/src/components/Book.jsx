import React from "react";
import { Star } from "lucide-react";

const BookComponent = () => {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden max-w-md">
      {/* Book header with image and details */}
      <div className="flex">
        {/* Book cover image */}
        <div className="w-1/3">
          <img
            src="/api/placeholder/200/300"
            alt="Book cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Book details */}
        <div className="w-2/3 p-4 flex flex-col justify-between">
          {/* Title and rating */}
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-gray-800">Thunder Stunt</h2>
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < 4
                          ? "text-orange-500 fill-orange-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="ml-1 text-sm font-semibold">4.0</span>
                <span className="ml-1 text-xs text-gray-500">(22 Reviews)</span>
              </div>
            </div>

            {/* Book description */}
            <p className="text-xs text-gray-600 mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              Adventure
            </span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              Action
            </span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              Fantasy
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mx-4"></div>

      {/* Footer section */}
      <div className="p-4">
        {/* Author, publisher, year */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div>
            <p className="text-xs text-gray-500">Written by</p>
            <p className="text-sm font-medium">Kevin Smiley</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Publisher</p>
            <p className="text-sm font-medium">Printarus Studios</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Year</p>
            <p className="text-sm font-medium">2019</p>
          </div>
        </div>

        {/* Price and actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">$ 84.78</span>
              <span className="text-sm text-gray-500 line-through">$95.00</span>
            </div>
            <span className="text-xs text-red-500">10% Off (Discount)</span>
          </div>

          <div className="flex gap-2">
            <button className="bg-purple-600 text-white py-2 px-4 rounded-md text-sm flex items-center gap-1">
              Add to cart
            </button>
            <button className="border border-gray-300 p-2 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookComponent;
