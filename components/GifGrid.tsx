import Image from 'next/image';

export interface GifGridImage {
  gifLink: string;
}
interface GifGridProps {
  images: GifGridImage[] | null;
}

export const GifGrid: React.FC<GifGridProps> = ({ images }) => {
  return (
    <div
      sx={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: [null, '1fr', '1fr 1fr', 'repeat(3, 1fr)'],
        '& > *': { borderRadius: '0.75rem' },
      }}
    >
      {images?.map(({ gifLink }, index) => {
        let url = gifLink;
        if (!gifLink.includes('media.giphy.com')) {
          url = 'https://http.cat/406';
        }

        return (
          <Image
            key={index}
            src={url}
            width={500}
            height={300}
            layout="responsive"
            alt="gif"
          />
        );
      })}
    </div>
  );
};
