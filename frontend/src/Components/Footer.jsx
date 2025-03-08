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

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li><a href="/jobs" className="hover:underline">Browse Jobs</a></li>
              <li><a href="/companies" className="hover:underline">Top Companies</a></li>
              <li><a href="/about" className="hover:underline">About Us</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <p className="mt-2 text-gray-300">📍 Kathmandu, Nepal</p>
            <p>📧 support@opportunet.com</p>
            <p>📞 +977-9800000000</p>
            {/* Social Media Icons (Placeholder) */}
            <div className="mt-4 flex justify-center md:justify-start space-x-4">
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
