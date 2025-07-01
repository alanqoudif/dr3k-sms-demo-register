
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

    // Remove the + from phone number if it exists
    const cleanPhone = phone.replace(/^\+/, '')

    // Automapi credentials and payload
    const payload = {
      number: cleanPhone,
      type: "text",
      message: "تم تسجيلك بنجاح في خدمة DR3K. شكرًا لك!",
      instance_id: "6848073DE839C",
      access_token: "660f1622e1665"
    }

    console.log('Sending SMS to:', cleanPhone)
    
    // Try multiple times with different timeouts
    let lastError = null
    const maxRetries = 2
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${maxRetries}`)
        
        const controller = new AbortController()
        const timeoutDuration = attempt === 1 ? 8000 : 15000 // First attempt 8s, second 15s
        const timeoutId = setTimeout(() => controller.abort(), timeoutDuration)
        
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
        console.log(`Attempt ${attempt} - Automapi response:`, result, 'Status:', response.status)

        // Check if response is successful
        if (response.ok || response.status === 200) {
          return new Response(
            JSON.stringify({ ok: true, message: 'SMS sent successfully' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else {
          lastError = `HTTP ${response.status}: ${result}`
          console.error(`Attempt ${attempt} failed:`, lastError)
          
          // If this is the last attempt, return error
          if (attempt === maxRetries) {
            break
          }
          
          // Wait before retry (only if not the last attempt)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (fetchError) {
        console.error(`Attempt ${attempt} error:`, fetchError)
        lastError = fetchError
        
        if (fetchError.name === 'AbortError') {
          console.log(`Attempt ${attempt} timed out`)
          if (attempt === maxRetries) {
            return new Response(
              JSON.stringify({ 
                ok: false, 
                error: 'طلب إرسال الرسالة انتهت صلاحيته. يرجى المحاولة مرة أخرى.' 
              }),
              { 
                status: 408, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          // For other errors, don't retry
          break
        }
      }
    }
    
    // If we get here, all attempts failed
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'خدمة الرسائل النصية غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
