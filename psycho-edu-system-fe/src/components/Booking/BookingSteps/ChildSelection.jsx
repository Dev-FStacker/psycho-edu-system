import { useState, useEffect } from "react";
import { useBooking } from "../../../context/BookingContext";
import { getAuthDataFromLocalStorage } from "../../../utils/auth";
import { motion } from "framer-motion";
import axios from "axios";
import { Card, CardContent, Typography, Box } from "@mui/material";
import Swal from "sweetalert2";

const swalWithConfig = Swal.mixin({
  confirmButtonColor: "#26A69A",
  cancelButtonColor: "#FF6F61",
  timer: 1500,
  showConfirmButton: false,
  position: "center",
  didOpen: (popup) => {
    popup.style.zIndex = 9999;
  },
});

export const ChildSelection = () => {
  const { updateBookingData, bookingData, isParent } = useBooking();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const authData = getAuthDataFromLocalStorage();
  const parentId = authData?.userId;

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        if (!isParent() || !parentId) {
          setError(
            "Only parents can select a child, and parent ID is required."
          );
          swalWithConfig.fire({
            title: "Access Denied",
            text: "Only parents can select a child.",
            icon: "error",
          });
          setIsLoading(false);
          return;
        }

        const relationshipResponse = await axios.get(
          `https://localhost:7192/api/relationships/parent/${parentId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const relationships =
          relationshipResponse.data.result || relationshipResponse.data;
        if (!Array.isArray(relationships) || relationships.length === 0) {
          setError("There are no students associated with this account.");
          setIsLoading(false);
          return;
        }

        const uniqueStudents = {};
        const formattedChildrenPromises = relationships
          .filter((rel) => rel && rel.studentId)
          .map(async (relationship) => {
            const studentId = relationship.studentId;
            if (!uniqueStudents[studentId]) {
              uniqueStudents[studentId] = true;

              const profileResponse = await axios.get(
                `https://localhost:7192/api/User/profile?userId=${studentId}`,
                {
                  headers: {
                    Authorization: `Bearer ${authData.accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (
                profileResponse.data.isSuccess &&
                profileResponse.data.statusCode === 200
              ) {
                const profile = profileResponse.data.result;
                return {
                  id: studentId,
                  fullName:
                    profile.fullName || `Student ${studentId.slice(0, 8)}`,
                  relationshipName: relationship.relationshipName || "Child",
                };
              }
              return null;
            }
            return null;
          });

        const formattedChildren = (
          await Promise.all(formattedChildrenPromises)
        ).filter(Boolean);
        setChildren(formattedChildren);
      } catch (error) {
        if (error.response?.status === 404) {
          setError("There are no students associated with this account.");
        } else {
          setError(error.message || "Failed to fetch children");
          swalWithConfig.fire({
            title: "Error",
            text: "Failed to fetch children. Please try again.",
            icon: "error",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isParent()) fetchChildren();
    else {
      setIsLoading(false);
      setError("Only parents can select a child");
    }
  }, [isParent, parentId, authData.accessToken]);

  const handleSelectChild = (child) => {
    updateBookingData({
      childId: child.id,
      childName: child.fullName,
      relationshipName: child.relationshipName,
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ fontFamily: "Inter, sans-serif", color: "#666" }}>
          Loading children...
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
        Select Student
      </Typography>
      {error ? (
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          {error}
        </Typography>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {children.map((child, index) => (
            <Card
              key={child.id}
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              sx={{
                width: 200,
                borderRadius: "8px",
                border:
                  bookingData.childId === child.id
                    ? "2px solid #26A69A"
                    : "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#26A69A",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => handleSelectChild(child)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "#26A69A",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        color: "white",
                        fontWeight: 500,
                      }}
                    >
                      {child.fullName ? child.fullName.charAt(0) : "S"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "#333",
                      }}
                    >
                      {child.fullName}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      {child.relationshipName}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </Box>
  );
};
