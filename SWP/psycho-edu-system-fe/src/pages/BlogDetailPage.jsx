import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiService from "../services/apiService";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faShareAlt,
  faClock,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { showSuccess, showError } from "../utils/swalConfig";

const generateTags = (content, maxTags) => {
  const stopWords = [
    "the",
    "and",
    "is",
    "in",
    "to",
    "of",
    "for",
    "with",
    "on",
    "at",
    "this",
    "that",
    "was",
    "are",
    "it",
    "my",
    "i",
  ];
  const priorityKeywords = [
    "anxiety",
    "stress",
    "depression",
    "mental",
    "health",
    "calm",
    "life",
    "work",
    "sleep",
    "fear",
  ];

  const wordFreq = content
    .toLowerCase()
    .split(/\s+/)
    .reduce((acc, word) => {
      word = word.replace(/[.,!?]/g, "");
      if (word.length > 3 && !stopWords.includes(word)) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {});

  const freqArray = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
  const priorityTags = priorityKeywords
    .filter((keyword) => content.toLowerCase().includes(keyword))
    .map((keyword) => `#${keyword}`);
  const freqTags = freqArray
    .filter(([word]) => !priorityKeywords.includes(word))
    .map(([word]) => `#${word}`)
    .slice(0, maxTags - priorityTags.length);

  return [...priorityTags, ...freqTags].slice(0, maxTags);
};

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await apiService.blog.fetchBlogById(id);
        if (response.isSuccess) {
          setBlog(response.result);
          fetchRelatedBlogs(response.result.dimensionId);
        } else {
          setError("This blog post is not available right now.");
        }
      } catch (err) {
        setError("Something went wrong, please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const fetchRelatedBlogs = async (dimensionId) => {
    try {
      const response = await apiService.blog.fetchBlogs(1, 4);
      if (response.isSuccess) {
        const filteredBlogs = response.result
          .filter((b) => b.dimensionId === dimensionId && b.id !== Number(id))
          .slice(0, 3);
        setRelatedBlogs(filteredBlogs);
      }
    } catch (err) {
      console.error("Error fetching related blogs:", err);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: blog.title,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(shareData.url);
      showSuccess("Copied!", "Link copied to clipboard.");
    }
  };

  if (loading)
    return <p className="text-center text-[#666] py-12">Loading...</p>;
  if (error) return <p className="text-center text-[#FF6F61] py-12">{error}</p>;
  if (!blog)
    return <p className="text-center text-[#666] py-12">Blog post not found</p>;

  const wordCount = blog.content.split(" ").length;
  const readingTime = Math.ceil(wordCount / 200);
  const tags = generateTags(blog.content, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#F7FAFC] text-[#374151]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <nav className="flex items-center space-x-2 text-sm font-medium">
            <Link
              to="/"
              className="text-[#26A69A] hover:text-[#4DB6AC] transition-colors duration-300 no-underline"
            >
              Home
            </Link>
            <span className="text-[#666]">/</span>
            <span className="text-[#374151] truncate max-w-xs">
              {blog.title}
            </span>
          </nav>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-block bg-[#26A69A] text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {blog.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26A69A] leading-tight mb-4">
            {blog.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-[#666]">
            <span>{blog.createdAt}</span>
            <span className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {readingTime} min read
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white rounded-lg shadow-md p-8 border border-[#E5E7EB]"
        >
          <div className="prose prose-lg max-w-none text-[#374151] leading-relaxed">
            {blog.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          <FontAwesomeIcon icon={faTag} className="text-[#26A69A] mr-2" />
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-sm text-[#374151] bg-[#E5E7EB] px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 flex justify-between items-center"
        >
          <Link
            to="/"
            className="flex items-center text-[#FBBF24] hover:text-[#FFD700] font-semibold transition-colors duration-300 no-underline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center text-[#26A69A] hover:text-[#FF6F61] font-semibold transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faShareAlt} className="w-5 h-5 mr-2" />
              Share
            </button>
          </div>
        </motion.div>

        {relatedBlogs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-[#26A69A] mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog.id}
                  to={`/blog/${relatedBlog.id}`}
                  className="bg-white rounded-lg shadow-md p-4 border border-[#E5E7EB] hover:shadow-lg transition-shadow duration-300 no-underline"
                >
                  <h3 className="text-lg font-semibold text-[#374151] mb-2">
                    {relatedBlog.title}
                  </h3>
                  <p className="text-sm text-[#666] mb-2">
                    {relatedBlog.excerpt}
                  </p>
                  <span className="text-xs text-[#26A69A]">
                    {relatedBlog.category}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : (
          <p className="mt-12 text-center text-[#666]">
            No related articles found.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default BlogDetailPage;
