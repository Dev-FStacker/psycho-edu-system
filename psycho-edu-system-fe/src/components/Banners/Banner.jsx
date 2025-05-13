import { Button, Typography } from "@mui/material"; // Importing MUI components
import { motion } from "framer-motion"; // Importing Framer Motion for animation

const Banner = () => {
  return (
    <div className="h-[80vh] text-white text-center grid bg-cover bg-center bg-no-repeat bg-[url('https://ww2.kqed.org/app/uploads/sites/10/2022/09/Mental-Health-Feature-e1662671428167.jpg')]">
      <div className="col-start-1 row-start-1 bg-gray-800 bg-opacity-60 w-full h-full"></div>
      <div className="col-start-1 row-start-1 mx-auto my-auto max-w-4xl px-4">
        {/* Wrapping title and text with framer motion for animations */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="h3"
            className="font-normal sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight"
          >
            Welcome to the FPTU Education System!
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <Typography
            variant="body1"
            className="px-6 py-6 text-sm md:text-xl lg:text-2xl font-thin leading-relaxed mb-6"
          >
            As the first and only Vietnamese school to be fully accredited by
            the Council of International Schools (CIS), FPTU is proud to educate
            a new generation of Vietnamese with a global citizenship mindset,
            lifelong learning skills, and a desire to create the future.
          </Typography>
        </motion.div>

        {/* Button with MUI and framer motion for hover animation */}
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="contained"
            color="primary"
            className="font-semibold py-3 px-8 rounded-full shadow-lg"
            sx={{ transform: "scale(1)", transition: "transform 0.3s ease" }}
          >
            Learn More
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Banner;
