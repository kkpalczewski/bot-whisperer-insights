import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-4">Oops! Page not found</p>
      <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
        Return to Home
      </Link>
    </div>
  </div>
);

export default NotFound;
