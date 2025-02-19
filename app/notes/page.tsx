"use client";

import { useEffect, useState } from "react";

interface Note {
  id: number;
  filename: string;
  transcription: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;


  useEffect(() => {
    async function getToken() {
      let savedToken = localStorage.getItem("auth_token");

      if (!savedToken) {
        try {
          const res = await fetch(`${API_URL}/generate-token`, { method: "POST" });
          if (!res.ok) throw new Error("Failed to generate token");
          const data = await res.json();
          savedToken = data.token;
          localStorage.setItem("auth_token", savedToken ?? "");
        } catch (err) {
          console.error("Token Error:", err);
          setError("Failed to generate authentication token");
          return;
        }
      }

      setToken(savedToken);
    }

    getToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchNotes() {
      try {
        const res = await fetch(`${API_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch notes");
        const data: Note[] = await res.json();
        setNotes(data);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    fetchNotes();
  }, [token]);

  async function deleteNote(id: number) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting note");
    }
  }

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

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const newNote = await res.json();
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Transcriptions</h1>

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

          {error && <p className="text-red-500 mt-4">{error}</p>}

          <ul className="mt-6 space-y-4">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-center">No transcriptions yet. Upload a file!</p>
            ) : (
              notes.map((note, index) => (
                <li
                  key={note.id ?? index}
                  className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900 dark:text-white"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{note.filename}</h2>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
              
                  {/* ✅ Fixed the <li> issue by wrapping in <ul> */}
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
              ))
            )}
          </ul>
        </>
      ) : (
        <p className="text-gray-500 text-center">Generating authentication token...</p>
      )}
    </div>
  );
}
