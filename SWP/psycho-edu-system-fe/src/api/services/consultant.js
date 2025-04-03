export const consultantService = {
  getConsultants: async (type) => {
    // Fake API response
    const fakeData = {
      consultants: [
        {
          id: 1,
          name: "Dr. Sarah",
          role: "Counselor",
          type: "counselor",
          image: "https://example.com/image1.jpg",
          bookedSlots: ["2024-02-10 09:00 AM", "2024-02-11 02:00 PM"],
        },
        {
          id: 2,
          name: "Prof. Thinh",
          role: "Teacher",
          type: "teacher",
          classId: "class-1",
          image: "https://example.com/image2.jpg",
          bookedSlots: ["2024-02-12 10:00 AM", "2024-02-13 03:00 PM"],
        },
      ],
    };

    return new Promise((resolve) =>
      setTimeout(() => resolve({ data: fakeData.consultants }), 500)
    );
  },
};
