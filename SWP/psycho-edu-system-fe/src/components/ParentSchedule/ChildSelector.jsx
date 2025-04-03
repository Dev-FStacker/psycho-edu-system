import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import { Card, CardContent, Typography, Box } from "@mui/material";

const ChildSelector = ({ onChildSelected }) => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy parentId từ token
  const authData = getAuthDataFromLocalStorage();
  const parentId = authData?.userId;

  useEffect(() => {
    if (!parentId) {
      setError("Parent ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching children for parentId:", parentId);

        const response = await axios.get(
          `https://localhost:7192/api/relationships/parent/${parentId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data.result || response.data;
        if (!Array.isArray(result)) {
          setError("Invalid API response: expected an array of relationships");
          setIsLoading(false);
          return;
        }

        const formattedChildren = result
          .filter((rel) => rel?.studentId)
          .map((rel) => ({
            id: rel.studentId,
            name:
              rel.relationshipName || `Student ${rel.studentId.slice(0, 8)}`,
            role: "Student",
          }));

        if (formattedChildren.length === 0) {
          setError("No children found for this parent.");
        } else {
          setChildren(formattedChildren);
        }
      } catch (error) {
        console.error("Fetch children error:", error.message);
        setError("Failed to fetch children. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, [parentId, authData?.accessToken]);

  const handleSelectChild = (childId) => {
    console.log("Child selected:", childId);
    onChildSelected(childId);
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ fontFamily: "Inter, sans-serif", color: "#666" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ fontFamily: "Inter, sans-serif", color: "#ef5350" }}>
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          color: "#333",
          mb: 2,
          textAlign: "center",
        }}
      >
        Select a Student
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {children.map((child, index) => (
          <Card
            key={child.id}
            component={motion.div}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              width: 200,
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
              "&:hover": {
                borderColor: "#26A69A",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
            onClick={() => handleSelectChild(child.id)}
          >
            <CardContent sx={{ p: 2, textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#333",
                }}
              >
                {child.name}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.85rem",
                  color: "#666",
                  mt: 0.5,
                }}
              >
                {child.role}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ChildSelector;
