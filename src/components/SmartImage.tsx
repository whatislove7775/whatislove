'use client';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type Props = Omit<ImageProps, 'src'> & { src: string };

export default function SmartImage({ src, alt, onLoad, style, quality, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);
  const isGif = typeof src === 'string' && src.toLowerCase().endsWith('.gif');

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    if (typeof onLoad === 'function') onLoad(e);
  };

  if (isGif) {
    const { fill, className, width, height } = props;

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

  return (
    <>
      {!loaded && props.fill && (
        <div className="img-skeleton" />
      )}
      <Image
        src={src}
        alt={alt}
        quality={quality ?? 72}
        style={style}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
}
