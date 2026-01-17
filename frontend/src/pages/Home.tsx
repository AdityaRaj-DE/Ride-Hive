import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { token, isDriver } = useAuth();
  const navigate = useNavigate();

  if (token) {
    navigate(isDriver ? '/driver' : '/rider');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Ride Sharing App</h1>
        <p className="text-gray-600 mb-8">Get started by logging in or creating an account</p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

