import api from "./api";

// Get all books with pagination
export const getBooks = async (paginationParams) => {
  try {
    const response = await api.get("/Book/PaginatedBooks", paginationParams);
    return response;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

// Get book by ID
export const getBookById = async (id) => {
  try {
    const response = await api.get(`/Book/GetBookById/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;
  }
};

// Search and filter books
export const searchBooks = async (filterParams) => {
  try {
    const response = await api.get("/Book/SearchFilterBooks", filterParams);
    return response;
  } catch (error) {
    console.error("Error searching books:", error);
    throw error;
  }
};

const BookService = {
  getBooks,
  getBookById,
  searchBooks,
};

export default BookService;
