import Image, { ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'src'> & { src: string };

// Renders a plain <img> for .gif files (preserves animation),
// and Next.js <Image> (optimized) for everything else.
export default function SmartImage({ src, alt, ...props }: Props) {
  const isGif = typeof src === 'string' && src.toLowerCase().endsWith('.gif');

  if (isGif) {
    const { fill, style, className, width, height } = props;

    if (fill) {
      return (
        <img
          src={src}
          alt={alt as string}
          className={className}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: (style as React.CSSProperties)?.objectFit ?? 'cover',
            ...(style as React.CSSProperties),
          }}
        />
      );
    }

    return (
      <img
        src={src}
        alt={alt as string}
        width={width as number}
        height={height as number}
        className={className}
        style={style as React.CSSProperties}
      />
    );
  }

  return <Image src={src} alt={alt} {...props} />;
}
