{/* Контейнер товара в корзине */}
<div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'flex-start' }}>
  
  {/* Блок с фото и крестиками по углам */}
  <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
    <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
    <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
    
    <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }}>
      {/* Сюда потом вставишь <img src="..." /> */}
    </div>
  </div>

  {/* Инфо о товаре */}
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '15px' }}>
      кольцо &lt;3 
      <span style={{ fontWeight: 500, fontSize: '14px' }}>{item.quantity} [+] [-]</span>
    </div>
    
    {/* Цены: Серая зачеркнутая (оригинал) и Черная со скидкой */}
    <div style={{ marginTop: '8px', fontSize: '16px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <span style={{ color: '#999', textDecoration: 'line-through', fontWeight: 800 }}>
        {item.quantity * 3600}₽
      </span>
      <span style={{ fontWeight: 800 }}>
        {item.quantity * item.price}₽ со скидкой
      </span>
    </div>

    <div style={{ marginTop: '10px', fontWeight: 500, fontSize: '14px', lineHeight: 1.4 }}>
      хирургическая сталь<br />
      размер:<br />
      <span style={{ fontWeight: 800, display: 'inline-block', marginTop: '4px' }}>
        {/* Имитация выбора размеров как на макете */}
        [16][<span style={{ color: '#d32f2f' }}>({item.size})</span>][18][19]
      </span>
    </div>
  </div>

</div>
