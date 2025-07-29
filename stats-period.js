/*
 * Трекер бессознательного - Управление периодами статистики
 * © 2025 Новак Александр Александрович. Все права защищены.
 */

// stats-period.js
// Управление выбором периода для статистики

const periodButtons = [
  { label: '3 дня', days: 3 },
  { label: '7 дней', days: 7 },
  { label: '14 дней', days: 14 },
  { label: '30 дней', days: 30 },
];

function createPeriodControls(containerId, onChange) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  // Быстрые кнопки
  periodButtons.forEach(btn => {
    const b = document.createElement('button');
    b.textContent = btn.label;
    b.className = 'period-btn';
    b.onclick = () => onChange({ type: 'quick', days: btn.days });
    b.onpointerdown = () => b.classList.add('active');
    b.onpointerup = b.onmouseleave = () => b.classList.remove('active');
    container.appendChild(b);
  });
  // Кастомный диапазон
  const customDiv = document.createElement('div');
  customDiv.className = 'period-custom';
  const from = document.createElement('input');
  from.type = 'date';
  from.className = 'period-date';
  const to = document.createElement('input');
  to.type = 'date';
  to.className = 'period-date';
  const customBtn = document.createElement('button');
  customBtn.textContent = 'Показать';
  customBtn.className = 'period-btn';
  customBtn.onclick = () => {
    if (from.value && to.value) {
      onChange({ type: 'custom', from: from.value, to: to.value });
    }
  };
  customBtn.onpointerdown = () => customBtn.classList.add('active');
  customBtn.onpointerup = customBtn.onmouseleave = () => customBtn.classList.remove('active');
  customDiv.append('c ', from, ' — ', to, customBtn);
  container.appendChild(customDiv);
} 