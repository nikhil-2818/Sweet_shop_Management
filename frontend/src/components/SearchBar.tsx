import { useState } from 'react';

interface SearchBarProps {
    onSearch: (params: {
        name?: string;
        category?: string;
        min_price?: number;
        max_price?: number;
    }) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSearch = () => {
        onSearch({
            name: name || undefined,
            category: category || undefined,
            min_price: minPrice ? parseFloat(minPrice) : undefined,
            max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        });
    };

    const handleClear = () => {
        setName('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        onSearch({});
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                    type="text"
                    placeholder="Category..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                    type="number"
                    placeholder="Min price..."
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                    type="number"
                    placeholder="Max price..."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
            <div className="flex space-x-3 mt-4">
                <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition font-medium"
                >
                    Search
                </button>
                <button
                    onClick={handleClear}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};
