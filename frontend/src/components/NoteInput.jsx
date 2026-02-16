import React from 'react';

const NoteInput = ({ note, onNoteChange, placeholder = 'Add a note...' }) => (
  <textarea
    className="w-full min-h-[36px] border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs font-light resize-none focus:ring-2 focus:ring-blue-200"
    value={note}
    onChange={e => onNoteChange(e.target.value)}
    placeholder={placeholder}
    rows={2}
  />
);

export default NoteInput; 