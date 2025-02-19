export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">AI Notes</h1>
      <p className="text-gray-600 mt-2">Transcribe and manage your audio notes.</p>
      <a
        href="/notes"
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        View Notes
      </a>
    </div>
  );
}
