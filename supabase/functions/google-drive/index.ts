
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract file data from request
    const { file, userId } = await req.json()

    // Initialize Google Drive API client
    const credentials = {
      client_id: Deno.env.get('GOOGLE_DRIVE_CLIENT_ID'),
      client_secret: Deno.env.get('GOOGLE_DRIVE_SECRET'),
    }

    // Upload file to Google Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        mimeType: file.type,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to upload file to Google Drive')
    }

    const driveFile = await response.json()

    // Store file metadata in Supabase
    const { error: dbError } = await supabase
      .from('google_drive_files')
      .insert({
        user_id: userId,
        file_id: driveFile.id,
        filename: file.name,
        mime_type: file.type,
        web_view_link: driveFile.webViewLink,
      })

    if (dbError) {
      console.error('Error storing file metadata:', dbError)
      throw new Error('Failed to store file metadata')
    }

    return new Response(
      JSON.stringify({ success: true, file: driveFile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
