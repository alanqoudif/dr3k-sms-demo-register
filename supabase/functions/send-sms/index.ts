
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
    
    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout
    
    try {
      const response = await fetch('https://automapi.com/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const result = await response.text()
      console.log('Automapi response:', result, 'Status:', response.status)

      // Check if response is successful
      if (response.ok) {
        return new Response(
          JSON.stringify({ ok: true, message: 'SMS sent successfully' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        // Log the error response for debugging
        console.error('Automapi error response:', result)
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: `SMS service error: ${response.status}. Please try again later.` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Fetch error:', fetchError)
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            ok: false, 
            error: 'Request timeout. Please check your connection and try again.' 
          }),
          { 
            status: 408, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      throw fetchError
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Service temporarily unavailable. Please try again later.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
