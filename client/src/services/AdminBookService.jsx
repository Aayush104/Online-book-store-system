import api from "./api";

// Add new book
export const addNewBook = async (bookData) => {
  try {
    console.log("Data received in service:", bookData);

    // No transformation, just pass directly to api
    const response = await api.postWithFile("/AdminBook/AddBook", bookData);
    return response;
  } catch (error) {
    console.error("Error adding new book:", error);
    throw error;
  }
};

// Update existing book
export const updateExistingBook = async (id, bookData) => {
  try {
    console.log("ID", id);
    console.log("Data received in update service:", bookData);

    // No transformation, just pass directly to api
    const response = await api.putWithFile(
      `/AdminBook/UpdateBook/${id}`,
      bookData
    );
    return response;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

// Delete book
export const deleteBook = async (id) => {
  try {
    const response = await api.delete(`/AdminBook/DeleteBook/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};

// Get all books (with pagination)
export const getAllBooks = async (paginationParams) => {
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
    console.error("Error fetching book:", error);
    throw error;
  }
};

// Search and filter books
export const searchFilterBooks = async (filterParams) => {
  try {
    const response = await api.get("/Book/SearchFilterBooks", filterParams);
    return response;
  } catch (error) {
    console.error("Error searching/filtering books:", error);
    throw error;
  }
};

const AdminBookService = {
  addNewBook,
  updateExistingBook,
  deleteBook,
  getAllBooks,
  getBookById,
  searchFilterBooks,
};

export default AdminBookService;
