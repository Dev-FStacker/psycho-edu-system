import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiService from "../services/apiService";
import { getAuthDataFromLocalStorage } from "../utils/auth";

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = getAuthDataFromLocalStorage();
    if (
      !authData ||
      !authData.accessToken ||
      !authData.userId ||
      !authData.role
    ) {
      toast.error("Authentication data is missing or invalid. Please log in.");
      setLoading(false);
      return;
    }

    setRole(authData.role);
    fetchProfile(authData.userId);
  }, []);

  const fetchProfile = async (id) => {
    setLoading(true);
    try {
      const userProfile = await apiService.fetchUserProfile(id);
      setProfile(userProfile);
      setFormData(userProfile);
    } catch (error) {
      toast.error(error.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDay) => {
    if (!birthDay) return "N/A";
    const [day, month, year] = birthDay.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getSchool = (address) => {
    if (!address) return "FPT University";
    const addrLower = address.toLowerCase();
    if (addrLower.includes("ha noi") || addrLower.includes("hà nội"))
      return "FPT HN University";
    if (addrLower.includes("da nang") || addrLower.includes("đà nẵng"))
      return "FPT DN University";
    if (
      addrLower.includes("ho chi minh") ||
      addrLower.includes("hcm") ||
      addrLower.includes("hồ chí minh")
    )
      return "FPT HCM University";
    if (addrLower.includes("can tho") || addrLower.includes("cần thơ"))
      return "FPT CT University";
    return "FPT University";
  };

  const calculateCourse = (birthDay) => {
    if (!birthDay) return "N/A";
    const [_, __, year] = birthDay.split("/").map(Number);
    const entryYear = year + 17;
    const courseNumber = 21 - (entryYear - 2025);
    if (courseNumber < 1) return "K1";
    if (courseNumber > 21) return "K21";
    return `K${courseNumber}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const authData = getAuthDataFromLocalStorage();
    if (!authData) {
      toast.error("Authentication data not found");
      return;
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    let formattedBirthDay = null;
    if (formData.birthDay) {
      const [day, month, year] = formData.birthDay.split("/");
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.birthDay)) {
        toast.error("Please enter birth date in DD/MM/YYYY format");
        return;
      }
      formattedBirthDay = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}T00:00:00.000Z`;
    }

    try {
      const payload = {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        currentPassword: formData.currentPassword || "", // Thêm trường mật khẩu
        newPassword: formData.newPassword || "",
        phone: formData.phone || "",
        birthDay: formattedBirthDay,
        gender: formData.gender || null,
        address: formData.address || null,
      };

      console.log("Payload gửi lên API:", payload);

      const response = await apiService.updateUserProfile(
        authData.userId,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
          },
        }
      );

      console.log("Response từ API:", response.result);

      if (response.isSuccess) {
        setProfile({
          ...response.result,
          birthDay: formData.birthDay, // Giữ định dạng hiển thị
        });
        setFormData({
          ...response.result,
          birthDay: formData.birthDay,
          currentPassword: "", // Xóa mật khẩu sau khi update
          newPassword: "",
        });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(error.message || "Error updating profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-700 text-xl animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-xl">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 p-6 flex items-center">
          <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-2xl">
            {profile.fullName ? profile.fullName[0].toUpperCase() : "U"}
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-semibold text-white">
              {profile.fullName || "User Profile"}
            </h2>
            <p className="text-indigo-100">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-1/3 bg-white p-6 border-r border-indigo-100">
            <div className="space-y-4">
              <SidebarField label="Email" value={profile.email || "N/A"} />
            </div>
            <div className="mt-6 space-y-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 hover:scale-105 transition-all duration-300 ease-in-out shadow-md"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="submit"
                    form="profileForm"
                    className="w-full py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-600 hover:scale-105 transition-all duration-300 ease-in-out shadow-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 hover:scale-105 transition-all duration-300 ease-in-out shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="md:w-2/3 p-6">
            {!isEditing ? (
              <div className="space-y-4">
                <ProfileField
                  label="Full Name"
                  value={profile.fullName || "N/A"}
                />
                <ProfileField label="Phone" value={profile.phone || "N/A"} />
                <ProfileField
                  label="Birth Day"
                  value={profile.birthDay || "N/A"}
                />
                <ProfileField label="Gender" value={profile.gender || "N/A"} />
                <ProfileField
                  label="Address"
                  value={profile.address || "N/A"}
                />
                <ProfileField
                  label="Age"
                  value={calculateAge(profile.birthDay)}
                />
                {role === "student" && (
                  <>
                    <ProfileField
                      label="School"
                      value={getSchool(profile.address)}
                    />
                    <ProfileField
                      label="Course"
                      value={calculateCourse(profile.birthDay)}
                    />
                  </>
                )}
              </div>
            ) : (
              <form
                id="profileForm"
                onSubmit={handleUpdate}
                className="space-y-4"
              >
                <EditField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                />
                <EditField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                />
                <EditField
                  label="Current Password"
                  name="currentPassword"
                  value={formData.currentPassword || ""}
                  onChange={handleChange}
                  type="password"
                />
                <EditField
                  label="New Password"
                  name="newPassword"
                  value={formData.newPassword || ""}
                  onChange={handleChange}
                  type="password"
                />
                <EditField
                  label="Phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                />
                <EditField
                  label="Birth Day"
                  name="birthDay"
                  value={formData.birthDay || ""}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300 ease-in-out"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <EditField
                  label="Address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                />
                <EditField
                  label="Age"
                  value={calculateAge(formData.birthDay)}
                  disabled
                />
                {role === "student" && (
                  <>
                    <EditField
                      label="School"
                      value={getSchool(formData.address)}
                      disabled
                    />
                    <EditField
                      label="Course"
                      value={calculateCourse(formData.birthDay)}
                      disabled
                    />
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "auto",
          maxWidth: "90%",
        }}
      />
    </div>
  );
};

// Sidebar Field (Thông tin cố định)
const SidebarField = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-600">{label}:</span>
    <p className="text-gray-800 break-words">{value}</p>
  </div>
);

// Profile Field (View mode)
const ProfileField = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-700">{label}:</span>
    <p className="text-gray-600 break-words">{value}</p>
  </div>
);

// Edit Field (Edit mode)
const EditField = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
  placeholder,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full p-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300 ease-in-out ${
        disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
      }`}
    />
  </div>
);

export default UserProfilePage;
