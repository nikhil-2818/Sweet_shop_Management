import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { SweetModal } from '../components/SweetModal';
import { useSweetStore } from '../stores/sweetStore';
import type { Sweet } from '../types';

export const Admin = () => {
    const { sweets, fetchSweets, restockSweet, deleteSweet, isLoading } = useSweetStore();
    const [showModal, setShowModal] = useState(false);
    const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
    const [restockId, setRestockId] = useState<number | null>(null);
    const [restockAmount, setRestockAmount] = useState('');

    useEffect(() => {
        fetchSweets();
    }, [fetchSweets]);

    const handleEdit = (sweet: Sweet) => {
        setEditingSweet(sweet);
        setShowModal(true);
    };

    const handleDelete = async (sweet: Sweet) => {
        if (window.confirm(`Are you sure you want to delete "${sweet.name}"?`)) {
            await deleteSweet(sweet.id);
        }
    };

    const handleRestockSubmit = async (id: number) => {
        const amount = parseInt(restockAmount);
        if (amount > 0) {
            await restockSweet(id, amount);
            setRestockId(null);
            setRestockAmount('');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSweet(null);
    };

    const totalValue = sweets.reduce((sum, sweet) => sum + sweet.price * sweet.quantity, 0);
    const totalItems = sweets.reduce((sum, sweet) => sum + sweet.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel 👨‍💼</h1>
                    <p className="text-gray-600">Manage your sweet shop inventory</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <span className="text-3xl">🍬</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{sweets.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-full">
                                <span className="text-3xl">📦</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Items</p>
                                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <span className="text-3xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Inventory Management</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-100 transition font-medium"
                            >
                                + Add New Sweet
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : sweets.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                            <p className="text-gray-600">Start by adding your first sweet!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sweets.map((sweet) => (
                                        <tr key={sweet.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{sweet.name}</div>
                                                {sweet.description && (
                                                    <div className="text-sm text-gray-500">{sweet.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
                                                    {sweet.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${sweet.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {restockId === sweet.id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={restockAmount}
                                                            onChange={(e) => setRestockAmount(e.target.value)}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                            placeholder="Qty"
                                                        />
                                                        <button
                                                            onClick={() => handleRestockSubmit(sweet.id)}
                                                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRestockId(null);
                                                                setRestockAmount('');
                                                            }}
                                                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <span
                                                            className={`font-semibold ${sweet.quantity === 0
                                                                    ? 'text-red-500'
                                                                    : sweet.quantity < 10
                                                                        ? 'text-orange-500'
                                                                        : 'text-green-500'
                                                                }`}
                                                        >
                                                            {sweet.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => setRestockId(sweet.id)}
                                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                                        >
                                                            Restock
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(sweet)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sweet)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && <SweetModal sweet={editingSweet} onClose={handleCloseModal} />}
        </div>
    );
};