
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, phone } = await req.json()
    
    if (!name || !phone) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Name and phone are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Automapi credentials (kept secure on server)
    const payload = {
      number: phone,
      type: "text",
      message: "تم تسجيلك بنجاح في خدمة DR3K. شكرًا لك!",
      instance_id: "6848073DE839C",
      access_token: "660f1622e1665"
    }

    console.log('Sending SMS to:', phone)
    
    const response = await fetch('https://automapi.com/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.text()
    console.log('Automapi response:', result, 'Status:', response.status)

    if (response.ok) {
      return new Response(
        JSON.stringify({ ok: true, message: 'SMS sent successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to send SMS' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
