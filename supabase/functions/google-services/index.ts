
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "npm:googleapis@126.0.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CLIENT_ID = '131798361774-d83e3g689oomk3kgqpdb2kfmhkh1dir0.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'http://localhost:5173/callback'

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

const drive = google.drive({ version: 'v3', auth: oauth2Client })
const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()

    switch (action) {
      case 'uploadFile':
        const { name, content, mimeType } = payload
        const fileMetadata = {
          name: name,
        }

        const media = {
          mimeType: mimeType,
          body: content
        }

        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id'
        })

        return new Response(
          JSON.stringify({ fileId: file.data.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'searchVideos':
        const { query } = payload
        const response = await youtube.search.list({
          part: ['snippet'],
          q: query,
          maxResults: 3,
          type: ['video']
        })

        return new Response(
          JSON.stringify({ videos: response.data.items }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }
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
