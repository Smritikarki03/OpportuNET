import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "tailwindcss/tailwind.css";
import Header from "../Components/Header"; // Assuming this is your Header component
import Footer from "../Components/Footer"; // Assuming this is your Footer component

function CVGenerator() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoBase64, setPhotoBase64] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [languages, setLanguages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [newAward, setNewAward] = useState("");
  const [certificates, setCertificates] = useState([]);

  const languageOptions = [
    "English", "Hindi", "Nepali", "French", "Spanish", "German", "Chinese",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setPhoto(objectURL);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCertificate = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificates([...certificates, file.name]);
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    if (selectedLang && !languages.includes(selectedLang)) {
      setLanguages([...languages, selectedLang]);
    }
  };

  const removeLanguage = (lang) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleAddAward = () => {
    if (newAward.trim()) {
      setAwards([...awards, newAward.trim()]);
      setNewAward("");
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");

    // Add Header to PDF
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 128, 128); // Teal color
    doc.text("Curriculum Vitae", 20, 15);
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 128, 128);
    doc.line(20, 20, 190, 20); // Line below header

    let yPosition = 30; // Start content below header

    // Add Photo to PDF (if available)
    if (photoBase64) {
      try {
        doc.addImage(photoBase64, "JPEG", 20, yPosition, 40, 40);
        yPosition += 50;
      } catch (error) {
        console.error("Error adding image to PDF:", error);
      }
    }

    // Name (bold and larger)
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.text(name || "Your Name", 20, yPosition);
    yPosition += 10;

    // Contact Info (normal font)
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`📧 Email: ${email || "Not provided"}`, 20, yPosition);
    yPosition += 8;
    doc.text(`📞 Phone: ${phone || "Not provided"}`, 20, yPosition);
    yPosition += 8;
    doc.text(`🏡 Address: ${address || "Not provided"}`, 20, yPosition);
    yPosition += 10;

    // Separator Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 128, 128);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    // About Me (bold heading, normal content)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("About Me", 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(aboutMe || "Not provided", 20, yPosition, { maxWidth: 170 });
    yPosition += Math.ceil((aboutMe.length / 170) * 10) + 10;

    // Languages (bold heading, bullet points)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Languages", 20, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (languages.length > 0) {
      languages.forEach((lang, index) => {
        doc.text(`• ${lang}`, 25, yPosition + index * 8);
      });
      yPosition += languages.length * 8 + 5;
    } else {
      doc.text("None", 25, yPosition);
      yPosition += 10;
    }

    // Awards (bold heading, bullet points)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Awards", 20, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (awards.length > 0) {
      awards.forEach((award, index) => {
        doc.text(`• ${award}`, 25, yPosition + index * 8);
      });
      yPosition += awards.length * 8 + 5;
    } else {
      doc.text("None", 25, yPosition);
      yPosition += 10;
    }

    // Certificates (bold heading, bullet points)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Certificates", 20, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (certificates.length > 0) {
      certificates.forEach((cert, index) => {
        doc.text(`• ${cert}`, 25, yPosition + index * 8);
      });
      yPosition += certificates.length * 8 + 5;
    } else {
      doc.text("None", 25, yPosition);
      yPosition += 10;
    }

    // Add Footer to PDF
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(0, 128, 128);
      doc.text("Generated by CV Generator", 20, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${pageCount}`, 170, doc.internal.pageSize.height - 10);
    }

    doc.save("CV.pdf");
  };

  return (
    <div>
      {/* Add Header Component */}
      <Header />
<br></br>
<br></br>
<br></br>

      {/* Main Content */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto border border-teal-700 my-8">
        <h1 className="text-3xl text-center font-semibold mb-6 text-teal-700">CV Generator</h1>
        <div className="flex gap-8">
          <div className="w-1/2">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mt-4"
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mt-4"
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mt-4"
            />
            <textarea
              placeholder="About Me"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mt-4 break-words"
            ></textarea>
            <select
              onChange={handleLanguageChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-4"
            >
              <option value="">Select a language</option>
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <ul className="mt-2">
              {languages.map((lang, index) => (
                <li
                  key={index}
                  className="bg-teal-100 p-2 rounded-md inline-block mr-2 cursor-pointer"
                  onClick={() => removeLanguage(lang)}
                >
                  {lang} ✖
                </li>
              ))}
            </ul>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-md mt-4"
            />
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add an award"
                value={newAward}
                onChange={(e) => setNewAward(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleAddAward}
                className="mt-2 p-2 bg-teal-700 text-white rounded-md hover:bg-teal-800"
              >
                Add Award
              </button>
            </div>
            <input
              type="file"
              onChange={handleAddCertificate}
              className="w-full p-3 border border-gray-300 rounded-md mt-4"
            />
            <button
              onClick={handleDownload}
              className="w-full p-3 bg-teal-700 text-white rounded-md hover:bg-teal-800 mt-4"
            >
              Download CV
            </button>
          </div>
          <div className="w-1/2 border border-teal-700 p-4 rounded-md bg-gray-50">
            <h2 className="text-xl font-semibold text-teal-700 mb-4">Preview</h2>
            {photo && (
              <img
                src={photo}
                alt="Profile"
                className="w-24 h-24 rounded-full mb-4"
              />
            )}
            <p>
              <strong>{name || "Your Name"}</strong>
            </p>
            <p>Email: {email || "Not provided"}</p>
            <p>Phone: {phone || "Not provided"}</p>
            <p>Address: {address || "Not provided"}</p>
            <p>
              <strong>About Me:</strong>
            </p>
            <p className="break-words">{aboutMe || "Not provided"}</p>
            <p>
              <strong>Languages:</strong>
            </p>
            <ul className="list-disc pl-5">
              {languages.length > 0 ? (
                languages.map((lang, index) => <li key={index}>{lang}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
            <p>
              <strong>Awards:</strong>
            </p>
            <ul className="list-disc pl-5">
              {awards.length > 0 ? (
                awards.map((award, index) => <li key={index}>{award}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
            <p>
              <strong>Certificates:</strong>
            </p>
            <ul className="list-disc pl-5">
              {certificates.length > 0 ? (
                certificates.map((cert, index) => <li key={index}>{cert}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Add Footer Component */}
      <Footer />
    </div>
  );
}

export default CVGenerator;