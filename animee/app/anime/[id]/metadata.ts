import { getAnimeFullById } from '@/lib/anilist';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const anime = await getAnimeFullById(Number(id));
    
    // Optionally access parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: `${anime.data.title} | Watch on Anirealm`,
      description: anime.data.synopsis ? anime.data.synopsis.substring(0, 160) + '...' : 'Watch this anime on Anirealm.',
      openGraph: {
        images: [anime.data.images.jpg.large_image_url || anime.data.images.jpg.image_url, ...previousImages],
        title: anime.data.title,
        description: anime.data.synopsis?.substring(0, 100),
      },
    }
  } catch (error) {
    return {
      title: 'Anime Details | Anirealm',
      description: 'Discover great anime on Animee'
    }
  }
}
