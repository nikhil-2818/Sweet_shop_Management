import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { SearchBar } from '../components/SearchBar';
import { SweetCard } from '../components/SweetCard';
import { useSweetStore } from '../stores/sweetStore';

export const Dashboard = () => {
    const { sweets, fetchSweets, purchaseSweet, searchSweets, isLoading, error } = useSweetStore();
    const [purchaseError, setPurchaseError] = useState('');

    useEffect(() => {
        fetchSweets();
    }, [fetchSweets]);

    const handleSearch = async (params: {
        name?: string;
        category?: string;
        min_price?: number;
        max_price?: number;
    }) => {
        if (Object.keys(params).length === 0) {
            await fetchSweets();
        } else {
            await searchSweets(params);
        }
    };

    const handlePurchase = async (id: number, quantity: number) => {
        setPurchaseError('');
        try {
            await purchaseSweet(id, quantity);
        } catch (err: any) {
            setPurchaseError(err.response?.data?.detail || 'Purchase failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Sweet Shop Dashboard 🍭</h1>
                    <p className="text-gray-600">Browse and purchase your favorite sweets</p>
                </div>

                <SearchBar onSearch={handleSearch} />

                {purchaseError && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {purchaseError}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                    </div>
                ) : sweets.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <div className="text-6xl mb-4">🍬</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No sweets found</h3>
                        <p className="text-gray-600">Try adjusting your search filters or check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sweets.map((sweet) => (
                            <SweetCard key={sweet.id} sweet={sweet} onPurchase={handlePurchase} />
                        ))}
                    </div>
                )}

                {!isLoading && sweets.length > 0 && (
                    <div className="mt-8 text-center text-gray-600">
                        Showing {sweets.length} sweet{sweets.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};
