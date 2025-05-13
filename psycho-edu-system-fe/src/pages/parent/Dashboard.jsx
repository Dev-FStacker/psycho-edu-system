import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { UserService } from "../../api/services/userService";
import { SurveyService } from "../../api/services/surveyService";
import {
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenData = await UserService.getChildren();
        const childrenWithProfiles = await Promise.all(
          childrenData.map(async (child) => {
            try {
              const profileResponse = await fetch(
                `https://localhost:7192/api/User/profile?userId=${child.studentId}`
              );
              if (!profileResponse.ok) {
                throw new Error("Failed to fetch profile");
              }
              const profileData = await profileResponse.json();
              return { ...child, profile: profileData.result };
            } catch (error) {
              console.error("Error fetching child profile:", error);
              return { ...child, profile: null };
            }
          })
        );
        setChildren(childrenWithProfiles);
      } catch (error) {
        console.error(error);
        toast.error("Error loading child list!");
      }
    };
    fetchChildren();
  }, []);

  const handleHelpClick = () => {
    toast.success("Contact support via email or hotline: 1900 123 456", {
      position: "top-right",
      duration: 4000,
    });
  };

  const handleTakeSurvey = async (studentId) => {
    setLoading(true);
    try {
      const surveyStatus = await SurveyService.checkUserSurveyStatus(studentId);
      if (surveyStatus.canTakeSurvey) {
        if (surveyStatus.surveys.length > 0) {
          const surveyData = await SurveyService.getSurveyContent(
            surveyStatus.surveys[0].surveyId
          );
          localStorage.setItem("questions", JSON.stringify(surveyData));
        }
        navigate(`/survey/${studentId}`);
      } else {
        toast.info("No available surveys!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error checking survey status!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSurveyResults = (studentId) => {
    navigate(`/overall-survey-result/${studentId}`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-10 bg-gray-50">
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h4" gutterBottom>
          Select a child for the survey
        </Typography>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2 }}
      >
        {children.map((child) => (
          <motion.div
            key={child.studentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <CardContent className="flex flex-col items-center text-center">
                <img
                  src={
                    child.image ||
                    `https://i.pravatar.cc/150?img=${
                      Math.floor(Math.random() * 70) + 1
                    }`
                  }
                  alt={child.profile?.fullName || "Unknown"}
                  className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md mb-3"
                />
                <CardContent>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                  >
                    {child.profile?.fullName || "No Name"}
                  </Typography>

                  <Typography fontWeight="bold" color="primary" gutterBottom>
                    📧 {child.profile?.email || "N/A"}
                  </Typography>

                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="body1" color="textSecondary">
                        📞 {child.profile?.phone || "N/A"}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        🎂 {child.profile?.birthDay || "N/A"}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        🚻 {child.profile?.gender || "N/A"}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        🏠 {child.profile?.address || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>

                <div className="mt-3 flex space-x-3">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleTakeSurvey(child.studentId)}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : "Take Survey"}
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleViewSurveyResults(child.studentId)}
                  >
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-10 flex space-x-4">
        <Button variant="outlined" onClick={() => navigate("/")}>
          Back to Home
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleHelpClick}>
          Help
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
