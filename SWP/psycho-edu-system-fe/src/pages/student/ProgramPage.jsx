import React, { useState, useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
// Import các icon từ thư viện lucide-react
import {
  BookOpen,
  PlayCircle,
  Users,
  Airplay,
  AlignCenter,
  LucideShoppingBasket,
} from "lucide-react";

// Import data và components
import {
  courseCatalogData,
  courseListData,
  courseTopicsData,
} from "../../data/courseData";
import CourseCatalog from "../../components/CoursePageComponents/CourseCatalog";
import CourseList from "../../components/CoursePageComponents/CoursesList";

/**
 * Component hiển thị chi tiết khóa học
 * Được render khi URL match với /course/:courseId
 */
const CourseDetailView = () => {
  // Lấy courseId từ URL parameters
  const { courseId } = useParams();
  // State lưu trữ topic được chọn
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row mx-auto">
      {/* Sidebar bên trái hiển thị danh sách topics của khóa học */}
      <CourseContent
        selectedTopic={selectedTopic}
        onTopicSelect={setSelectedTopic}
        // Lấy topics từ data dựa vào courseId, nếu không có trả về mảng rỗng
        topics={courseTopicsData[courseId]?.topics || []}
      />
      {/* Phần content bên phải hiển thị nội dung chi tiết của topic */}
      <CourseDetail courseId={courseId} selectedTopic={selectedTopic} />
    </div>
  );
};

/**
 * Component chính của trang Program
 * Quản lý state và điều hướng giữa danh sách khóa học và chi tiết khóa học
 */
const ProgramPage = () => {
  // Các state quản lý filter và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  // State quản lý trạng thái thu gọn của sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * Effect xử lý responsive cho sidebar
   * Auto collapse khi màn hình < 1024px
   * Auto expand khi màn hình > 1920px
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth > 1920) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Filter courses dựa trên các điều kiện:
   * - Search term
   * - Selected category
   * - Selected counselor
   * - Selected type
   */
  const filteredCourses = courseListData.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;
    const matchesCounselor =
      selectedCounselor === "All" || course.counselor === selectedCounselor;
    const matchesType = selectedType === "All" || course.type === selectedType;
    return matchesSearch && matchesCategory && matchesCounselor && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Main content area */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isCollapsed ? "ml-[0px]" : "ml-[0px]"
          }`}
        >
          {/* Routes configuration */}
          <Routes>
            {/* Route cho trang danh sách khóa học */}
            <Route
              path="/"
              element={
                <div className="flex flex-col lg:flex-row mx-auto">
                  {/* Component hiển thị danh mục khóa học */}
                  <CourseCatalog
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    categories={courseCatalogData}
                  />
                  {/* Component hiển thị danh sách khóa học */}
                  <CourseList
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    courses={filteredCourses}
                    selectedCounselor={selectedCounselor}
                    selectedType={selectedType}
                    onCounselorChange={(e) =>
                      setSelectedCounselor(e.target.value)
                    }
                    onTypeChange={(e) => setSelectedType(e.target.value)}
                  />
                </div>
              }
            />
            {/* Route cho trang chi tiết khóa học */}
            <Route path="/course/:courseId" element={<CourseDetailView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ProgramPage;
