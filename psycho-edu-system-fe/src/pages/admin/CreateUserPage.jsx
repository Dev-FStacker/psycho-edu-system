/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import apiService from "../../services/apiService";
import { showSuccess, showError, showConfirm } from "../../utils/swalConfig";

const CreateUserPage = () => {
  const [formData, setFormData] = useState({
    role: "",
    userName: "",
    email: "",
    studentRelationships: [
      {
        studentEmail: "",
        relationship: "",
        customRelationship: "",
        confirmed: false,
      },
    ],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      const updatedRelationships = [...formData.studentRelationships];
      updatedRelationships[index][name] = value;
      setFormData({ ...formData, studentRelationships: updatedRelationships });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.role) newErrors.role = "Please select a role";
    if (!formData.userName) newErrors.userName = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (formData.role === "parent") {
      formData.studentRelationships.forEach((rel, index) => {
        if (!rel.studentEmail) {
          newErrors[`studentEmail-${index}`] = "Student email is required";
        } else if (!rel.studentEmail.endsWith("@fpt.edu.vn")) {
          newErrors[`studentEmail-${index}`] =
            "Student email must end with @fpt.edu.vn";
        } else if (!rel.confirmed) {
          newErrors[`studentEmail-${index}`] =
            "Please confirm the student email";
        }
        if (!rel.relationship) {
          newErrors[`relationship-${index}`] = "Please select a relationship";
        }
        if (rel.relationship === "other" && !rel.customRelationship) {
          newErrors[`customRelationship-${index}`] =
            "Please specify the relationship";
        }
      });
    }
    return newErrors;
  };

  const handleConfirmStudentEmail = async (index) => {
    const studentEmail = formData.studentRelationships[index].studentEmail;
    if (!studentEmail.endsWith("@fpt.edu.vn")) {
      setErrors({
        [`studentEmail-${index}`]: "Student email must end with @fpt.edu.vn",
      });
      showError("Error", "Student email must end with @fpt.edu.vn");
      return;
    }

    try {
      const res = await apiService.checkUserExistence(studentEmail);
      console.log("Check user response:", res); // Debug
      if (res.message === "User does not exist" || !res.isSuccess) {
        setErrors({
          [`studentEmail-${index}`]: "Student email does not exist",
        });
        showError("Error", "Student email does not exist");
      } else {
        const updatedRelationships = [...formData.studentRelationships];
        updatedRelationships[index].confirmed = true;
        setFormData({
          ...formData,
          studentRelationships: updatedRelationships,
        });
        showSuccess("Success", `Student email ${studentEmail} confirmed!`);
        setErrors((prev) => ({ ...prev, [`studentEmail-${index}`]: "" }));
      }
    } catch (error) {
      console.error("Error in handleConfirmStudentEmail:", error); // Debug
      setErrors({ [`studentEmail-${index}`]: "Error checking email" });
      showError(
        "Error",
        error.message || "Failed to check student email. Please try again."
      );
    }
  };

  const handleAddRelationship = () => {
    setFormData({
      ...formData,
      studentRelationships: [
        ...formData.studentRelationships,
        {
          studentEmail: "",
          relationship: "",
          customRelationship: "",
          confirmed: false,
        },
      ],
    });
  };

  const handleRemoveRelationship = (index) => {
    showConfirm("Are you sure?", "This relationship will be removed.", () => {
      const updatedRelationships = formData.studentRelationships.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, studentRelationships: updatedRelationships });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`studentEmail-${index}`];
        delete newErrors[`relationship-${index}`];
        delete newErrors[`customRelationship-${index}`];
        return newErrors;
      });
      showSuccess("Success", "Relationship removed successfully!");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError("Error", "Please fix the errors in the form");
      return;
    }

    try {
      const payload = {
        userName: formData.userName,
        email: formData.email,
        roleName:
          formData.role === "counselor"
            ? "Psychologist"
            : formData.role.charAt(0).toUpperCase() + formData.role.slice(1),
        ...(formData.role === "parent" && {
          studentRelationships: formData.studentRelationships.map((rel) => ({
            studentEmail: rel.studentEmail,
            relationshipName:
              rel.relationship === "other"
                ? rel.customRelationship
                : rel.relationship,
          })),
        }),
      };
      console.log("Payload sent to createUserAccount:", payload); // Debug
      const response = await apiService.createUserAccount(payload);
      console.log("Create user response:", response); // Debug
      showSuccess("Success", "User created successfully!");
      setFormData({
        role: "",
        userName: "",
        email: "",
        studentRelationships: [
          {
            studentEmail: "",
            relationship: "",
            customRelationship: "",
            confirmed: false,
          },
        ],
      });
      setErrors({});
    } catch (error) {
      console.error("Error in handleSubmit:", error); // Debug
      showError(
        "Error",
        error.message || "Failed to create user. Please try again."
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-br from-blue-50 to-white shadow-2xl rounded-2xl">
      {/* Header */}
      <div className="border-b-2 border-indigo-100 pb-4 mb-8">
        <h2 className="text-3xl font-semibold text-center text-indigo-700">
          Create New User
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-white border-2 border-indigo-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-inner hover:border-indigo-400 transition-all duration-300 ease-in-out shadow-sm"
            >
              <option value="">Select Role</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
              <option value="counselor">Psychologist</option>
            </select>
            {errors.role && (
              <span className="block mt-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent p-1 rounded">
                {errors.role}
              </span>
            )}
          </div>

          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full p-3 bg-white border-2 border-indigo-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-inner hover:border-indigo-400 transition-all duration-300 ease-in-out shadow-sm"
              placeholder="Enter username"
            />
            {errors.userName && (
              <span className="block mt-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent p-1 rounded">
                {errors.userName}
              </span>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-base font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-white border-2 border-indigo-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-inner hover:border-indigo-400 transition-all duration-300 ease-in-out shadow-sm"
              placeholder="Enter email"
            />
            {errors.email && (
              <span className="block mt-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent p-1 rounded">
                {errors.email}
              </span>
            )}
          </div>
        </div>

        {formData.role === "parent" && (
          <div className="space-y-6">
            {formData.studentRelationships.map((rel, index) => (
              <div key={index} className="grid grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Student Email
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="email"
                      name="studentEmail"
                      value={rel.studentEmail}
                      onChange={(e) => handleChange(e, index)}
                      className="flex-1 p-3 bg-white border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-inner hover:border-indigo-400 transition-all duration-300 ease-in-out shadow-sm"
                      placeholder="e.g., student@fpt.edu.vn"
                    />
                    <button
                      type="button"
                      onClick={() => handleConfirmStudentEmail(index)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300 ease-in-out shadow-lg"
                    >
                      Confirm
                    </button>
                  </div>
                  {errors[`studentEmail-${index}`] && (
                    <span className="block mt-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent p-1 rounded">
                      {errors[`studentEmail-${index}`]}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">
                    Relationship
                  </label>
                  <div className="flex gap-4">
                    <select
                      name="relationship"
                      value={rel.relationship}
                      onChange={(e) => handleChange(e, index)}
                      className="flex-1 p-3 bg-white border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-inner hover:border-indigo-400 transition-all duration-300 ease-in-out shadow-sm"
                    >
                      <option value="">Select Relationship</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.studentRelationships.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRelationship(index)}
                        className="px-4 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-300 ease-in-out shadow-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errors[`relationship-${index}`] && (
                    <span className="block mt-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent p-1 rounded">
                      {errors[`relationship-${index}`]}
                    </span>
                  )}
                  {rel.relationship === "other" && (
                    <div className="mt-4">
                      <input
                        type="text"
                        name="customRelationship"
                        value={rel.customRelationship}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full p-3 bg-white border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-inner hover:border-indigo-400 transition-all duration-300 ease-in-out shadow-sm"
                        placeholder="Specify relationship"
                      />
                      {errors[`customRelationship-${index}`] && (
                        <span className="block mt-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent p-1 rounded">
                          {errors[`customRelationship-${index}`]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddRelationship}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300 ease-in-out shadow-md"
            >
              Add More Relationship
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-4 pt-8 border-t-2 border-indigo-100">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 ease-in-out shadow-lg"
          >
            Create User
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-300 ease-in-out shadow-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
