export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <p className="label-mono">Loading</p>
      </div>
    </div>
  );
}