import React, { useState } from 'react';

const TagInput = ({ tags, setTags, placeholder = 'Add tag...' }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 min-h-[38px]">
      {tags.map((tag, idx) => (
        <span key={idx} className="inline-flex items-center text-xs font-light px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 mr-1 mb-1">
          {tag}
          <button type="button" className="ml-1 text-xs text-blue-400 hover:text-red-500" onClick={() => removeTag(idx)}>&times;</button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[80px] border-none outline-none bg-transparent text-xs font-light py-1 px-1"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TagInput; 