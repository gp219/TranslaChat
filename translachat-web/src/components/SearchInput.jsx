import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ 
    placeholder = "Search...", 
    delay = 300, 
    onSearch 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // --- 1. Debouncing Logic ---
    useEffect(() => {
        // Set up a timer (debounce)
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, delay);

        // Cleanup: Clear the previous timer if the search term changes before 'delay' passes
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, delay]);

    // --- 2. Callback Execution ---
    // When the debounced term changes, call the parent component's onSearch function
    useEffect(() => {
        onSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, onSearch]);
    
    // --- 3. Render Input ---
    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
        </div>
    );
};

export default SearchInput;