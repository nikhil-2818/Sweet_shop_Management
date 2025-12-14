import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <span className="text-2xl">🍬</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Sweet Shop
                        </span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">
                            Hello, <span className="font-semibold">{user?.username}</span>
                            {user?.is_admin && (
                                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                    Admin
                                </span>
                            )}
                        </span>

                        {user?.is_admin && (
                            <Link
                                to="/admin"
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                            >
                                Admin Panel
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
