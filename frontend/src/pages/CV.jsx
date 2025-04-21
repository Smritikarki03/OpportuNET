import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "tailwindcss/tailwind.css";
import Header from "../Components/Header"; // Assuming this is your Header component
import Footer from "../Components/Footer"; // Assuming this is your Footer component
import { useNavigate } from "react-router-dom"; // Add this import

/**
 * CVGenerator Component
 * A comprehensive CV/Resume generator that allows users to create professional CVs
 * with sections for personal info, education, work experience, skills, and more.
 */
function CVGenerator() {
  const navigate = useNavigate(); // Add this line
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
  const [newCertificate, setNewCertificate] = useState("");
  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState({ institution: "", degree: "", year: "" });
  const [workExperience, setWorkExperience] = useState([]);
  const [newWorkExperience, setNewWorkExperience] = useState({ company: "", role: "", duration: "" });

  // Add validation state
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const languageOptions = [
    "English", "Hindi", "Nepali", "French", "Spanish", "German", "Chinese",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setErrors(prev => ({
          ...prev,
          photo: 'Please upload an image file (PNG, JPG, JPEG)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: 'Image size should be less than 5MB'
        }));
        return;
      }

      const objectURL = URL.createObjectURL(file);
      setPhoto(objectURL);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
        setSuccessMessage('Photo uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoBase64('');
    setSuccessMessage('Photo removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
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

  const handleAddCertificate = () => {
    if (newCertificate.trim()) {
      setCertificates([...certificates, newCertificate.trim()]);
      setNewCertificate("");
    }
  };

  // Validation function
  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name} is required`;
    }
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    if (name === 'phone' && !/^\+?[\d\s-]{8,}$/.test(value)) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  // Enhanced handlers with validation
  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(value);
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleAddEducation = () => {
    if (!newEducation.institution.trim() || !newEducation.degree.trim() || !newEducation.year.trim()) {
      setErrors(prev => ({
        ...prev,
        education: 'Please fill in all education fields'
      }));
      return;
    }
      setEducation([...education, newEducation]);
      setNewEducation({ institution: "", degree: "", year: "" });
    setErrors(prev => ({ ...prev, education: '' }));
    setSuccessMessage('Education added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAddWorkExperience = () => {
    if (newWorkExperience.company.trim() && newWorkExperience.role.trim() && newWorkExperience.duration.trim()) {
      setWorkExperience([...workExperience, newWorkExperience]);
      setNewWorkExperience({ company: "", role: "", duration: "" });
    }
  };

  /**
   * Generates and downloads a professionally formatted CV
   * Implements a clean, modern design with proper spacing and typography
   */
  const handleDownload = () => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });

    // Color scheme
    const colors = {
      teal: [0, 128, 128],      // Main teal color
      text: [80, 80, 80],       // Dark gray
      lightText: [120, 120, 120] // Light gray
    };

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 25;

    // Add white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Name section
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text(name, margin, margin + 10);

    // Underline for name
    doc.setDrawColor(...colors.teal);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 15, margin + doc.getTextWidth(name), margin + 15);

    // Add photo
    if (photoBase64) {
      try {
        doc.addImage(photoBase64, "JPEG", pageWidth - margin - 40, margin, 40, 40, "", "MEDIUM");
      } catch (error) {
        console.error("Error adding image:", error);
      }
    }

    let yPos = margin + 25;

    // Contact information
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    
    const contactInfo = [
      { label: "Gmail:", text: email },
      { label: "Phone Number:", text: phone },
      { label: "Address:", text: address }
    ];

    contactInfo.forEach(info => {
      doc.setFont("helvetica", "bold");
      doc.text(info.label, margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(info.text, margin + doc.getTextWidth(info.label) + 2, yPos);
      yPos += 5;
    });

    yPos += 10;

    // Function to add section headings
    const addSectionHeading = (title, y) => {
      doc.setTextColor(...colors.teal);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), margin, y);
      
      // Underline
      doc.setDrawColor(...colors.teal);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, margin + 40, y + 2);
      
      return y + 10;
    };

    // Profile section
    yPos = addSectionHeading("About Me", yPos);
    if (aboutMe) {
      doc.setTextColor(...colors.text);
      doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
      const aboutMeLines = doc.splitTextToSize(aboutMe, pageWidth - (2 * margin));
      doc.text(aboutMeLines, margin, yPos);
      yPos += aboutMeLines.length * 5 + 10;
    }

    // Experience section
    yPos = addSectionHeading("Experience", yPos);
    workExperience.forEach(work => {
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
      doc.text(work.role, margin + 5, yPos);
      
    doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colors.lightText);
      doc.text(`${work.company} | ${work.duration}`, margin + 5, yPos + 5);
      
      // Add bullet point
      doc.setFillColor(...colors.teal);
      doc.circle(margin + 2, yPos - 1, 0.8, 'F');
      
      yPos += 12;
    });

    yPos += 5;

    // Education section
    yPos = addSectionHeading("Education", yPos);
    education.forEach(edu => {
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
      doc.text(edu.degree, margin + 5, yPos);
      
    doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colors.lightText);
      doc.text(`${edu.institution} | ${edu.year}`, margin + 5, yPos + 5);
      
      // Add bullet point
      doc.setFillColor(...colors.teal);
      doc.circle(margin + 2, yPos - 1, 0.8, 'F');
      
      yPos += 12;
    });

    yPos += 5;

    // Languages section
    yPos = addSectionHeading("Languages", yPos);
    if (languages.length > 0) {
      doc.setTextColor(...colors.text);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(languages.join(" • "), margin + 5, yPos);
      yPos += 15;
    }

    // Awards section
    yPos = addSectionHeading("Awards", yPos);
    awards.forEach(award => {
      doc.setTextColor(...colors.text);
      doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
      
      // Add bullet point
      doc.setFillColor(...colors.teal);
      doc.circle(margin + 2, yPos - 1, 0.8, 'F');
      
      doc.text(award, margin + 5, yPos);
      yPos += 6;
    });

    yPos += 5;

    // Certificates section
    yPos = addSectionHeading("Certificates", yPos);
    certificates.forEach(cert => {
      doc.setTextColor(...colors.text);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Add bullet point
      doc.setFillColor(...colors.teal);
      doc.circle(margin + 2, yPos - 1, 0.8, 'F');
      
      doc.text(cert, margin + 5, yPos);
      yPos += 6;
    });

    // Save the CV
    const filename = `${name.replace(/\s+/g, '_')}_CV.pdf`;
    doc.save(filename);
    setSuccessMessage('CV downloaded successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Add remove handlers
  const handleRemoveAward = (indexToRemove) => {
    setAwards(awards.filter((_, index) => index !== indexToRemove));
    setSuccessMessage('Award removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRemoveCertificate = (indexToRemove) => {
    setCertificates(certificates.filter((_, index) => index !== indexToRemove));
    setSuccessMessage('Certificate removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRemoveEducation = (indexToRemove) => {
    setEducation(education.filter((_, index) => index !== indexToRemove));
    setSuccessMessage('Education entry removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRemoveWorkExperience = (indexToRemove) => {
    setWorkExperience(workExperience.filter((_, index) => index !== indexToRemove));
    setSuccessMessage('Work experience removed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <br/> 
      <br/>
      <br/>
  
      <div className="container mx-auto px-4 py-8">
        {/* Main title centered at the top */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">CV Generator</h1>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Left Side - Form */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-lg h-[800px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-teal-700">Form</h2>
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">Personal Information</h2>
                    <div className="space-y-4">
            <input
              type="text"
                        name="name"
                        placeholder="Full Name *"
              value={name}
                        onChange={(e) => handleInputChange(e, setName)}
                        className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <input
              type="email"
                        name="email"
                        placeholder="Email Address *"
              value={email}
                        onChange={(e) => handleInputChange(e, setEmail)}
                        className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              type="text"
                        name="phone"
                        placeholder="Phone *"
              value={phone}
                        onChange={(e) => handleInputChange(e, setPhone)}
                        className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
                      {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

            <input
              type="text"
                        name="address"
                        placeholder="Address *"
              value={address}
                        onChange={(e) => handleInputChange(e, setAddress)}
                        className={`w-full p-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            />
                      {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}

            <textarea
              placeholder="About Me"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">Profile Photo</h2>
                    {photo ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <img src={photo} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
              <button
                            onClick={handleRemovePhoto}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
              >
                            ×
              </button>
            </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer text-teal-700 hover:text-teal-800"
                        >
                          Click to upload photo
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">Education</h2>
                    {education.map((edu, index) => (
                      <div key={index} className="bg-white p-3 rounded mb-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-sm text-gray-600">{edu.institution} ({edu.year})</p>
                        </div>
                        <button onClick={() => handleRemoveEducation(index)} className="text-red-500">×</button>
            </div>
                    ))}
                    <div className="space-y-2 mt-4">
              <input
                type="text"
                placeholder="Institution"
                value={newEducation.institution}
                onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                        className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Degree"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                        className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Year"
                value={newEducation.year}
                onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                        className="w-full p-2 border rounded"
              />
              <button
                onClick={handleAddEducation}
                        className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700"
              >
                Add Education
              </button>
            </div>
                  </div>

                  {/* Work Experience */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">Work Experience</h2>
                    {workExperience.map((work, index) => (
                      <div key={index} className="bg-white p-3 rounded mb-2 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{work.role}</p>
                          <p className="text-sm text-gray-600">{work.company} ({work.duration})</p>
                        </div>
                        <button onClick={() => handleRemoveWorkExperience(index)} className="text-red-500">×</button>
                      </div>
                    ))}
                    <div className="space-y-2 mt-4">
              <input
                type="text"
                placeholder="Company"
                value={newWorkExperience.company}
                onChange={(e) => setNewWorkExperience({ ...newWorkExperience, company: e.target.value })}
                        className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Role"
                value={newWorkExperience.role}
                onChange={(e) => setNewWorkExperience({ ...newWorkExperience, role: e.target.value })}
                        className="w-full p-2 border rounded"
              />
              <input
                type="text"
                        placeholder="Duration"
                value={newWorkExperience.duration}
                onChange={(e) => setNewWorkExperience({ ...newWorkExperience, duration: e.target.value })}
                        className="w-full p-2 border rounded"
              />
              <button
                onClick={handleAddWorkExperience}
                        className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700"
              >
                Add Work Experience
              </button>
            </div>
                  </div>

                  {/* Languages */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">Languages</h2>
                    <select
                      onChange={handleLanguageChange}
                      className="w-full p-2 border rounded mb-4"
                    >
                      <option value="">Select a language</option>
                      {languageOptions.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang, index) => (
                        <span
                          key={index}
                          className="bg-teal-100 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {lang}
                          <button
                            onClick={() => removeLanguage(lang)}
                            className="ml-2 text-teal-700 hover:text-teal-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Awards */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">Awards</h2>
                    {awards.map((award, index) => (
                      <div key={index} className="bg-white p-3 rounded mb-2 flex justify-between items-center">
                        <span>{award}</span>
                        <button onClick={() => handleRemoveAward(index)} className="text-red-500">×</button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        placeholder="Add an award"
                        value={newAward}
                        onChange={(e) => setNewAward(e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                      <button
                        onClick={handleAddAward}
                        className="bg-teal-600 text-white px-4 rounded hover:bg-teal-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Certificates */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-teal-700 mb-4">Certificates</h2>
                    {certificates.map((cert, index) => (
                      <div key={index} className="bg-white p-3 rounded mb-2 flex justify-between items-center">
                        <span>{cert}</span>
                        <button onClick={() => handleRemoveCertificate(index)} className="text-red-500">×</button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        placeholder="Add a certificate"
                        value={newCertificate}
                        onChange={(e) => setNewCertificate(e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                      <button
                        onClick={handleAddCertificate}
                        className="bg-teal-600 text-white px-4 rounded hover:bg-teal-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Move the Generate & Download button outside the scrollable area */}
                <div className="mt-6">
            <button
              onClick={handleDownload}
                    className="w-full bg-teal-700 text-white p-4 rounded-lg font-semibold hover:bg-teal-800 shadow-lg transition duration-300"
            >
                    Generate & Download CV
            </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <div className="bg-white rounded-lg shadow-lg h-[800px] overflow-hidden">
              <div className="bg-white border-b px-6 py-4">
                <h2 className="text-2xl font-semibold text-teal-700">Preview</h2>
              </div>
              <div className="h-[calc(100%-64px)] overflow-y-auto custom-scrollbar">
                <div className="relative w-full max-w-[210mm] mx-auto min-h-[297mm]">
                  <div className="p-8">
                    {/* Header with name and photo */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">{name || "Your Name"}</h1>
                        <div className="w-32 h-0.5 bg-teal-600 mb-4" />
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-semibold">Gmail:</span> {email || "Email"}</p>
                          <p><span className="font-semibold">Phone Number:</span> {phone || "Phone"}</p>
                          <p><span className="font-semibold">Address:</span> {address || "Address"}</p>
                        </div>
                      </div>
            {photo && (
              <img
                src={photo}
                alt="Profile"
                          className="w-32 h-32 object-cover"
                        />
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6">
                      {/* Profile */}
                      <section>
                        <h2 className="text-teal-600 font-bold uppercase text-sm mb-1">About Me</h2>
                        <div className="w-10 h-0.5 bg-teal-600 mb-3" />
                        <p className="text-gray-600 text-sm">{aboutMe || "Tell us about yourself"}</p>
                      </section>

                      {/* Experience */}
                      <section>
                        <h2 className="text-teal-600 font-bold uppercase text-sm mb-1">Experience</h2>
                        <div className="w-10 h-0.5 bg-teal-600 mb-3" />
                        <div className="space-y-3">
                          {workExperience.map((work, index) => (
                            <div key={index} className="flex items-start">
                              <div className="mt-2 mr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800">{work.role}</h3>
                                <p className="text-sm text-gray-600">{work.company} | {work.duration}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Education */}
                      <section>
                        <h2 className="text-teal-600 font-bold uppercase text-sm mb-1">Education</h2>
                        <div className="w-10 h-0.5 bg-teal-600 mb-3" />
                        <div className="space-y-3">
                          {education.map((edu, index) => (
                            <div key={index} className="flex items-start">
                              <div className="mt-2 mr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800">{edu.degree}</h3>
                                <p className="text-sm text-gray-600">{edu.institution} | {edu.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Languages */}
                      <section>
                        <h2 className="text-teal-600 font-bold uppercase text-sm mb-1">Languages</h2>
                        <div className="w-10 h-0.5 bg-teal-600 mb-3" />
                        <p className="text-sm text-gray-600">{languages.join(" • ")}</p>
                      </section>

                      {/* Awards */}
                      <section>
                        <h2 className="text-teal-600 font-bold uppercase text-sm mb-1">Awards</h2>
                        <div className="w-10 h-0.5 bg-teal-600 mb-3" />
                        <div className="space-y-2">
                          {awards.map((award, index) => (
                            <div key={index} className="flex items-start">
                              <div className="mt-2 mr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              </div>
                              <p className="text-sm text-gray-600">{award}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Certificates */}
                      <section>
                        <h2 className="text-teal-600 font-bold uppercase text-sm mb-1">Certificates</h2>
                        <div className="w-10 h-0.5 bg-teal-600 mb-3" />
                        <div className="space-y-2">
                          {certificates.map((cert, index) => (
                            <div key={index} className="flex items-start">
                              <div className="mt-2 mr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              </div>
                              <p className="text-sm text-gray-600">{cert}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CVGenerator;