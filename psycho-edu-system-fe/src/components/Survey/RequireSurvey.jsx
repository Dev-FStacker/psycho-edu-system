/* eslint-disable-next-line no-unused-vars */
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { SurveyService } from "../../api/services/surveyService";
import Loading from "../../components/Loadings/Loading";

const RequireSurvey = () => {
  const [loading, setLoading] = useState(true);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState(null);

  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        const response = await SurveyService.checkUserSurveyStatus("");
        if (response?.surveys) {
          setHasCompletedSurvey(false);
          if (Array.isArray(response.surveys) && response.surveys.length > 0) {
            setSurveyData(response.surveys[0].surveyId);
          }
        } else {
          setHasCompletedSurvey(true);
          setSurveyData(null);
        }
      } catch (error) {
        console.error("Error checking survey status:", error);
        setHasCompletedSurvey(true);
        setSurveyData(null);
      } finally {
        setLoading(false);
      }
    };

    checkSurveyStatus();
  }, []);

  if (loading) return <Loading />;

  if (!hasCompletedSurvey) {
    return (
      <Navigate to="/student/start-up-survey" state={{ surveyData }} replace />
    );
  }

  return <Outlet context={{ surveyData: surveyData ?? null }} />;
};

export default RequireSurvey;
