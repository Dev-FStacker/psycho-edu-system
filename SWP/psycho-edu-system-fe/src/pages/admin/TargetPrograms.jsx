/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { TargetProgramService } from "../../api/services/targetProgram";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AuthContext from "../../context/auth/AuthContext";
import ProgramDialog from "./ProgramDialog";
import ProgramTable from "./ProgramTable";
import FilterForms from "./FiltersForm";
import CreateProgramDialog from "./CreateProgramDialog";
import { toast } from "react-toastify";

const TargetPrograms = () => {
  const { user } = useContext(AuthContext) || {};
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [filters, setFilters] = useState({
    day: null,
    capacity: "",
    time: null,
    minPoint: "",
    dimensionName: "",
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const formattedFilters = {
        ...filters,
        day: filters.day ? filters.day.format("YYYY-MM-DD") : "",
        time: filters.time ? filters.time.format("HH:mm") : "",
      };

      let data;
      if (user?.role === "Admin") {
        data = await TargetProgramService.getTargetPrograms(formattedFilters);
      } else {
        data = await TargetProgramService.getTargetProgramsByUserId(
          formattedFilters
        );
      }

      setPrograms(data);
      setError(null);
    } catch (err) {
      setError("Unable to load program list. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [filters]);

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const onUpdateProgram = async (updatedProgram) => {
    const updatedProgramPayload = {
      programId: updatedProgram.programId,
      name: updatedProgram.name,
      description: updatedProgram.description,
      minPoint: updatedProgram.minPoint,
      capacity: updatedProgram.capacity,
      dimensionId:
        updatedProgram.dimensionName === "Lo Âu"
          ? 1
          : updatedProgram.dimensionName === "Trầm Cảm"
          ? 2
          : updatedProgram.dimensionName === "Căng Thẳng"
          ? 3
          : updatedProgram.dimensionId,
    };
    try {
      const response = await fetch(
        "https://localhost:7192/api/TargetProgram/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProgramPayload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Error || "Failed to update the program.");
      }
      toast.success("Program updated successfully");
      loadPrograms();
    } catch (error) {
      toast.error("Error updating program: " + error.message);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Student Psychological Support Programs
        </h1>
        <div className="max-w-6xl mx-auto">
          {user?.role === "Admin" && (
            <div className="flex justify-start mb-4">
              <button
                onClick={() => setOpenCreateDialog(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Create
              </button>
            </div>
          )}
          <FilterForms
            tempFilters={tempFilters}
            setTempFilters={setTempFilters}
            applyFilters={applyFilters}
          />
          {loading ? (
            <div className="text-center mt-8">
              <svg
                className="animate-spin h-12 w-12 text-blue-500 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center mt-8">{error}</p>
          ) : (
            <ProgramTable
              programs={programs}
              loading={loading}
              role={user?.role}
              error={error}
              onUpdateProgram={onUpdateProgram}
              onSelectProgram={setSelectedProgram}
            />
          )}
          <ProgramDialog
            selectedProgram={selectedProgram}
            onClose={() => setSelectedProgram(null)}
          />
          <CreateProgramDialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            reloadPrograms={loadPrograms}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default TargetPrograms;
