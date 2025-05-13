import React from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react";

const ConfirmModal = ({ visible, onClose, onConfirm, appointmentId }) => {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
      backdrop="static"
      className="transition-all duration-300 ease-in-out"
    >
      <CModalHeader className="bg-blue-600 from-purple-600 to-indigo-700 text-white">
        <CModalTitle className="flex items-center">
          <i className="fas fa-exclamation-circle mr-2"></i>
          Confirm Cancellation
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="py-6 bg-gray-50">
        <div className="text-center">
          <i className="fas fa-calendar-times text-indigo-500 mb-4 text-5xl"></i>
          <p className="mb-0 text-lg text-gray-700">
            Are you sure you want to cancel this appointment?
          </p>
        </div>
      </CModalBody>
      <CModalFooter className="border-t-0 flex justify-center space-x-4 bg-gray-50">
        <CButton
          className="bg-gradient-to-r from-teal-400 to-emerald-500 hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-teal-200/50 min-w-32 flex items-center justify-center text-white font-medium"
          onClick={async () => {
            await onConfirm(appointmentId);
            onClose();
          }}
        >
          <i className="fas fa-check mr-2"></i>
          Yes
        </CButton>
        <CButton
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-rose-200/50 min-w-32 text-white font-medium flex items-center justify-center"
          onClick={onClose}
        >
          <i className="fas fa-times mr-2"></i>
          No
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ConfirmModal;
