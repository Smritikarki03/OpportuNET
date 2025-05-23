export default function Footer() {
  return (
    // Footer
    <footer className="bg-teal-800 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">

          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold">About OpportuNET</h3>
            <p className="mt-2 text-gray-300">
              OpportuNET is your gateway to the best job opportunities, connecting talent with top companies.
            </p>
          </div>

          {/* Spacer for center column (optional, can be empty or for future use) */}
          <div></div>

          {/* Contact Section - right aligned on md+ */}
          <div className="md:text-right flex flex-col items-center md:items-end">
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <p className="mt-2 text-gray-300">📍 Kathmandu, Nepal</p>
            <p>📧 support@opportunet.com</p>
            <p>📞 +977-9800000000</p>
            {/* Social Media Icons (Placeholder) */}
            <div className="mt-4 flex justify-center md:justify-end space-x-4">
              <a href="#" className="hover:text-gray-400">🌐</a>
              <a href="#" className="hover:text-gray-400">📘</a>
              <a href="#" className="hover:text-gray-400">🐦</a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-gray-600 pt-4 text-center">
          <p>&copy; 2025 OpportuNET. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
