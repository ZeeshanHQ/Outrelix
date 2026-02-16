import React from 'react';

const SearchFilterBar = ({ search, setSearch, filters, setFilters, barClassName = '', inputClassName = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 mb-4 ${barClassName} justify-center`}>
      <input
        className={`flex-1 min-w-[180px] max-w-md border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-xs font-light py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${inputClassName}`}
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search campaigns..."
        style={{ width: '100%', maxWidth: '340px' }}
      />
      {/* Example filter: status */}
      <select
        className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-xs font-light bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-800 cursor-pointer"
        value={filters.status || ''}
        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        style={{ minWidth: '120px' }}
      >
        <option value="">All Statuses</option>
        <option value="Running">Running</option>
        <option value="Paused">Paused</option>
        <option value="Completed">Completed</option>
      </select>
      {/* Add more filters as needed */}
    </div>
  );
};

export default SearchFilterBar; 