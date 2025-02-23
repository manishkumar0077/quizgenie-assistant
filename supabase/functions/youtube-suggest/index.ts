
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
    const { query, userId, documentId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Search YouTube videos
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${Deno.env.get('YOUTUBE_API_SECRET')}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!searchResponse.ok) {
      throw new Error('Failed to fetch YouTube videos')
    }

    const videos = await searchResponse.json()

    // Store video suggestions in Supabase
    const suggestions = videos.items.map((video: any) => ({
      user_id: userId,
      document_id: documentId,
      title: video.snippet.title,
      video_id: video.id.videoId,
      thumbnail_url: video.snippet.thumbnails.default.url,
      description: video.snippet.description,
    }))

    const { error: dbError } = await supabase
      .from('video_suggestions')
      .insert(suggestions)

    if (dbError) {
      console.error('Error storing video suggestions:', dbError)
      throw new Error('Failed to store video suggestions')
    }

    return new Response(
      JSON.stringify({ success: true, videos: suggestions }),
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
