import React, { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import BlogForm from "../../components/Blog/BlogForm";
import { showSuccess, showError, showConfirm } from "../../utils/swalConfig";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import ParticlesBackground from "../../components/ParticlesBackground";

const BlogManagementPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [dimensions] = useState(apiService.blog.getDimensions());
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    totalPages: 1,
  });
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    fetchBlogs(pagination.pageNumber, pagination.pageSize);
  }, [pagination.pageNumber, pagination.pageSize]);

  const fetchBlogs = async (pageNumber, pageSize) => {
    try {
      const response = await apiService.blog.fetchBlogs(pageNumber, pageSize);
      if (response.isSuccess) {
        setBlogs(response.result);
        setFilteredBlogs(response.result);
        setPagination((prev) => ({ ...prev, ...response.pagination }));
      } else {
        showError("Error", "Cannot load blog posts");
        setError("Cannot load blog posts");
      }
    } catch (err) {
      showError("Error", "An error occurred while loading blog posts");
      setError("An error occurred while loading blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = blogs;
    if (searchTerm) {
      filtered = filtered.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory) {
      filtered = filtered.filter((blog) => blog.category === filterCategory);
    }
    setFilteredBlogs(filtered);
  }, [searchTerm, filterCategory, blogs]);

  const handleDelete = async (id) => {
    showConfirm(
      "Are you sure?",
      "You will delete this blog post.",
      async () => {
        setBlogToDelete(id);
        try {
          const response = await apiService.blog.deleteBlog(id);
          if (response.isSuccess) {
            showSuccess("Deleted", "Blog post has been deleted successfully.");
            fetchBlogs(pagination.pageNumber, pagination.pageSize);
          }
        } catch (error) {
          showError("Error", error.message || "Failed to delete blog post");
        } finally {
          setBlogToDelete(null);
        }
      }
    );
  };

  const handleSave = (message) => {
    setIsFormOpen(false);
    setSelectedBlog(null);
    showSuccess("Success", message);
    fetchBlogs(pagination.pageNumber, pagination.pageSize);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, pageNumber: newPage }));
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="p-6 bg-gray-100 min-h-screen text-gray-900 relative overflow-hidden"
    >
      <ParticlesBackground />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h2 className="text-3xl font-bold text-gray-800">
            Blog Management
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setSelectedBlog(null);
              setIsFormOpen(true);
            }}
            className="flex items-center bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add New Post
          </motion.button>
        </div>

        <div className="mb-8 flex space-x-4">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            <option value="">All Categories</option>
            {dimensions.map((dim) => (
              <option key={dim.id} value={dim.name}>
                {dim.name}
              </option>
            ))}
          </select>
        </div>

        <motion.div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <motion.tr
                  key={blog.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {blog.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {blog.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {blog.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        setSelectedBlog(blog);
                        setIsFormOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(pagination.pageNumber - 1)}
            disabled={pagination.pageNumber === 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {pagination.pageNumber} of {pagination.totalPages} (
            {pagination.totalRecords} total)
          </span>
          <button
            onClick={() => handlePageChange(pagination.pageNumber + 1)}
            disabled={pagination.pageNumber === pagination.totalPages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300"
          >
            Next
          </button>
        </div>

        {isFormOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsFormOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
            >
              <BlogForm
                blog={selectedBlog}
                dimensions={dimensions}
                onSave={handleSave}
                onCancel={() => setIsFormOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BlogManagementPage;
