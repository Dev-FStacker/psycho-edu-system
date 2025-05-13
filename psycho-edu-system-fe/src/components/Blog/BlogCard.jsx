import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

const BlogCard = ({ blog }) => {
  const { id, title, content, category, createdAt } = blog;

  // Giới hạn nội dung preview
  const previewContent =
    content.length > 150 ? content.substring(0, 150) + "..." : content;
  const tags = generateTags(content, 3);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[400px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Phần tiêu đề và meta */}
      <div className="mb-3">
        <h3 className="text-2xl font-bold text-gray-900 mb-10 line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
            {category}
          </span>
          <span className="text-sm text-gray-500">{createdAt}</span>
        </div>
      </div>

      {/* Nội dung preview */}
      <p className="text-gray-700 mb-4 leading-relaxed line-clamp-4 flex-1">
        {previewContent}
      </p>

      {/* Phần tag */}
      <div className="flex flex-wrap gap-2 mb-4 h-5">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Nút View Details */}
      <Link
        to={`/blog/${id}`}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition self-center no-underline justify-center"
      >
        View Details
      </Link>
    </motion.div>
  );
};

export default BlogCard;
