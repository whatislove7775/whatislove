import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductAddToCart from '@/components/ProductAddToCart';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage';
import CollabButton from '@/components/CollabButton';

export const revalidate = 60;

export const metadata = {
  title: 'Магазин',
  description: 'Дизайнерские изделия от студии whatislove — авторские товары с доставкой.',
  openGraph: {
    title: 'Магазин | WH4T!SLOV3',
    description: 'Дизайнерские изделия от студии whatislove — авторские товары с доставкой.',
  },
};

function buildStock(variants: any[]): Record<string, number> {
  return (variants || []).reduce((acc: Record<string, number>, v: any) => {
    acc[String(v.attribute_value)] = v.stock ?? 0;
    return acc;
  }, {});
}

function sortByOrder<T extends { id: any }>(rows: T[], orderMap: Map<any, number | null>): T[] {
  return [...rows].sort((a, b) => {
    const oa = orderMap.get(a.id), ob = orderMap.get(b.id);
    if (oa == null && ob == null) return 0;
    if (oa == null) return 1;
    if (ob == null) return -1;
    return oa - ob;
  });
}

export default async function ProductsPage() {
  const [{ data: products }, { data: orderRows }] = await Promise.all([
    supabase
      .from('products')
      .select('id, slug, name, price, oldPrice, material, delivery, image_url, preorder_mode, product_variants(attribute_value, stock)'),
    // Отдельный лёгкий запрос за ручным порядком сортировки — если колонка sort_order ещё
    // не добавлена в БД (миграция не выполнена), просто вернётся ошибка и сортировка не изменится.
    supabase.from('products').select('id, sort_order'),
  ]);

  const orderMap = new Map((orderRows ?? []).map((r: any) => [r.id, r.sort_order]));

  const normalized = sortByOrder((products || []).map((p) => ({
    ...p,
    stock: buildStock(p.product_variants || []),
  })), orderMap);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'inherit' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'МАГАЗИН', href: '/products', icon: '📦' },
      ]} />

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
        <CollabButton />
      </div>

      <div className="products-grid">
        {normalized.map((product, index) => (
          <div key={product.id} className="product-card" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

            {/* Image column */}
            <div className="product-card-image-col" style={{ width: '100%' }}>
              <Link href={`/products/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative', width: '100%', marginBottom: '30px' }}>
                  <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                  <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                  <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                  <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
                    {product.image_url && (
                      <SmartImage
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 44vw, (max-width: 1000px) 50vw, 400px"
                        style={{ objectFit: 'cover' }}
                        priority={index < 4}
                      />
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Info column */}
            <div className="product-card-info-col" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

              {/* Desktop layout */}
              <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 800 }}>
                  <div style={{ fontSize: '18px' }}>{product.name.toLowerCase()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: '#d32f2f' }}>{product.price} руб</span>
                    {product.oldPrice && (
                      <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>{product.oldPrice} руб</span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '14px', marginTop: '5px', fontWeight: 500 }}>
                  {product.material}<br />{product.delivery}
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: 'auto', paddingTop: '15px', alignItems: 'center' }}>
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 800 }}>
                    [ подробнее ]
                  </Link>
                  <ProductAddToCart product={product} />
                </div>
              </div>

              {/* Mobile layout */}
              <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>{product.name.toLowerCase()}</div>
                <div style={{ fontWeight: 800, marginTop: '2px' }}>
                  {product.oldPrice && (
                    <div style={{ fontSize: '13px', textDecoration: 'line-through', color: '#999' }}>{product.oldPrice} руб</div>
                  )}
                  <span style={{ color: '#d32f2f' }}>{product.price} руб</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4, marginTop: '2px' }}>
                  {product.material}<br />{product.delivery}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <ProductAddToCart product={product} />
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
