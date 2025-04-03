import Swal from "sweetalert2";

const swalWithConfig = Swal.mixin({
  confirmButtonColor: "#26A69A",
  cancelButtonColor: "#FF6F61",
  timer: 1500,
  showConfirmButton: false,
  position: "center",
});

export const showSuccess = (title, text) => {
  return swalWithConfig.fire({
    title,
    text,
    icon: "success",
  });
};

export const showError = (title, text) => {
  return swalWithConfig.fire({
    title,
    text,
    icon: "error",
    timer: 2000,
  });
};

export const showConfirm = (title, text, onConfirm) => {
  return swalWithConfig
    .fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      showConfirmButton: true,
      timer: null,
    })
    .then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
    });
};

export default swalWithConfig;
