import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: orders } = await db()
    .from('order_notifications')
    .select('order_data, created_at')
    .order('created_at', { ascending: false });

  const all = orders ?? [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalRevenue = 0;
  let monthRevenue = 0;
  let monthOrders = 0;
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};

  for (const row of all) {
    const o = row.order_data;
    const paid = Number(o?.totalPaid ?? 0);
    if (!paid) continue; // пропускаем записи без суммы (битые тесты)
    totalRevenue += paid;
    if (new Date(row.created_at) >= startOfMonth) {
      monthRevenue += paid;
      monthOrders++;
    }
    for (const item of o?.items ?? []) {
      const key = item.id ?? item.name;
      if (!key) continue;
      if (!productSales[key]) productSales[key] = { name: item.name, qty: 0, revenue: 0 };
      productSales[key].qty += Number(item.quantity) || 0;
      productSales[key].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
    }
  }

  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
  // all уже отсортирован по created_at DESC
  const recent = all.slice(0, 5).map(r => ({ ...r.order_data, created_at: r.created_at }));

  return NextResponse.json({
    totalOrders: all.filter(r => Number(r.order_data?.totalPaid) > 0).length,
    totalRevenue,
    monthOrders,
    monthRevenue,
    topProducts,
    recent,
  });
}
