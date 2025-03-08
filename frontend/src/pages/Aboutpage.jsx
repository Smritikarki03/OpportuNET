import { motion } from "framer-motion";
import Footer from "../Components/Footer";
import Header from "../Components/Header";

export default function AboutUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-teal-50 min-h-screen flex flex-col">
      {/* Header Section */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-8 pt-20">
        <motion.div
          className="max-w-6xl mx-auto space-y-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page Title */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold text-teal-900">About Us</h1>
            <p className="mt-2 text-lg text-teal-700">
              Learn more about our mission, story, and commitment to connecting talent with opportunities.
            </p>
          </motion.div>

          {/* Our Mission Section */}
          <section className="flex flex-col md:flex-row items-center gap-10">
            <motion.div variants={itemVariants} className="md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl font-bold text-teal-800 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                At <span className="font-semibold text-teal-700">OpportuNET</span>, we are dedicated to
                connecting job seekers with opportunities that align with their skills and ambitions.
                Our goal is to streamline the hiring process through innovative technology, making job
                searches efficient and impactful. We empower individuals with resources, tools, and
                guidance to thrive in their careers while helping companies effortlessly discover top
                talent.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="md:w-1/2 flex justify-center">
              <img
                src="https://www.libertystaffing.ca/hubfs/5_Ways_to_Improve_Teamwork_in_the_Workplace.jpg#keepProtocol"
                alt="Our Mission"
                className="w-full max-w-md rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
              />
            </motion.div>
          </section>

          {/* Our Story Section */}
          <section className="flex flex-col md:flex-row-reverse items-center gap-10">
            <motion.div variants={itemVariants} className="md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl font-bold text-teal-800 mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                OpportuNET was born from a vision to bridge the divide between talent and employers.
                We set out to simplify job searching and hiring, fostering transparency, trust, and
                efficiency. What started as a platform for job listings has evolved into a space that
                nurtures career growth through mentorship, skill-building, and real-time industry
                insights. Today, we’re proud to be a trusted partner for job seekers and recruiters,
                continually evolving to redefine the future of work.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="md:w-1/2 flex justify-center">
              <img
                src="https://www.meetrv.com/wp-content/uploads/2020/08/4-Unconventional-yet-Promising-Design-Career-Options-for-Youth.jpg"
                alt="Our Story"
                className="w-full max-w-md rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
              />
            </motion.div>
          </section>

          {/* Our Team Section */}
          <section className="flex flex-col md:flex-row items-center gap-10">
            <motion.div variants={itemVariants} className="md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl font-bold text-teal-800 mb-6">Our Team</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our team at OpportuNET is composed of passionate professionals with diverse
                backgrounds in technology, human resources, and career development. Led by industry
                experts, we bring years of experience to ensure our platform meets the needs of both
                job seekers and employers. Our collaborative culture drives innovation and supports
                our mission to transform the job market.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="md:w-1/2 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Our Team"
                className="w-full max-w-md rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
              />
            </motion.div>
          </section>

          {/* Our Values Section */}
          <section className="flex flex-col md:flex-row-reverse items-center gap-10">
            <motion.div variants={itemVariants} className="md:w-1/2 text-center md:text-left">
              <h2 className="text-4xl font-bold text-teal-800 mb-6">Our Values</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                At OpportuNET, we are guided by core values that shape everything we do: Integrity,
                Innovation, Inclusion, and Impact. We prioritize transparency in our processes,
                embrace cutting-edge technology, foster a diverse community, and strive to create
                meaningful career opportunities for all. These values are the foundation of our
                success and growth.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="md:w-1/2 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Our Values"
                className="w-full max-w-md rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
              />
            </motion.div>
          </section>

          {/* Get Involved Section (No Image) */}
          <section className="text-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-bold text-teal-800 mb-6">Get Involved</h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                We invite you to join the OpportuNET community! Whether you’re a job seeker looking
                to grow your career, an employer seeking talent, or a partner interested in
                collaboration, there are many ways to get involved. Reach out to us, attend our
                webinars, or explore partnership opportunities to help shape the future of work.
              </p>
              <button className="mt-6 bg-teal-700 text-white py-2 px-6 rounded-lg hover:bg-teal-800 transition">
                Contact Us
              </button>
            </motion.div>
          </section>

          {/* Bottom Centered Image */}
          <motion.div variants={itemVariants} className="flex justify-center mt-12">
            <img
              src="https://images.unsplash.com/photo-1516321318423-8d57e48f8f32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              alt="Join Our Community"
              className="w-full max-w-md rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
            />
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}