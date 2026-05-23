import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: orders } = await db().from('order_notifications').select('order_data, created_at');
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
    totalRevenue += paid;
    const createdAt = new Date(row.created_at);
    if (createdAt >= startOfMonth) {
      monthRevenue += paid;
      monthOrders++;
    }
    for (const item of o?.items ?? []) {
      if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
      productSales[item.id].qty += item.quantity;
      productSales[item.id].revenue += item.price * item.quantity;
    }
  }

  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const recent = all.slice(0, 5).map(r => ({ ...r.order_data, created_at: r.created_at }));

  return NextResponse.json({
    totalOrders: all.length,
    totalRevenue,
    monthOrders,
    monthRevenue,
    topProducts,
    recent,
  });
}
