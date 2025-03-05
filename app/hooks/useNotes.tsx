"use client";

import { useState, useEffect } from "react";

export interface Note {
  id: number;
  filename: string;
  transcription: string;
}

export function useNotes(token: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  }, [token, API_URL]);

  async function deleteNote(id: number) {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting note");
    }
  }

  async function uploadNote(file: File) {
    if (!token) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  }

  return { notes, loading, error, deleteNote, uploadNote };
}
