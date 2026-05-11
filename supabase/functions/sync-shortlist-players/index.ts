// TODO: Edge Function to sync shortlist player data from external APIs
// This will be implemented when the shortlists feature is built

Deno.serve(async (_req) => {
  return new Response(JSON.stringify({ message: "Not yet implemented" }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
});
