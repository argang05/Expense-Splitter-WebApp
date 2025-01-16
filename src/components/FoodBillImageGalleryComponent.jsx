/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import ComponentLoader from "./ComponentLoader";

const FoodBillImageGalleryComponent = ({ tripId }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchImageUrls = async () => {
      setLoading(true);
      if (!tripId) return; // Ensure tripId is valid before making the request
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/bills/food-bill-image-url/${tripId}`
        );
        if (response.status === 200) {
          setImageUrls(response?.data);
        }
      } catch (err) {
        console.error(
          "Bill Images Fetch Failed:",
          err.response ? err.response.data : err.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchImageUrls();
  }, [tripId]);

  const totalPages = Math.ceil(imageUrls.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Slice the images for the current page
  const paginatedImages = imageUrls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
        <>
      {loading ? (
        <ComponentLoader />
      ) : (
        <div className="container bxs border-[3px] border-[#03abff] bg-[#000249] sm:justify-normal w-full p-4 sm:px-6 sm:py-4 flex flex-col items-center gap-6 rounded-lg">
          <div className="w-full flex flex-wrap gap-4 sm:gap-6">
              {paginatedImages.length > 0 ?
                ( <>
                      {paginatedImages.map((imageUrl, indx) => (
                      
                      <a
                        className="h-60 w-[46.5%] sm:w-[23%] transition-transform duration-500 transform hover:scale-105"
                        key={indx}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          className="h-full w-full border-[3px] border-[#03abff] rounded-lg"
                          src={imageUrl}
                          alt="non-food-bill"
                        />
                      </a>
                      ))}
                      <div className="w-full flex justify-between mt-4">
                          <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === 1
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#03abff] hover:bg-blue-500"
                            } text-white`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === totalPages
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#03abff] hover:bg-blue-500"
                            } text-white`}
                          >
                            Next
                          </button>
                  </div>
                  </>
            ) : (
              <h2 className="text-sm sm:text-lg font-bold text-white">
                No Bill Image
              </h2>
            )}
          </div>

          
        </div>
      )}
    </>
  );
};

export default FoodBillImageGalleryComponent;
