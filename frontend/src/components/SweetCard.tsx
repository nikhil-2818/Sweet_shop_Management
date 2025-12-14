import { useState } from 'react';
import type { Sweet } from '../types';

interface SweetCardProps {
    sweet: Sweet;
    onPurchase: (id: number, quantity: number) => void;
}

export const SweetCard = ({ sweet, onPurchase }: SweetCardProps) => {
    const [quantity, setQuantity] = useState(1);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchase = async () => {
        setIsPurchasing(true);
        try {
            await onPurchase(sweet.id, quantity);
            setQuantity(1);
        } finally {
            setIsPurchasing(false);
        }
    };

    const isOutOfStock = sweet.quantity === 0;
    const isLowStock = sweet.quantity > 0 && sweet.quantity < 10;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* IMAGE SECTION - REPLACED THE GRADIENT DIV */}
            {sweet.image_url ? (
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={`http://localhost:8000${sweet.image_url}`}
                        alt={sweet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to candy emoji if image fails to load
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                parent.className = 'bg-gradient-to-br from-purple-400 to-pink-400 h-48 flex items-center justify-center';
                                parent.innerHTML = '<span class="text-6xl">🍬</span>';
                            }
                        }}
                    />
                </div>
            ) : (
                <div className="bg-gradient-to-br from-purple-400 to-pink-400 h-48 flex items-center justify-center">
                    <span className="text-6xl">🍬</span>
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{sweet.name}</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold capitalize">
                        {sweet.category}
                    </span>
                </div>

                {sweet.description && (
                    <p className="text-gray-600 text-sm mb-4">{sweet.description}</p>
                )}

                <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                        ${sweet.price.toFixed(2)}
                    </span>
                    <span
                        className={`text-sm font-semibold ${isOutOfStock
                                ? 'text-red-500'
                                : isLowStock
                                    ? 'text-orange-500'
                                    : 'text-green-500'
                            }`}
                    >
                        {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} in stock`}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        min="1"
                        max={sweet.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={isOutOfStock}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    />
                    <button
                        onClick={handlePurchase}
                        disabled={isOutOfStock || isPurchasing || quantity > sweet.quantity}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isPurchasing ? 'Purchasing...' : isOutOfStock ? 'Out of Stock' : 'Purchase'}
                    </button>
                </div>
            </div>
        </div>
    );
};