import { corsHeaders } from '../../lib/cors.ts'

Deno.serve((request: Request): Response => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // TODO: implement
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
})
