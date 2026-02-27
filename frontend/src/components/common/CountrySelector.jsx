import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';

const countries = [
    { name: 'Afghanistan', code: 'AF' },
    { name: 'Albania', code: 'AL' },
    { name: 'Algeria', code: 'DZ' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Australia', code: 'AU' },
    { name: 'Austria', code: 'AT' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Canada', code: 'CA' },
    { name: 'Chile', code: 'CL' },
    { name: 'China', code: 'CN' },
    { name: 'Colombia', code: 'CO' },
    { name: 'Czech Republic', code: 'CZ' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Egypt', code: 'EG' },
    { name: 'Finland', code: 'FI' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'Ghana', code: 'GH' },
    { name: 'Greece', code: 'GR' },
    { name: 'Hong Kong', code: 'HK' },
    { name: 'Hungary', code: 'HU' },
    { name: 'India', code: 'IN' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Iran', code: 'IR' },
    { name: 'Iraq', code: 'IQ' },
    { name: 'Ireland', code: 'IE' },
    { name: 'Israel', code: 'IL' },
    { name: 'Italy', code: 'IT' },
    { name: 'Japan', code: 'JP' },
    { name: 'Jordan', code: 'JO' },
    { name: 'Kazakhstan', code: 'KZ' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Kuwait', code: 'KW' },
    { name: 'Lebanon', code: 'LB' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Morocco', code: 'MA' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'New Zealand', code: 'NZ' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Norway', code: 'NO' },
    { name: 'Oman', code: 'OM' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Peru', code: 'PE' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Poland', code: 'PL' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Qatar', code: 'QA' },
    { name: 'Romania', code: 'RO' },
    { name: 'Russia', code: 'RU' },
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'Singapore', code: 'SG' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Spain', code: 'ES' },
    { name: 'Sri Lanka', code: 'LK' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Taiwan', code: 'TW' },
    { name: 'Thailand', code: 'TH' },
    { name: 'Turkey', code: 'TR' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'United States', code: 'US' },
    { name: 'Vietnam', code: 'VN' },
    { name: 'Global', code: 'GL' },
];

const CountrySelector = ({ value, onChange, placeholder = "Select target country" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    const selectedCountry = countries.find(c => c.name === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen]);

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().startsWith(search.toLowerCase()) ||
        c.code.toLowerCase().startsWith(search.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-base transition-all duration-200 border ${isOpen
                        ? 'bg-white border-blue-400 ring-2 ring-blue-100 shadow-lg'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {selectedCountry ? (
                        <>
                            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-[10px] font-black text-white tracking-tight">{selectedCountry.code}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{selectedCountry.name}</span>
                        </>
                    ) : (
                        <span className="text-slate-400 font-medium">{placeholder}</span>
                    )}
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                        style={{ maxHeight: '400px' }}
                    >
                        {/* Search */}
                        <div className="p-3 border-b border-slate-100">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Type to filter..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => {
                                    const isSelected = value === country.name;
                                    return (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => {
                                                onChange(country.name);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-100 ${isSelected
                                                    ? 'bg-blue-50 border-l-2 border-blue-500'
                                                    : 'hover:bg-slate-50 border-l-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-6 w-6 rounded flex items-center justify-center text-[9px] font-black tracking-tight ${isSelected
                                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {country.code}
                                                </div>
                                                <span className={`text-sm ${isSelected ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}`}>
                                                    {country.name}
                                                </span>
                                            </div>
                                            {isSelected && <CheckIcon className="h-4 w-4 text-blue-500" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-slate-400 font-medium">No countries match "{search}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CountrySelector;
