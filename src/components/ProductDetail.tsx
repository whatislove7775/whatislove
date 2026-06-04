'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import SmartImage from '@/components/SmartImage';
import { parseTextForLinks } from '@/lib/parseLinks';
import Link from 'next/link';
import ShareButton from '@/components/ShareButton';
import RecentlyViewed from '@/components/RecentlyViewed';

export default function ProductDetail({ product, bottomText }: { product: any; bottomText: string }) {
  const stock: Record<string, number> = product.stock || {};
  const sizes = Object.keys(stock).sort((a, b) => Number(a) - Number(b));
  const firstAvailableSize = sizes.find((s) => (stock[s] || 0) > 0) ?? sizes[0] ?? '17';

  const [selectedSize, setSelectedSize] = useState<string>(firstAvailableSize);
  const [activeImage, setActiveImage] = useState<string | null>(
    product.images?.length > 0 ? product.images[0] : product.image_url || null
  );
  const addItem = useCartStore((state: any) => state.addItem);
  const cartItems = useCartStore((state: any) => state.items);
  const isInCart = cartItems.some((i: any) => i.id === product.id);

  const currentStock = stock[selectedSize] ?? 0;
  const isAvailable = true;
  const isPreorder = !!product.preorder_mode;

  const handleAddToCart = () => {
    if (isAvailable) {
      addItem({ id: product.id, name: product.name, price: product.price, size: Number(selectedSize), quantity: 1, imageUrl: product.image_url || undefined });
    }
  };

  const deliveryText = product.delivery || '';
  const deliveryParts = deliveryText.split('+');
  const deliveryMain = deliveryParts[0] || '';
  const deliveryExtra = deliveryParts[1] ? `+${deliveryParts[1]}` : '';

  const InfoRow = ({ label, value, isBold = false, isRed = false }: any) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
      <span style={{ fontWeight: 800 }}>{label}</span>
      <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isBold ? 800 : 500, color: isRed ? '#d32f2f' : '#000', textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'ПРОДУКТЫ', href: '/products', icon: '📦' },
          { name: product.name.toLowerCase(), icon: '💍' },
        ]} />
      </div>

      <div className="product-page-layout">
        {/* Галерея */}
        <div className="product-gallery">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div className="share-img-wrap" style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
                {activeImage && (
                  <SmartImage
                    src={activeImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                )}
                {/* Share icon — hover on desktop, always visible on mobile */}
                <ShareButton name={product.name} slug={product.slug} iconMode />
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '55px', marginTop: '15px' }}>
            {[0, 1, 2, 3].map((i) => {
              const imgUrl = product.images ? product.images[i] : null;
              const isActive = activeImage === imgUrl;
              return (
                <div
                  key={i}
                  onClick={() => imgUrl && setActiveImage(imgUrl)}
                  style={{
                    position: 'relative',
                    width: '55px',
                    height: '55px',
                    flexShrink: 0,
                    backgroundColor: '#e5e5e5',
                    overflow: 'hidden',
                    cursor: imgUrl ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease-in-out',
                    transform: isActive && imgUrl ? 'scale(1.15)' : 'scale(1)',
                    zIndex: isActive ? 10 : 1,
                  }}
                >
                  {imgUrl && (
                    <SmartImage src={imgUrl} alt="" fill sizes="55px" style={{ objectFit: 'cover' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Инфо */}
        <div className="product-info">
          <InfoRow label="наименование" value={product.name.toLowerCase()} isBold />

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <span style={{ fontWeight: 800 }}>цена</span>
            <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
              ..........................................................................................................................................................................................
            </div>
            <div style={{ display: 'flex', gap: '10px', fontWeight: 800 }}>
              {product.oldPrice && <span style={{ color: '#999', textDecoration: 'line-through' }}>{product.oldPrice}</span>}
              <span style={{ color: '#d32f2f' }}>{product.price} руб</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>................................................................................</div>
            <span style={{ margin: '0 10px', fontWeight: 500 }}>сделано с любовью</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>................................................................................</div>
          </div>

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <InfoRow label="материал" value={product.material} />

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <InfoRow label="доставка" value={deliveryMain} />
          {deliveryExtra && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>............................................................................................................................</div>
              <span style={{ fontWeight: 500, paddingLeft: '8px' }}>{deliveryExtra}</span>
            </div>
          )}

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>................................................................................</div>
            <span style={{ margin: '0 10px', fontWeight: 800 }}>выбери размер ниже</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>................................................................................</div>
          </div>

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '20px' }}>
            ..........................................................................................................................................................................................
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 800, alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <span
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    margin: '0 8px',
                  }}
                >
                  {isSelected ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f', border: '1.5px solid #d32f2f', borderRadius: '50%', minWidth: '26px', height: '26px', padding: '0 4px' }}>
                      {size}
                    </span>
                  ) : (
                    `[ ${size} ]`
                  )}
                </span>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <div style={{ fontWeight: 500, lineHeight: 1.4, fontSize: '14px', whiteSpace: 'pre-line' }}>
              {parseTextForLinks(bottomText)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              {isPreorder ? (
                /* Режим предзаказа — ведём на отдельную страницу */
                <Link
                  href={`/products/${product.slug}/preorder`}
                  style={{ fontWeight: 800, fontSize: '14px', color: '#000' }}
                >
                  [ предзаказать ]
                </Link>
              ) : (
                <>
                  {/* Desktop: кнопка добавить */}
                  <button
                    className="desktop-only"
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontWeight: 800,
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                      padding: 0,
                      fontSize: '14px',
                      color: isAvailable ? '#000' : '#d32f2f',
                      textDecoration: isAvailable ? 'none' : 'line-through',
                    }}
                  >
                    {isAvailable ? "[ +добавить в 🛒'y ]" : '[ нет в наличии ]'}
                  </button>

                  {/* Mobile: меняется после добавления */}
                  {!isAvailable ? (
                    <span className="mobile-only" style={{ fontWeight: 800, fontSize: '14px', color: '#d32f2f', textDecoration: 'line-through' }}>
                      [ нет в наличии ]
                    </span>
                  ) : isInCart ? (
                    <Link href="/checkout" className="mobile-only" style={{ fontWeight: 800, fontSize: '14px', color: '#000' }}>
                      [перейти к 🛒&apos;е]
                    </Link>
                  ) : (
                    <button
                      className="mobile-only"
                      onClick={handleAddToCart}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        padding: 0,
                        fontSize: '14px',
                      }}
                    >
                      [ +добавить в 🛒&apos;y ]
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <RecentlyViewed current={{
        slug: product.slug,
        name: product.name,
        image: (product.images?.[0]) || product.image_url || null,
        price: product.price,
      }} />
    </div>
  );
}
