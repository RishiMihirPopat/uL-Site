import { getArchivedEvents } from '@/lib/db';

export async function GET() {
  const events = getArchivedEvents().map(event => {
    let tags: string[] = [];
    try {
      tags = typeof event.archive_tags === 'string' ? JSON.parse(event.archive_tags) : (event.archive_tags || []);
    } catch {
      tags = [];
    }

    let youtubeUrls: string[] = [];
    try {
      youtubeUrls = typeof event.youtube_urls === 'string' ? JSON.parse(event.youtube_urls) : (event.youtube_urls || []);
    } catch {
      youtubeUrls = [];
    }

    let substackUrls: string[] = [];
    try {
      substackUrls = typeof event.substack_urls === 'string' ? JSON.parse(event.substack_urls) : (event.substack_urls || []);
    } catch {
      substackUrls = [];
    }

    return {
      id: event.id,
      date: event.date,
      title: event.title,
      venue: event.venue,
      speaker: event.speaker,
      description: event.description,
      image: event.archive_image || event.image,
      tags: Array.isArray(tags) ? tags : [],
      specialBadge: event.archive_badge || undefined,
      category: event.category,
      urbanautUrl: event.urbanaut_url,
      youtubeUrls: Array.isArray(youtubeUrls) ? youtubeUrls : [],
      substackUrls: Array.isArray(substackUrls) ? substackUrls : [],
    };
  });

  return Response.json(events);
}
