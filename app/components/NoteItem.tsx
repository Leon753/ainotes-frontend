import React from "react";
import { Note } from "../hooks/useNotes";

interface NoteItemProps {
  note: Note;
  onDelete: (id: number) => void;
}

export default function NoteItem({ note, onDelete }: NoteItemProps) {
  return (
    <li className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{note.filename}</h2>
        <button
          onClick={() => onDelete(note.id)}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
      <ul className="text-gray-600 dark:text-gray-300 mt-2 space-y-1">
        {note.transcription.split("\n").map((line, index) =>
          line.trim() ? (
            <li key={index} className="ml-4 list-disc">
              {line.replace(/^- /, "")}
            </li>
          ) : null
        )}
      </ul>
    </li>
  );
}
