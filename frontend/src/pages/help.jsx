import React from "react";
import Footer from "../Components/Footer";
import Header from "../Components/Header";

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-teal-50 text-teal-900 flex flex-col">
      {/* Header Section */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
        <h1 className="text-4xl font-bold text-center">Help Center</h1>
        <p className="mt-2 text-lg text-center text-teal-700">
          We're here to help you with anything related to finding a job, using OpportuNET, or your account.
        </p>

        {/* FAQ Section */}
        <section className="mt-8">
          <h2 className="text-3xl font-semibold">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-6">
            <div className="border-b border-teal-500 pb-4">
              <h3 className="text-2xl font-medium">1. How can I create an account?</h3>
              <p className="text-teal-600 mt-2">
                To create an account, click on the "Sign Up" button at the top right of the page, enter your details, and submit.
                After that, you will receive a confirmation email.
              </p>
            </div>
            <div className="border-b border-teal-500 pb-4">
              <h3 className="text-2xl font-medium">2. How do I apply for a job?</h3>
              <p className="text-teal-600 mt-2">
                After finding a job listing that interests you, click the "Apply" button. Fill out the application form and submit it. You can also attach your resume.
              </p>
            </div>
            <div className="border-b border-teal-500 pb-4">
              <h3 className="text-2xl font-medium">3. How do I change my profile information?</h3>
              <p className="text-teal-600 mt-2">
                To update your profile, go to your account settings and click on "Edit Profile." You can update your personal information, resume, and job preferences there.
              </p>
            </div>
            <div className="border-b border-teal-500 pb-4">
              <h3 className="text-2xl font-medium">4. How can I disable job alerts?</h3>
              <p className="text-teal-600 mt-2">
                To disable job alerts, go to your profile settings and toggle off the "Job Alerts" option. You will stop receiving notifications for new job listings.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold">Contact Us</h2>
          <p className="mt-4 text-teal-600">
            If you need further assistance, feel free to reach out to us.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-2xl font-medium">Email Support:</h3>
              <p className="text-teal-600">support@opportunet.com</p>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Phone Support:</h3>
              <p className="text-teal-600">+1 234 567 890</p>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold">Helpful Tips for Job Seekers</h2>
          <div className="mt-6">
            <ul className="list-disc pl-6 text-teal-600 space-y-4">
              <li>Keep your resume up-to-date with your latest experience and skills.</li>
              <li>Customize your cover letter for each job you apply to.</li>
              <li>Research companies thoroughly before applying to ensure a good fit.</li>
              <li>Set up job alerts to stay updated on new opportunities.</li>
              <li>Network with other professionals in your field to discover hidden job opportunities.</li>
            </ul>
          </div>
        </section>

        {/* Troubleshooting Section */}
        <section className="mt-12">
          <h2 className="text-3xl font-semibold">Troubleshooting</h2>
          <div className="mt-6 space-y-6">
            <div className="border-b border-teal-500 pb-4">
              <h3 className="text-2xl font-medium">1. I cannot log into my account.</h3>
              <p className="text-teal-600 mt-2">
                Please check your username and password. If you forgot your password, click "Forgot Password" on the login page to reset it.
              </p>
            </div>
            <div className="border-b border-teal-500 pb-4">
              <h3 className="text-2xl font-medium">2. I’m not receiving job alerts.</h3>
              <p className="text-teal-600 mt-2">
                Ensure that you have enabled job alerts in your profile settings and that your email notifications are set to "On."
              </p>
            </div>
            <div className="border-b border-teal-500 pb-4">
              <h3 className="text-2xl font-medium">3. The website is not loading properly.</h3>
              <p className="text-teal-600 mt-2">
                Try refreshing the page or clearing your browser cache. If the issue persists, contact us for further assistance.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;