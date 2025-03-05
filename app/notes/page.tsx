"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNotes } from "../hooks/useNotes";
import NoteItem from "../components/NoteItem";

export default function NotesPage() {
  const { token, error: authError } = useAuth();
  const { notes, loading, error, deleteNote, uploadNote } = useNotes(token);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    await uploadNote(selectedFile);
    setSelectedFile(null);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Your Transcriptions
      </h1>

      {token ? (
        <>
          <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-md">
            <input
              type="file"
              onChange={handleFileChange}
              className="mb-4 block w-full text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
            <button
              onClick={handleUpload}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Transcribing..." : "Upload & Get Notes"}
            </button>
          </div>

          {(authError || error) && (
            <p className="text-red-500 mt-4">{authError || error}</p>
          )}

          <ul className="mt-6 space-y-4">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-center">
                No transcriptions yet. Upload a file!
              </p>
            ) : (
              notes.map((note) => (
                <NoteItem key={note.id} note={note} onDelete={deleteNote} />
              ))
            )}
          </ul>
        </>
      ) : (
        <p className="text-gray-500 text-center">
          Generating authentication token...
        </p>
      )}
    </div>
  );
}
