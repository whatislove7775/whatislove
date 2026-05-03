// ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ
<div style={{ display: 'flex', gap: '20px', flexShrink: 0, width: '480px', height: '450px' }}> 
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
    {/* Контейнер с фото */}
    <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
      <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
      <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
      <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
    </div>
    <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
  </div>

  {/* Колонка миниатюр: теперь ровно по высоте большого фото */}
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', // Распределяем квадраты по всей высоте
    width: '80px', 
    height: '450px', // Высота совпадает с контейнером фото
    paddingTop: '15px', // Чтобы первый квадрат был на уровне верхнего края фото
    paddingBottom: '30px' // Учитываем подпись снизу, чтобы низ тоже сошелся
  }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
    ))}
  </div>
</div>
