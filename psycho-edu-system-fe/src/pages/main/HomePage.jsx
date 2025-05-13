import { motion } from "framer-motion";
import Banner from "../../components/Banners/Banner";
import BlogSection from "../../components/Blog/BlogSection";
import { Box, Typography, Container, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faHeart,
  faUsers,
  faRunning,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

const globalStyles = `
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;

const HomePage = () => {
  // Thêm global styles khi component mount
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ backgroundColor: "#F7FAFC", margin: 0, padding: 0 }}
    >
      {/* Banner */}
      <Banner />

      {/* Additional Content Section */}
      <Box sx={{ paddingY: "50px" }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{
                marginBottom: "20px",
                fontWeight: 700,
                color: "#26A69A", // Teal
                fontSize: { xs: "2rem", md: "2.5rem" },
                textShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)", // Thêm shadow cho tiêu đề
              }}
            >
              Start Your Learning Journey with FPTU
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                marginBottom: "40px",
                color: "#374151", // Dark Gray
                fontSize: "1.1rem",
                lineHeight: "1.8",
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              At FPT University, we equip students with the skills, knowledge,
              and global mindset to succeed in an ever-changing world. Take the
              next step towards your future and unlock opportunities to thrive
              in the modern world.
            </Typography>
            <Box sx={{ textAlign: "center" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#26A69A", // Teal
                    color: "#FFFFFF",
                    padding: "12px 40px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: "25px",
                    boxShadow: "0px 4px 12px rgba(38, 166, 154, 0.3)", // Shadow Teal
                    "&:hover": {
                      backgroundColor: "#4DB6AC", // Teal nhạt hơn
                      boxShadow: "0px 6px 16px rgba(38, 166, 154, 0.5)", // Shadow đậm hơn
                      border: "1px solid #FF6F61", // Viền Coral khi hover
                    },
                    textTransform: "none",
                  }}
                >
                  Explore Programs
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          paddingY: "50px",
          backgroundColor: "#26A69A", // Teal
          margin: 0,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Shadow cho section
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{
                marginBottom: "60px",
                fontWeight: 700,
                color: "#FFFFFF",
                fontSize: { xs: "2rem", md: "2.5rem" },
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)", // Shadow cho tiêu đề
              }}
            >
              Why Choose FPTU?
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: "1fr 1fr 1fr 1fr",
                },
                gap: "30px",
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "30px",
                  textAlign: "center",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease", // Transition mượt mà
                  border: "1px solid transparent",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon
                  icon={faBrain}
                  style={{
                    fontSize: "48px",
                    color: "#FBBF24", // Gold
                    marginBottom: "20px",
                    filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))", // Shadow cho icon
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  Cognitive Growth
                </Typography>
                <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
                  Develop critical thinking and problem-solving skills for a
                  successful career.
                </Typography>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "30px",
                  textAlign: "center",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  border: "1px solid transparent",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  style={{
                    fontSize: "48px",
                    color: "#FF6F61", // Coral để làm nổi bật
                    marginBottom: "20px",
                    filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  Emotional Support
                </Typography>
                <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
                  Access resources to manage stress and build emotional
                  resilience.
                </Typography>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "30px",
                  textAlign: "center",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  border: "1px solid transparent",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon
                  icon={faUsers}
                  style={{
                    fontSize: "48px",
                    color: "#FBBF24", // Gold
                    marginBottom: "20px",
                    filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  Community Engagement
                </Typography>
                <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
                  Join a vibrant community to connect, collaborate, and grow
                  together.
                </Typography>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "30px",
                  textAlign: "center",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  border: "1px solid transparent",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon
                  icon={faRunning}
                  style={{
                    fontSize: "48px",
                    color: "#FF6F61", // Coral để làm nổi bật
                    marginBottom: "20px",
                    filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  Holistic Development
                </Typography>
                <Typography variant="body2" sx={{ color: "#D1D5DB" }}>
                  Balance academics with extracurriculars for all-around growth.
                </Typography>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Blog Section */}
      <Box sx={{ paddingY: "0px", backgroundColor: "#F7FAFC", margin: 0 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Box id="blog-section">
              <BlogSection />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box
        sx={{
          backgroundColor: "#26A69A",
          color: "#FFFFFF",
          paddingY: "20px",
          marginTop: "20px",
          margin: 0,
          boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.1)", // Shadow cho footer
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography
              variant="body1"
              sx={{ marginBottom: { xs: "20px", md: 0 }, fontSize: "0.9rem" }}
            >
              © 2025 FPTU Education System. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: "20px" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#FBBF24",
                  cursor: "pointer",
                  "&:hover": { color: "#FFD700", transition: "color 0.3s" },
                }}
              >
                Privacy Policy
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#FBBF24",
                  cursor: "pointer",
                  "&:hover": { color: "#FFD700", transition: "color 0.3s" },
                }}
              >
                Terms of Service
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#FBBF24",
                  cursor: "pointer",
                  "&:hover": { color: "#FFD700", transition: "color 0.3s" },
                }}
              >
                Contact Us
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
};

export default HomePage;
