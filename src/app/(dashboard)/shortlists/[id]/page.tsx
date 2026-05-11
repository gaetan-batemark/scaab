export default async function ShortlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Détail Shortlist</h1>
      <p>Shortlist ID: {id}</p>
      {/* TODO: implement */}
    </div>
  );
}
