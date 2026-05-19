import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductAddToCart from '@/components/ProductAddToCart';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

function buildStock(variants: any[]): Record<string, number> {
  return (variants || []).reduce((acc: Record<string, number>, v: any) => {
    acc[String(v.attribute_value)] = v.stock ?? 0;
    return acc;
  }, {});
}

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*, product_variants(attribute_value, stock)');

  const normalized = (products || []).map((p) => ({
    ...p,
    stock: buildStock(p.product_variants || []),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'inherit' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'ПРОДУКТЫ', href: '/products', icon: '📦' },
      ]} />

      <div className="products-grid">
        {normalized.map((product) => (
          <div key={product.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <Link href={`/products/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ position: 'relative', width: '100%', marginBottom: '30px' }}>
                <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 400px"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
              </div>
            </Link>

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
              {product.material}<br />
              {product.delivery}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: 'auto', paddingTop: '15px', alignItems: 'center' }}>
              <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 800 }}>
                [ подробнее ]
              </Link>
              <ProductAddToCart product={product} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
