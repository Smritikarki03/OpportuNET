import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "tailwindcss/tailwind.css";

function CVGenerator() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState(null);
  const [aboutMe, setAboutMe] = useState("");
  const [languages, setLanguages] = useState([]);
  const [awards, setAwards] = useState("");
  const [certificates, setCertificates] = useState([]);

  const languageOptions = [
    "English", "Hindi", "Nepali", "French", "Spanish", "German", "Chinese"
  ];

  const handleFileChange = (e) => {
    setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const handleAddCertificate = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificates([...certificates, file.name]);
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    if (!languages.includes(selectedLang)) {
      setLanguages([...languages, selectedLang]);
    }
  };

  const removeLanguage = (lang) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text(name, 20, 20);
    doc.setFontSize(12);
    doc.text(`📧 Email: ${email}`, 20, 30);
    doc.text(`📞 Phone: ${phone}`, 20, 40);
    doc.text(`🏡 Address: ${address}`, 20, 50);
    doc.text("📝 About Me:", 20, 65);
    doc.setFontSize(10);
    doc.text(aboutMe, 20, 75, { maxWidth: 170 });
    doc.setFontSize(12);
    doc.text("Languages:", 20, 95);
    languages.forEach((lang, index) => {
      doc.text(`• ${lang}`, 25, 105 + index * 10);
    });
    doc.text("Awards:", 20, 125 + languages.length * 10);
    doc.text(awards, 20, 135 + languages.length * 10, { maxWidth: 170 });
    
    // Add Certificates to the PDF
    doc.text("Certificates:", 20, 150 + languages.length * 10 + (awards ? 10 : 0));
    certificates.forEach((cert, index) => {
      doc.text(`• ${cert}`, 25, 160 + languages.length * 10 + (awards ? 10 : 0) + index * 10);
    });

    doc.save("CV.pdf");
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto border border-teal-700">
      <h1 className="text-3xl text-center font-semibold mb-6 text-teal-700">CV Generator</h1>
      <div className="flex gap-8">
        <div className="w-1/2">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md mt-4" />
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md mt-4" />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md mt-4" />
          <textarea placeholder="About Me" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md mt-4 break-words"></textarea>
          <select onChange={handleLanguageChange} className="w-full p-3 border border-gray-300 rounded-md mt-4">
            <option value="">Select a language</option>
            {languageOptions.map((lang) => (<option key={lang} value={lang}>{lang}</option>))}
          </select>
          <ul className="mt-2">
            {languages.map((lang, index) => (
              <li key={index} className="bg-teal-100 p-2 rounded-md inline-block mr-2 cursor-pointer" onClick={() => removeLanguage(lang)}>
                {lang} ❌
              </li>
            ))}
          </ul>
          <input type="file" onChange={handleFileChange} className="w-full p-3 border border-gray-300 rounded-md mt-4" />
          <textarea placeholder="Awards" value={awards} onChange={(e) => setAwards(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md mt-4"></textarea>
          <input type="file" onChange={handleAddCertificate} className="w-full p-3 border border-gray-300 rounded-md mt-4" />
          <button onClick={handleDownload} className="w-full p-3 bg-teal-700 text-white rounded-md hover:bg-teal-800 mt-4">Download CV</button>
        </div>
        <div className="w-1/2 border border-teal-700 p-4 rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold text-teal-700 mb-4">Preview</h2>
          {photo && <img src={photo} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4" />}
          <p><strong>{name}</strong></p>
          <p>Email: {email}</p>
          <p>Phone: {phone}</p>
          <p>Address: {address}</p>
          <p><strong>About Me:</strong></p>
          <p className="break-words">{aboutMe}</p>
          <p><strong>Languages:</strong> {languages.join(", ")}</p>
          <p><strong>Awards:</strong> {awards}</p>
          <p><strong>Certificates:</strong></p>
          <ul>
            {certificates.map((cert, index) => (<li key={index}>• {cert}</li>))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CVGenerator;
