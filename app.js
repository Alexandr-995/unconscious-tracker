/*
 * Трекер бессознательного
 * © 2025 Новак Александр Александрович. Все права защищены.
 * 
 * Веб-приложение для анализа негативных мыслей
 * на основе транзактного анализа Эрика Берна
 */

console.log('App.js загружен');

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker зарегистрирован:', registration);
      })
      .catch((error) => {
        console.log('Ошибка регистрации Service Worker:', error);
      });
  });
}

// --- Навигация между страницами ---
const mainPage = document.getElementById('main-page');
const formPage = document.getElementById('form-page');
const statsPage = document.getElementById('stats-page');
const guidePage = document.getElementById('guide-page');
const profilePage = document.getElementById('profile-page');
const navMain = document.getElementById('nav-main');
const navStats = document.getElementById('nav-stats');
const navProfile = document.getElementById('nav-profile');
const navGuide = document.getElementById('nav-guide');
const navFeedback = document.getElementById('nav-feedback');
const addThoughtBtn = document.getElementById('add-thought-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const saveThoughtBtn = document.getElementById('save-thought-btn');
const thoughtInput = document.getElementById('thought-input');

// --- Модальное окно ---
const thoughtModal = document.getElementById('thought-modal');
const closeModal = document.getElementById('close-modal');
const successNotification = document.getElementById('success-notification');
const modalSaveBtn = document.getElementById('modal-save-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// --- Переменные модального окна редактирования ---
const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileBtn = document.getElementById('edit-profile-btn');
const closeEditProfileModal = document.getElementById('close-edit-profile-modal');
const saveProfileChangesBtn = document.getElementById('save-profile-changes-btn');
const cancelProfileEditBtn = document.getElementById('cancel-profile-edit-btn');

// --- Calendar Page ---
const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

function showPage(page) {
  [mainPage, formPage, guidePage, statsPage, profilePage].forEach(p => p.classList.remove('active'));
  
  // Управление навбаром для разных страниц
  const navbar = document.querySelector('.navbar');
  if (page === statsPage) {
    navbar.style.display = 'none';
    if (!document.getElementById('stats-navbar')) {
      const statsNavbar = document.createElement('div');
      statsNavbar.id = 'stats-navbar';
      statsNavbar.className = 'stats-navbar';
      statsNavbar.innerHTML = `
        <span class="logo">Трекер бессознательного</span>
        <div class="stats-nav-buttons">
          <button id="stats-nav-main" class="nav-btn">Главная</button>
          <button id="stats-nav-profile" class="nav-btn">Профиль</button>
          <button id="stats-nav-guide" class="nav-btn">Справочник</button>
          <button id="stats-nav-stats" class="nav-btn active">Статистика</button>
          <button id="stats-nav-feedback" class="nav-btn">Обратная связь</button>
        </div>
      `;
      statsPage.insertBefore(statsNavbar, statsPage.firstChild);
      
      // Обработчики для stats-navbar
      document.getElementById('stats-nav-main').onclick = () => showPage(mainPage);
      document.getElementById('stats-nav-profile').onclick = () => { 
        showPage(profilePage); 
        setTimeout(() => {
          renderProfile();
          console.log('renderProfile() вызван из stats-navbar');
        }, 100);
      };
      document.getElementById('stats-nav-guide').onclick = () => showPage(guidePage);
      document.getElementById('stats-nav-feedback').onclick = () => openFeedbackModal();
      document.getElementById('stats-nav-stats').onclick = () => {
        setTimeout(() => {
          renderStats(currentPeriod);
        }, 100);
      };
    }
    // Принудительно перерисовываем статистику через задержку
    setTimeout(() => {
      if (typeof renderStats === 'function') {
        renderStats(currentPeriod);
      }
    }, 150);
  } else {
    navbar.style.display = 'flex';
    const statsNavbar = document.getElementById('stats-navbar');
    if (statsNavbar) {
      statsNavbar.remove();
    }
  }
  
  setTimeout(() => {
    page.classList.add('active');
  }, 40);
  
  // ДОБАВИТЬ:
  if (page === profilePage) {
    setTimeout(() => {
      renderProfile();
      console.log('renderProfile() вызван из showPage');
    }, 100);
  }
}

// ЕДИНСТВЕННЫЕ обработчики навигации
if (navMain) navMain.onclick = () => showPage(mainPage);
if (navStats) navStats.onclick = () => { 
  showPage(statsPage); 
  setTimeout(() => {
    renderStats(currentPeriod);
  }, 100);
};
if (navProfile) {
  navProfile.onclick = () => { 
    console.log('Переход на профиль');
    showPage(profilePage); 
    setTimeout(() => {
      renderProfile();
      console.log('renderProfile() вызван');
    }, 100);
  };
}
if (navGuide) navGuide.onclick = () => showPage(guidePage);
if (navFeedback) navFeedback.onclick = () => openFeedbackModal();

function openThoughtModal() {
  console.log('Открываем модальное окно');
  if (thoughtModal) {
    thoughtModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const situationInput = document.getElementById('modal-situation-input');
      if (situationInput) {
        situationInput.focus();
        console.log('Фокус установлен на поле ситуации');
      }
    }, 100);
  } else {
    console.error('Модальное окно не найдено!');
  }
}

function closeThoughtModal() {
  console.log('Закрываем модальное окно');
  if (thoughtModal) {
    thoughtModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    // Очистка полей
    const situationInput = document.getElementById('modal-situation-input');
    const thoughtInput = document.getElementById('modal-thought-input');
    const feelingInput = document.getElementById('modal-feeling-input');
    if (situationInput) situationInput.value = '';
    if (thoughtInput) thoughtInput.value = '';
    if (feelingInput) feelingInput.value = '';
    // Убираем классы ошибок
    [situationInput, thoughtInput, feelingInput].forEach(el => {
      if (el) el.classList.remove('error');
    });
  }
}

// Функция для показа уведомления о сохранении мысли
function showThoughtSavedNotification() {
  if (successNotification) {
    successNotification.innerHTML = '✓ Мысль успешно зафиксирована!';
    successNotification.style.background = 'linear-gradient(135deg, #00d4aa 0%, #00b896 100%)';
    successNotification.classList.remove('show');
    setTimeout(() => {
      successNotification.classList.add('show');
    }, 100);
    setTimeout(() => {
      successNotification.classList.remove('show');
    }, 3000);
  }
}

// --- State ---
let currentPeriod = { type: 'quick', days: 7 };

// --- Period Controls ---
function setActivePeriodBtn(days) {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period == days);
  });
}

function setupPeriodControls() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.onclick = () => {
      setActivePeriodBtn(btn.dataset.period);
      
      if (btn.dataset.period === 'today') {
        currentPeriod = { type: 'today' };
      } else {
        currentPeriod = { type: 'quick', days: Number(btn.dataset.period) };
      }
      
      renderStats(currentPeriod);
    };
  });
  
  const showBtn = document.getElementById('show-period-btn');
  if (showBtn) {
    showBtn.onclick = () => {
      const from = document.getElementById('start-date').value;
      const to = document.getElementById('end-date').value;
      if (from && to) {
        document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
        currentPeriod = { type: 'custom', from, to };
        renderStats(currentPeriod);
      }
    };
  }
}

// --- Storage ---
function getThoughts() {
  return JSON.parse(localStorage.getItem('negativeThoughts') || '[]');
}
function saveThoughts(arr) {
  localStorage.setItem('negativeThoughts', JSON.stringify(arr));
}

// --- Save Thought ---
if (modalSaveBtn) {
  modalSaveBtn.onclick = () => {
    console.log('Сохраняем мысль');
    const situation = document.getElementById('modal-situation-input').value.trim();
    const thought = document.getElementById('modal-thought-input').value.trim();
    const feeling = document.getElementById('modal-feeling-input').value;
    if (!situation || !thought || !feeling) {
      console.log('Валидация не прошла');
      [document.getElementById('modal-situation-input'), document.getElementById('modal-thought-input'), document.getElementById('modal-feeling-input')].forEach(el => {
        if (el && (!el.value || (el.tagName === 'SELECT' && !el.value))) {
          el.classList.add('error');
          setTimeout(() => el.classList.remove('error'), 800);
        }
      });
      return;
    }
    const now = new Date();
    const entry = {
      date: now.toLocaleDateString('en-CA'), // Формат YYYY-MM-DD в локальном времени
      situation,
      thought,
      feeling
    };
    const thoughts = getThoughts();
    thoughts.push(entry);
    saveThoughts(thoughts);
    closeThoughtModal();
    showThoughtSavedNotification();
    if (document.getElementById('stats-page').classList.contains('active')) {
      renderStats(currentPeriod);
    }
    console.log('Мысль сохранена:', entry);
  };
} else {
  console.error('Кнопка modal-save-btn не найдена!');
}

// --- Render Stats ---
function getPeriodRange(period) {
  const now = new Date();
  
  if (period.type === 'today') {
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    const startOfToday = new Date(todayString + 'T00:00:00');
    const endOfToday = new Date(todayString + 'T23:59:59');
    
    return { from: startOfToday, to: endOfToday };
  } else if (period.type === 'quick') {
    const from = new Date(now);
    from.setDate(now.getDate() - (period.days - 1));
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  } else if (period.type === 'custom') {
    const fromDate = new Date(period.from);
    const toDate = new Date(period.to);
    
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    return {
      from: fromDate,
      to: toDate
    };
  }
  return { from: now, to: now };
}

function renderStats(period = currentPeriod) {
  currentPeriod = period;
  const thoughts = getThoughts();
  
  const { from, to } = getPeriodRange(period);
  
  let count = 0;
  const days = [];
  const dayCounts = [];
  const dayMap = {};
  
  // Создаем массив дней
  if (period.type === 'today') {
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    days.push(todayString);
    dayCounts.push(0);
    dayMap[todayString] = 0;
  } else {
    let d = new Date(from);
    const endDate = new Date(to);
    
    while (d <= endDate) {
      const ds = d.toLocaleDateString('en-CA'); // Используем локальное время
      days.push(ds);
      dayCounts.push(0);
      dayMap[ds] = dayCounts.length - 1;
      d.setDate(d.getDate() + 1);
    }
  }
  
  // Подсчет записей
  thoughts.forEach(t => {
    if (!t.date) return;
    
    // Для старых записей с ISO форматом
    let thoughtDate;
    if (t.date.includes('T')) {
      thoughtDate = new Date(t.date);
    } else {
      // Для новых записей с локальным форматом
      thoughtDate = new Date(t.date + 'T12:00:00');
    }
    
    if (thoughtDate >= from && thoughtDate <= to) {
      count++;
      const dateString = thoughtDate.toLocaleDateString('en-CA');
      if (dayMap[dateString] !== undefined) {
        dayCounts[dayMap[dateString]]++;
      }
    }
  });
  
  // Обновляем метрики
  const thoughtsEl = document.getElementById('metric-thoughts');
  const periodEl = document.getElementById('metric-period');
  
  if (thoughtsEl) thoughtsEl.textContent = count;
  if (periodEl) periodEl.textContent = days.length + ' ' + (days.length === 1 ? 'день' : (days.length < 5 ? 'дня' : 'дней'));
  
  // Динамика
  let prevCount = 0;
  let dynamic = 0;
  if (days.length > 0) {
    const prevFrom = new Date(from); 
    prevFrom.setDate(prevFrom.getDate() - days.length);
    const prevTo = new Date(from); 
    prevTo.setDate(prevTo.getDate() - 1);
    
    thoughts.forEach(t => {
      if (!t.date) return;
      // Для старых записей с ISO форматом
      let dateString;
      if (t.date.includes('T')) {
        dateString = new Date(t.date).toLocaleDateString('en-CA');
      } else {
        // Для новых записей с локальным форматом
        dateString = t.date;
      }
      if (dateString >= prevFrom.toLocaleDateString('en-CA') && dateString <= prevTo.toLocaleDateString('en-CA')) {
        prevCount++;
      }
    });
    
    dynamic = count - prevCount;
    const dynVal = document.getElementById('metric-dynamic');
    if (dynVal) {
      dynVal.classList.remove('dynamic-positive','dynamic-negative','dynamic-neutral');
      if (dynamic > 0) {
        dynVal.textContent = '+' + dynamic;
        dynVal.classList.add('dynamic-positive');
      } else if (dynamic < 0) {
        dynVal.textContent = dynamic;
        dynVal.classList.add('dynamic-negative');
      } else {
        dynVal.textContent = '0';
        dynVal.classList.add('dynamic-neutral');
      }
    }
  }
  
  // Лучший/худший день
  let best = Math.min(...dayCounts);
  let worst = Math.max(...dayCounts);
  const bestEl = document.getElementById('metric-best');
  const worstEl = document.getElementById('metric-worst');
  if (bestEl) bestEl.textContent = best;
  if (worstEl) worstEl.textContent = worst;
  
  // Осознанность
  const daysWithThoughts = dayCounts.filter(count => count > 0).length;
  const awarenessPercent = Math.round((daysWithThoughts / days.length) * 100);
  const awarenessEl = document.getElementById('metric-awareness');
  if (awarenessEl) awarenessEl.textContent = awarenessPercent + '%';
  
  // Обновляем список записей
  const recentList = document.getElementById('recent-list');
  if (recentList) {
    recentList.innerHTML = '';
    
    const filtered = thoughts.filter(t => {
      if (!t.date) return false;
      // Для старых записей с ISO форматом
      let thoughtDate;
      if (t.date.includes('T')) {
        thoughtDate = new Date(t.date);
      } else {
        // Для новых записей с локальным форматом
        thoughtDate = new Date(t.date + 'T12:00:00');
      }
      return thoughtDate >= from && thoughtDate <= to;
    });
    
    if (filtered.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.5);">
          <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">📝</div>
          <div style="font-size: 1rem; line-height: 1.5;">
            Пока нет записей за выбранный период.<br>
            Начните фиксировать мысли для анализа.
          </div>
        </div>
      `;
      recentList.appendChild(emptyState);
    } else {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 10)
              .forEach((t, idx) => {
        const card = document.createElement('div');
        card.className = 'entry-card';
        let d;
        if (t.date.includes('T')) {
          // Для старых записей с ISO форматом
          d = new Date(t.date);
        } else {
          // Для новых записей с локальным форматом
          d = new Date(t.date + 'T12:00:00');
        }
        const dateStr = d ? d.toLocaleDateString('ru-RU') + ', ' + d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) : '';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="color: #00d4aa; font-size: 0.75rem; font-weight: 600; background: rgba(0,212,170,0.1); padding: 2px 6px; border-radius: 4px;">${dateStr}</div>
            <button class="entry-delete">×</button>
          </div>
          <div>
            <div style="margin-bottom: 8px;">
              <div style="font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">СИТУАЦИЯ</div>
              <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem; line-height: 1.4;">${t.situation || ''}</div>
            </div>
            <div style="margin-bottom: 8px;">
              <div style="font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">МЫСЛЬ</div>
              <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem; line-height: 1.4;">${t.thought || ''}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">ЧУВСТВО</div>
              <div style="display: inline-block; background: rgba(0,212,170,0.15); color: #00d4aa; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${t.feeling || ''}</div>
            </div>
          </div>
        `;
        const deleteBtn = card.querySelector('.entry-delete');
        deleteBtn.onclick = function() {
          const allThoughts = getThoughts();
          const realIndex = allThoughts.findIndex(thought => 
            thought.date === t.date && 
            thought.situation === t.situation && 
            thought.thought === t.thought &&
            thought.feeling === t.feeling
          );
          if (realIndex !== -1) {
            deleteThought(realIndex);
            renderStats(currentPeriod);
          }
        };
        recentList.appendChild(card);
      });
    }
  }
  
  updateChart(days, dayCounts);

  // Обновляем счетчик записей в правой панели
  const entriesCount = document.getElementById('entries-count');
  if (entriesCount) {
    entriesCount.textContent = count;
  }
  console.log('Количество записей за период:', count); // Для отладки
}

// --- Chart ---
let chartAnimationFrame = null;
let chartAnimProgress = 0;

function drawChart(days, counts) {
  const canvas = document.getElementById('stats-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  ctx.fillStyle = 'rgba(26, 29, 41, 0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (counts.length === 0) return;

  // Цвета для графика
  const lineColor = '#00d4aa';
  const pointColor = '#00d4aa';
  const fillColor = 'rgba(0,212,170,0.15)';
  const gridColor = 'rgba(255,255,255,0.2)';
  const axisColor = 'rgba(255,255,255,0.7)';
  const labelColor = 'rgba(255,255,255,0.9)';

  // МОБИЛЬНЫЕ ОТСТУПЫ - уменьшенные для большего графика
  const isMobile = window.innerWidth <= 768;
  const padding = isMobile ? 
    { top: 20, right: 15, bottom: 35, left: 35 } : 
    { top: 40, right: 40, bottom: 60, left: 60 };

  const chartWidth = canvas.width - padding.left - padding.right;
  const chartHeight = canvas.height - padding.top - padding.bottom;

  const maxY = Math.max(1, ...counts);
  const stepX = chartWidth / Math.max(1, days.length - 1);

  // Рисуем сетку
  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  
  for (let i = 1; i <= maxY; i++) {
    const y = padding.top + chartHeight - (i / maxY) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }
  ctx.restore();

  // Рисуем оси
  ctx.save();
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartHeight);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartHeight);
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  ctx.stroke();
  ctx.restore();

  // Подписи Y
  ctx.save();
  ctx.font = isMobile ? '500 10px Inter' : '600 13px Inter';
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= maxY; i++) {
    const y = padding.top + chartHeight - (i / maxY) * chartHeight;
    ctx.fillText(i.toString(), padding.left - 5, y);
  }
  ctx.restore();

  // Подписи X (только для мобильных показываем меньше дат)
  ctx.save();
  ctx.font = isMobile ? '500 9px Inter' : '500 12px Inter';
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  if (days.length === 1) {
    const label = days[0].split('-').reverse().join('.');
    ctx.fillText(label, padding.left + chartWidth / 2, padding.top + chartHeight + 10);
  } else {
    const labelStep = isMobile && days.length > 14 ? Math.ceil(days.length / 4) : Math.max(1, Math.ceil(days.length / 6));
    for (let i = 0; i < days.length; i += labelStep) {
      const x = padding.left + i * stepX;
      const label = days[i].slice(5).replace('-', '.');
      ctx.fillText(label, x, padding.top + chartHeight + 5);
    }
  }
  ctx.restore();

  // Заливка под графиком
  if (days.length > 1) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    for (let i = 0; i < counts.length; i++) {
      const x = padding.left + i * stepX;
      const y = padding.top + chartHeight - (counts[i] / maxY) * chartHeight;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(padding.left + (counts.length - 1) * stepX, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  }

  // Линия графика
  if (days.length > 1) {
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < counts.length; i++) {
      const x = padding.left + i * stepX;
      const y = padding.top + chartHeight - (counts[i] / maxY) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Точки
  for (let i = 0; i < counts.length; i++) {
    const x = padding.left + i * stepX;
    const y = padding.top + chartHeight - (counts[i] / maxY) * chartHeight;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, isMobile ? 4 : 6, 0, 2 * Math.PI);
    ctx.fillStyle = pointColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

function updateChart(days, counts) {
  const canvas = document.getElementById('stats-chart');
  if (!canvas || canvas.offsetWidth === 0) {
    setTimeout(() => {
      drawChart(days, counts);
    }, 200);
  } else {
    drawChart(days, counts);
  }
}

// --- Delete Thought ---
function deleteThought(index) {
  let thoughts = getThoughts();
  thoughts.splice(index, 1);
  saveThoughts(thoughts);
  renderStats(currentPeriod);
}

// --- Init ---
window.onload = () => {
  setupPeriodControls();
  renderStats();
};

// Устанавливаем обработчик для главной кнопки
if (addThoughtBtn) {
  console.log('Устанавливаем обработчик для кнопки');
  addThoughtBtn.onclick = function() {
    console.log('Кнопка нажата!');
    openThoughtModal();
  };
} else {
  console.error('Кнопка add-thought-btn не найдена!');
}

// Обработчики модального окна
if (closeModal) closeModal.onclick = closeThoughtModal;
if (modalCancelBtn) modalCancelBtn.onclick = closeThoughtModal;

if (thoughtModal) {
  thoughtModal.onclick = (e) => {
    if (e.target === thoughtModal) closeThoughtModal();
  };
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && thoughtModal && thoughtModal.classList.contains('active')) {
    closeThoughtModal();
  }
});

// --- Функции регистрации ---
function isUserRegistered() {
  const registered = localStorage.getItem('userRegistered');
  const userData = localStorage.getItem('userData');
  return registered === 'true' && userData !== null;
}

function saveUserData(userData) {
  try {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRegistered', 'true');
    localStorage.setItem('registrationDate', new Date().toISOString());
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }
}

function getUserData() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

function showRegistrationModal() {
  const registrationModal = document.getElementById('registration-modal');
  if (registrationModal) {
    registrationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const firstNameInput = document.getElementById('reg-first-name');
      if (firstNameInput) firstNameInput.focus();
    }, 300);
  }
}

function hideRegistrationModal() {
  const registrationModal = document.getElementById('registration-modal');
  if (registrationModal) {
    registrationModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function validateRegistrationForm() {
  const firstName = document.getElementById('reg-first-name').value.trim();
  const lastName = document.getElementById('reg-last-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  if (!firstName || !lastName || !email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  return true;
}

function handleRegistrationComplete() {
  if (!validateRegistrationForm()) {
    return;
  }
  
  const userData = {
    firstName: document.getElementById('reg-first-name').value.trim(),
    lastName: document.getElementById('reg-last-name').value.trim(),
    email: document.getElementById('reg-email').value.trim(),
    phone: document.getElementById('reg-phone').value.trim()
  };
  
  saveUserData(userData);
  
  // Дополнительно сохраняем флаг завершения туториала
  localStorage.setItem('tutorialCompleted', 'true');
  
  hideRegistrationModal();
  
  // Показываем основное приложение
  setTimeout(() => {
    showMainApp();
  }, 100);
  
  if (successNotification) {
    successNotification.innerHTML = `🎉 Добро пожаловать, ${userData.firstName}! Начните фиксировать свои мысли.`;
    successNotification.style.background = 'linear-gradient(135deg, #00d4aa 0%, #00b896 100%)';
    successNotification.classList.add('show');
    setTimeout(() => {
      successNotification.classList.remove('show');
    }, 4000);
  }
}

// --- Функции профиля ---
function getProfileStats() {
  const thoughts = getThoughts();
  return {
    totalEntries: thoughts.length,
    activeDays: new Set(thoughts.map(t => t.date?.slice(0, 10)).filter(Boolean)).size
  };
}

function formatJoinDate(dateString) {
  if (!dateString) return 'С нами недавно';
  const date = new Date(dateString);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `С нами с ${month} ${year}`;
}

function renderProfile() {
  const userData = getUserData();
  const stats = getProfileStats();
  
  // Обновляем информацию пользователя
  if (userData) {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileJoinDate = document.getElementById('profile-join-date');
    
    if (profileName) profileName.textContent = `${userData.firstName} ${userData.lastName}`;
    if (profileEmail) profileEmail.textContent = userData.email;
    if (profileJoinDate) profileJoinDate.textContent = formatJoinDate(localStorage.getItem('registrationDate'));
  }
  
  // Обновляем статистику
  const totalEntriesEl = document.getElementById('profile-total-entries');
  const activeDaysEl = document.getElementById('profile-active-days');
  
  if (totalEntriesEl) totalEntriesEl.textContent = stats.totalEntries;
  if (activeDaysEl) activeDaysEl.textContent = stats.activeDays;
  
  displayAvatar();
  renderProfileCalendar();
}

function displayAvatar() {
  const avatarIcon = document.getElementById('avatar-icon');
  const avatarImage = document.getElementById('avatar-image');
  const savedAvatar = localStorage.getItem('userAvatar');
  
  if (savedAvatar && avatarIcon && avatarImage) {
    avatarIcon.style.display = 'none';
    avatarImage.src = savedAvatar;
    avatarImage.style.display = 'block';
  } else if (avatarIcon && avatarImage) {
    avatarIcon.style.display = 'flex';
    avatarImage.style.display = 'none';
  }
  // Обновляем кнопку удаления
  const removeAvatarBtn = document.getElementById('remove-avatar-btn');
  if (removeAvatarBtn) {
    removeAvatarBtn.style.display = savedAvatar ? 'block' : 'none';
  }
}

// Календарная переменная для профиля
let currentProfileCalendarDate = new Date();

function getActivityData() {
  const thoughts = getThoughts();
  const activityMap = {};
  
  thoughts.forEach(thought => {
    if (thought.date) {
      let date;
      if (thought.date.includes('T')) {
        // Для старых записей с ISO форматом
        date = new Date(thought.date).toLocaleDateString('en-CA');
      } else {
        // Для новых записей с локальным форматом
        date = thought.date;
      }
      activityMap[date] = (activityMap[date] || 0) + 1;
    }
  });
  
  return activityMap;
}

function renderProfileCalendar() {
  const activityData = getActivityData();
  const monthTitle = document.getElementById('profile-current-month');
  if (monthTitle) {
    monthTitle.textContent = `${monthNames[currentProfileCalendarDate.getMonth()]} ${currentProfileCalendarDate.getFullYear()}`;
  }
  
  const calendarDays = document.getElementById('profile-calendar-days');
  if (!calendarDays) return;
  calendarDays.innerHTML = '';
  
  const year = currentProfileCalendarDate.getFullYear();
  const month = currentProfileCalendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  
  const prevMonth = new Date(year, month, 0);
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    const dayElement = createProfileDayElement(day, true, new Date(year, month - 1, day), activityData);
    calendarDays.appendChild(dayElement);
  }
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayElement = createProfileDayElement(day, false, new Date(year, month, day), activityData);
    calendarDays.appendChild(dayElement);
  }
  
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    const dayElement = createProfileDayElement(day, true, new Date(year, month + 1, day), activityData);
    calendarDays.appendChild(dayElement);
  }
}

function createProfileDayElement(day, isOtherMonth, date, activityData) {
  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';
  dayElement.textContent = day;
  if (isOtherMonth) {
    dayElement.classList.add('other-month');
  }
  const dateString = date.toLocaleDateString('en-CA');
  const today = new Date().toLocaleDateString('en-CA');
  if (dateString === today) {
    dayElement.classList.add('today');
  }
  const activityCount = activityData[dateString] || 0;
  if (activityCount > 0) {
    dayElement.classList.add('active');
    dayElement.setAttribute('data-count', activityCount);
  }
  return dayElement;
}

// --- Обратная связь ---
function openFeedbackModal() {
  const feedbackModal = document.getElementById('feedback-modal');
  if (feedbackModal) {
    feedbackModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeFeedbackModal() {
  const feedbackModal = document.getElementById('feedback-modal');
  if (feedbackModal) {
    feedbackModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// --- Обработчики справочника ---
document.addEventListener('DOMContentLoaded', function() {
  const guideNavBtns = document.querySelectorAll('.guide-nav-btn');
  
  guideNavBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      
      // Убираем активный класс со всех кнопок
      guideNavBtns.forEach(b => b.classList.remove('active'));
      
      // Добавляем активный класс к нажатой кнопке
      this.classList.add('active');
      
      // Скрываем все секции
      const sections = document.querySelectorAll('.guide-section');
      sections.forEach(s => s.classList.remove('active'));
      
      // Показываем нужную секцию
      const targetSection = document.getElementById(section);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });
  
  // Обработчик кнопки завершения регистрации
  const completeRegistrationBtn = document.getElementById('complete-registration-btn');
  if (completeRegistrationBtn) {
    completeRegistrationBtn.addEventListener('click', handleRegistrationComplete);
  }
  
  // Обработчики календаря профиля
  const prevMonthBtn = document.getElementById('profile-prev-month');
  const nextMonthBtn = document.getElementById('profile-next-month');
  if (prevMonthBtn) {
    prevMonthBtn.onclick = () => {
      currentProfileCalendarDate.setMonth(currentProfileCalendarDate.getMonth() - 1);
      renderProfileCalendar();
    };
  }
  if (nextMonthBtn) {
    nextMonthBtn.onclick = () => {
      currentProfileCalendarDate.setMonth(currentProfileCalendarDate.getMonth() + 1);
      renderProfileCalendar();
    };
  }
  
  // Обработчики модального окна обратной связи
  const closeFeedbackModalBtn = document.getElementById('close-feedback-modal');
  if (closeFeedbackModalBtn) {
    closeFeedbackModalBtn.onclick = closeFeedbackModal;
  }
  
  const feedbackModal = document.getElementById('feedback-modal');
  if (feedbackModal) {
    feedbackModal.onclick = (e) => {
      if (e.target === feedbackModal) closeFeedbackModal();
    };
  }
  
  // Обработчики редактирования профиля
  if (editProfileBtn) {
    editProfileBtn.onclick = openEditProfileModal;
  }
  if (closeEditProfileModal) {
    closeEditProfileModal.onclick = closeEditProfileModalHandler;
  }
  if (cancelProfileEditBtn) {
    cancelProfileEditBtn.onclick = closeEditProfileModalHandler;
  }
  if (saveProfileChangesBtn) {
    saveProfileChangesBtn.onclick = saveProfileChanges;
  }
  
  // Обработчики аватара
  setTimeout(() => {
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) {
      profileAvatar.onclick = function(e) {
        e.preventDefault();
        openAvatarModal();
      };
    }
  }, 1000);
});

function openEditProfileModal() {
  if (!editProfileModal) return;
  const userData = getUserData();
  if (userData) {
    document.getElementById('edit-first-name').value = userData.firstName || '';
    document.getElementById('edit-last-name').value = userData.lastName || '';
    document.getElementById('edit-email').value = userData.email || '';
    document.getElementById('edit-phone').value = userData.phone || '';
  }
  editProfileModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEditProfileModalHandler() {
  if (!editProfileModal) return;
  editProfileModal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function validateEditProfileForm() {
  const firstName = document.getElementById('edit-first-name').value.trim();
  const lastName = document.getElementById('edit-last-name').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  if (!firstName || !lastName || !email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  return true;
}

function saveProfileChanges() {
  if (!validateEditProfileForm()) {
    return;
  }
  const newUserData = {
    firstName: document.getElementById('edit-first-name').value.trim(),
    lastName: document.getElementById('edit-last-name').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
    phone: document.getElementById('edit-phone').value.trim()
  };
  saveUserData(newUserData);
  closeEditProfileModalHandler();
  renderProfile();
  if (successNotification) {
    successNotification.innerHTML = '✓ Профиль успешно обновлен!';
    successNotification.classList.add('show');
    setTimeout(() => {
      successNotification.classList.remove('show');
    }, 3000);
  }
}

function openAvatarModal() {
  const avatarModal = document.getElementById('avatar-modal');
  if (!avatarModal) return;
  
  avatarModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  const savedAvatar = localStorage.getItem('userAvatar');
  const removeAvatarBtn = document.getElementById('remove-avatar-btn');
  if (removeAvatarBtn) {
    removeAvatarBtn.style.display = savedAvatar ? 'block' : 'none';
  }
}

// ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ МОБИЛЬНЫХ МЕТРИК
function fixMobileMetrics() {
  // Проверяем что это мобильный экран
  if (window.innerWidth <= 768) {
    const metricsGrid = document.querySelector('.metrics-grid');
    if (metricsGrid) {
      console.log('Исправляем мобильные метрики');
      
      // Принудительно меняем стили через JavaScript
      metricsGrid.style.display = 'grid';
      metricsGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
      metricsGrid.style.gridTemplateRows = 'auto auto';
      metricsGrid.style.gap = '10px';
      metricsGrid.style.overflow = 'visible';
      
      // Получаем все карточки метрик
      const cards = metricsGrid.querySelectorAll('.metric-card');
      cards.forEach((card, index) => {
        card.style.width = '100%';
        card.style.minWidth = 'auto';
        card.style.margin = '0';
        
        // 4-я и 5-я карточка во второй ряд
        if (index === 3) {
          card.style.gridColumn = '1';
          card.style.gridRow = '2';
        }
        if (index === 4) {
          card.style.gridColumn = '2';
          card.style.gridRow = '2';
        }
      });
    }
  }
}

// Вызываем при загрузке и изменении размера
window.addEventListener('load', fixMobileMetrics);
window.addEventListener('resize', fixMobileMetrics);

// Вызываем когда отрисовываем статистику
const originalRenderStats = renderStats;
renderStats = function(...args) {
  const result = originalRenderStats.apply(this, args);
  setTimeout(fixMobileMetrics, 100);
  return result;
};



// --- Функция отправки в N8n ---
async function sendToN8nWebhook(data, email) {
  const webhookUrl = 'https://primary-production-b097c.up.railway.app/webhook/berne-analysis';
  const payload = {
    data: data,
    email: email,
    timestamp: new Date().toISOString(),
    source: 'thought-tracker-app'
  };
  console.log('Отправляем в N8n:', payload);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка отправки в N8n:', error);
    throw error;
  }
}

// --- ИСПРАВЛЕННЫЕ обработчики модального окна экспорта ---
function setupExportModalHandlers() {
  // Кнопка закрытия
  const closeExportModalBtn = document.getElementById('close-export-modal');
  if (closeExportModalBtn) {
    closeExportModalBtn.onclick = closeExportModal;
  } else {
    console.error('Кнопка close-export-modal не найдена');
  }
  // Кнопка отмены
  const cancelExportBtn = document.getElementById('cancel-export-btn');
  if (cancelExportBtn) {
    cancelExportBtn.onclick = closeExportModal;
  } else {
    console.error('Кнопка cancel-export-btn не найдена');
  }
  // Главная кнопка отправки
  const generateExportBtn = document.getElementById('generate-export-btn');
  if (generateExportBtn) {
    generateExportBtn.onclick = () => {
      const emailInput = document.getElementById('export-email-input');
      if (!emailInput) {
        console.error('Поле email не найдено');
        alert('Ошибка: поле email не найдено');
        return;
      }
      const email = emailInput.value.trim();
      if (!email) {
        alert('Введите email!');
        return;
      }
      const data = generateExportData();
      exportToJSONWithN8n(data, email);
      closeExportModal();
    };
  } else {
    console.error('Кнопка generate-export-btn не найдена');
  }
}

// --- ИСПРАВЛЕННАЯ функция открытия модала ---
function openExportModal() {
  const exportModal = document.getElementById('export-modal');
  if (!exportModal) {
    console.error('Модальное окно export-modal не найдено в HTML!');
    return;
  }
  // АВТОЗАПОЛНЕНИЕ EMAIL
  const userData = getUserData();
  const emailInput = document.getElementById('export-email-input');
  if (userData && userData.email && emailInput) {
    emailInput.value = userData.email;
  }
  // Обновляем информацию о периоде
  const periodInfo = document.getElementById('export-period-info');
  if (periodInfo) {
    if (currentPeriod.type === 'today') {
      periodInfo.textContent = 'Текущий период: Сегодня';
    } else if (currentPeriod.type === 'quick') {
      periodInfo.textContent = `Текущий период: ${currentPeriod.days} дней`;
    } else {
      periodInfo.textContent = `Текущий период: ${currentPeriod.from} — ${currentPeriod.to}`;
    }
  }
  // Показываем модал
  exportModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  // ВАЖНО: Устанавливаем обработчики ПОСЛЕ показа модала
  setTimeout(() => {
    setupExportModalHandlers();
  }, 100);
}

// --- Функция закрытия модала экспорта ---
function closeExportModal() {
  const exportModal = document.getElementById('export-modal');
  if (exportModal) {
    exportModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// --- ИСПРАВЛЕННАЯ функция generateExportData ---
function generateExportData() {
  const thoughts = getThoughts();
  const { from, to } = getPeriodRange(currentPeriod);
  
  // Фильтруем записи по текущему периоду
  const periodThoughts = thoughts.filter(t => {
    if (!t.date) return false;
    // Для старых записей с ISO форматом
    let thoughtDate;
    if (t.date.includes('T')) {
      thoughtDate = new Date(t.date);
    } else {
      // Для новых записей с локальным форматом
      thoughtDate = new Date(t.date + 'T12:00:00');
    }
    return thoughtDate >= from && thoughtDate <= to;
  });
  
  // Генерируем статистику
  const days = [];
  const dayMap = {};
  let d = new Date(from);
  const endDate = new Date(to);
  
  while (d <= endDate) {
    const ds = d.toLocaleDateString('en-CA');
    days.push(ds);
    dayMap[ds] = 0;
    d.setDate(d.getDate() + 1);
  }
  
  // Подсчитываем записи по дням
  periodThoughts.forEach(t => {
    if (!t.date) return;
    let dateString;
    if (t.date.includes('T')) {
      // Для старых записей с ISO форматом
      dateString = new Date(t.date).toLocaleDateString('en-CA');
    } else {
      // Для новых записей с локальным форматом
      dateString = t.date;
    }
    if (dayMap[dateString] !== undefined) {
      dayMap[dateString]++;
    }
  });
  
  // Подсчет статистики чувств
  const feelingBreakdown = {};
  periodThoughts.forEach(t => {
    if (t.feeling) {
      feelingBreakdown[t.feeling] = (feelingBreakdown[t.feeling] || 0) + 1;
    }
  });
  
  // Находим самое частое чувство
  let mostCommonFeeling = 'Нет данных';
  let maxCount = 0;
  for (const [feeling, count] of Object.entries(feelingBreakdown)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonFeeling = feeling;
    }
  }
  
  // Подсчет активных дней
  const activeDays = Object.values(dayMap).filter(count => count > 0).length;
  const awarenessPercentage = Math.round((activeDays / days.length) * 100);
  
  // Формируем период в читаемом виде
  let periodString;
  if (currentPeriod.type === 'today') {
    periodString = 'Сегодня';
  } else if (currentPeriod.type === 'quick') {
    periodString = `${currentPeriod.days} дней`;
  } else {
    periodString = `${currentPeriod.from} — ${currentPeriod.to}`;
  }
  
  // Возвращаем данные в правильном формате для N8n
  return {
    export_info: {
      period: periodString,
      total_entries: periodThoughts.length,
      export_date: new Date().toISOString(),
      app_version: "1.0"
    },
    summary: {
      active_days: activeDays,
      total_days: days.length,
      awareness_percentage: awarenessPercentage,
      most_common_feeling: mostCommonFeeling,
      feeling_breakdown: feelingBreakdown
    },
    entries: periodThoughts
  };
}

// --- НЕДОСТАЮЩИЕ функции уведомлений ---
function showLoadingNotification(message) {
  if (successNotification) {
    successNotification.innerHTML = message;
    successNotification.style.background = 'linear-gradient(135deg, #4299e1 0%, #63b3ed 100%)';
    successNotification.classList.add('show');
  }
}

function hideLoadingNotification() {
  if (successNotification) {
    successNotification.classList.remove('show');
  }
}

// Функция отправки в N8n (async, с логами и уведомлениями)
async function exportToJSONWithN8n(data, email) {
  try {
    showLoadingNotification('🤖 Отправляем данные в ИИ-анализ...');
    await sendToN8nWebhook(data, email);
    hideLoadingNotification();
    showReportSentNotification();
  } catch (error) {
    console.error('Ошибка отправки:', error);
    hideLoadingNotification();
    alert('Ошибка отправки: ' + error.message);
  }
}

// Уведомление об успешной отправке
function showReportSentNotification() {
  if (successNotification) {
    successNotification.innerHTML = '✅ Данные отправлены! PDF отчет придет на почту через 2-3 минуты.';
    successNotification.classList.add('show');
    setTimeout(() => {
      successNotification.classList.remove('show');
    }, 5000);
  }
}

// ОБРАБОТЧИКИ МОДАЛЬНОГО ОКНА АВАТАРА
document.addEventListener('DOMContentLoaded', function() {
  // Обработчик закрытия модального окна аватара
  const closeAvatarModalBtn = document.getElementById('close-avatar-modal');
  if (closeAvatarModalBtn) {
    closeAvatarModalBtn.onclick = closeAvatarModal;
  }

  // Обработчик для прямого выбора файла
  const directAvatarInput = document.getElementById('direct-avatar-input');
  if (directAvatarInput) {
    directAvatarInput.onchange = function(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          // Сохраняем аватар в localStorage
          localStorage.setItem('userAvatar', e.target.result);
          // Обновляем отображение
          displayAvatar();
          // Закрываем модальное окно
          closeAvatarModal();
          // Показываем уведомление
          if (successNotification) {
            successNotification.innerHTML = '✓ Фото профиля обновлено!';
            successNotification.classList.add('show');
            setTimeout(() => {
              successNotification.classList.remove('show');
            }, 3000);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }

  // Обработчик удаления аватара
  const removeAvatarBtn = document.getElementById('remove-avatar-btn');
  if (removeAvatarBtn) {
    removeAvatarBtn.onclick = function() {
      localStorage.removeItem('userAvatar');
      displayAvatar();
      closeAvatarModal();
      if (successNotification) {
        successNotification.innerHTML = '✓ Фото профиля удалено!';
        successNotification.classList.add('show');
        setTimeout(() => {
          successNotification.classList.remove('show');
        }, 3000);
      }
    };
  }

  // Обработчик клика вне модального окна
  const avatarModal = document.getElementById('avatar-modal');
  if (avatarModal) {
    avatarModal.onclick = function(e) {
      if (e.target === avatarModal) {
        closeAvatarModal();
      }
    };
  }
});

// ФУНКЦИЯ ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА АВАТАРА
function closeAvatarModal() {
  const avatarModal = document.getElementById('avatar-modal');
  if (avatarModal) {
    avatarModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// --- ФУНКЦИИ ЭКСПОРТА И ИМПОРТА ДАННЫХ ---

// Функция экспорта данных
function exportData() {
  try {
    // Собираем все данные из localStorage
    const exportData = {
      thoughts: getThoughts(),
      userData: getUserData(),
      userAvatar: localStorage.getItem('userAvatar'),
      registrationDate: localStorage.getItem('registrationDate'),
      userRegistered: localStorage.getItem('userRegistered'),
      exportDate: new Date().toLocaleDateString('ru-RU'),
      exportTime: new Date().toLocaleTimeString('ru-RU'),
      appVersion: '1.0'
    };

    // Создаем JSON файл
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trecker-bessoznatelnogo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Скачиваем файл
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем память
    URL.revokeObjectURL(url);
    
    // Показываем уведомление
    if (successNotification) {
      successNotification.innerHTML = '✅ Данные экспортированы! Используйте этот файл для переноса между Safari и PWA версией приложения.';
      successNotification.classList.add('show');
      setTimeout(() => {
        successNotification.classList.remove('show');
      }, 5000);
    }
    
    console.log('Экспорт данных завершен');
  } catch (error) {
    console.error('❌ Ошибка экспорта:', error);
    alert('Ошибка экспорта данных: ' + error.message);
  }
}

// Функция импорта данных
function importData() {
  const fileInput = document.getElementById('import-file-input');
  if (fileInput) {
    fileInput.click();
  }
}

// Обработчик выбора файла для импорта
function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.json')) {
    alert('Пожалуйста, выберите JSON файл');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Проверяем структуру данных
      if (!importedData.thoughts || !Array.isArray(importedData.thoughts)) {
        throw new Error('Неверный формат файла: отсутствуют записи мыслей');
      }

      // Получаем существующие данные
      const existingThoughts = getThoughts();
      const existingUserData = getUserData();

      // Объединяем записи мыслей (без дублирования)
      const mergedThoughts = [...existingThoughts];
      let newThoughtsCount = 0;

      importedData.thoughts.forEach(importedThought => {
        // Проверяем, есть ли уже такая запись
        const isDuplicate = existingThoughts.some(existing => 
          existing.date === importedThought.date && 
          existing.situation === importedThought.situation &&
          existing.thought === importedThought.thought
        );

        if (!isDuplicate) {
          mergedThoughts.push(importedThought);
          newThoughtsCount++;
        }
      });

      // Сохраняем объединенные данные
      saveThoughts(mergedThoughts);

      // Обновляем данные пользователя, если они есть в импорте
      if (importedData.userData && importedData.userData.name) {
        const mergedUserData = { ...existingUserData, ...importedData.userData };
        saveUserData(mergedUserData);
      }

      // Обновляем аватар, если он есть в импорте
      if (importedData.userAvatar) {
        localStorage.setItem('userAvatar', importedData.userAvatar);
      }

      // Обновляем отображение
      renderProfile();
      if (document.getElementById('stats-page').classList.contains('active')) {
        renderStats(currentPeriod);
      }

      // Показываем уведомление об успехе
      if (successNotification) {
        successNotification.innerHTML = `✅ Импорт завершен! Добавлено ${newThoughtsCount} записей. Данные теперь доступны в этой версии приложения.`;
        successNotification.classList.add('show');
        setTimeout(() => {
          successNotification.classList.remove('show');
        }, 5000);
      }

      console.log(`📥 Импорт завершен: добавлено ${newThoughtsCount} записей`);
      
      // Очищаем input для возможности повторного импорта того же файла
      event.target.value = '';
      
    } catch (error) {
      console.error('❌ Ошибка импорта:', error);
      alert('Ошибка импорта данных: ' + error.message);
      event.target.value = '';
    }
  };

  reader.readAsText(file);
}



// === WELCOME TUTORIAL ===
let currentTutorialSlide = 1;
const totalTutorialSlides = 8;

// Функция проверки необходимости показа туториала
function shouldShowTutorial() {
  const tutorialCompleted = localStorage.getItem('tutorialCompleted');
  return tutorialCompleted !== 'true'; // Показывать только если НЕ пройден
}

// Функция инициализации туториала
function initTutorial() {
  const tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
  const userRegistered = isUserRegistered();
  
  if (!tutorialCompleted) {
    showTutorial();
    setupTutorialHandlers();
  } else if (!userRegistered) {
    setTimeout(() => {
      showRegistrationModal();
    }, 500);
  } else {
    showMainApp();
  }
}

// Показать туториал
function showTutorial() {
  const tutorialOverlay = document.getElementById('welcome-tutorial');
  if (tutorialOverlay) {
    tutorialOverlay.style.display = 'flex';
    updateTutorialProgress();
  }
}

// Скрыть туториал
function hideTutorial() {
  const tutorialOverlay = document.getElementById('welcome-tutorial');
  if (tutorialOverlay) {
    tutorialOverlay.classList.add('hidden');
    setTimeout(() => {
      tutorialOverlay.style.display = 'none';
      tutorialOverlay.classList.remove('hidden');
    }, 300);
  }
}

// Настройка обработчиков туториала
function setupTutorialHandlers() {
  // Кнопка "Пропустить"
  const skipBtn = document.getElementById('skip-tutorial-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      completeTutorial();
    });
  }
  
  // Кнопка "Назад"
  const prevBtn = document.getElementById('tutorial-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => navigateTutorial(-1));
  }
  
  // Кнопка "Далее"
  const nextBtn = document.getElementById('tutorial-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      navigateTutorial(1);
    });
  }
  
  // Обработка клавиш
  document.addEventListener('keydown', handleTutorialKeydown);
}

// Обработка клавиш для туториала
function handleTutorialKeydown(event) {
  const tutorialOverlay = document.getElementById('welcome-tutorial');
  if (tutorialOverlay && tutorialOverlay.style.display === 'flex') {
    if (event.key === 'ArrowLeft') {
      navigateTutorial(-1);
    } else if (event.key === 'ArrowRight') {
      navigateTutorial(1);
    } else if (event.key === 'Escape') {
      completeTutorial();
    }
  }
}

// Навигация по туториалу
function navigateTutorial(direction) {
  const newSlide = currentTutorialSlide + direction;
  
  if (newSlide >= 1 && newSlide <= totalTutorialSlides) {
    showTutorialSlide(newSlide);
  } else if (newSlide > totalTutorialSlides) {
    // Достигли конца туториала
    completeTutorial();
  }
}

// Показать конкретный слайд
function showTutorialSlide(slideNumber) {
  // Скрываем все слайды
  const slides = document.querySelectorAll('.tutorial-slide');
  slides.forEach(slide => {
    slide.classList.remove('active', 'prev');
  });
  
  // Показываем текущий слайд
  const currentSlide = document.querySelector(`[data-slide="${slideNumber}"]`);
  if (currentSlide) {
    currentSlide.classList.add('active');
  }
  
  // Показываем предыдущий слайд для анимации
  if (slideNumber > 1) {
    const prevSlide = document.querySelector(`[data-slide="${slideNumber - 1}"]`);
    if (prevSlide) {
      prevSlide.classList.add('prev');
    }
  }
  
  currentTutorialSlide = slideNumber;
  updateTutorialProgress();
  updateTutorialButtons();
}

// Обновить индикатор прогресса
function updateTutorialProgress() {
  const progressFill = document.getElementById('tutorial-progress-fill');
  const progressText = document.getElementById('tutorial-progress-text');
  
  if (progressFill) {
    const progress = (currentTutorialSlide / totalTutorialSlides) * 100;
    progressFill.style.width = `${progress}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${currentTutorialSlide}/${totalTutorialSlides}`;
  }
}

// Обновить состояние кнопок
function updateTutorialButtons() {
  const prevBtn = document.getElementById('tutorial-prev-btn');
  const nextBtn = document.getElementById('tutorial-next-btn');
  
  if (prevBtn) {
    prevBtn.disabled = currentTutorialSlide === 1;
  }
  
  if (nextBtn) {
    if (currentTutorialSlide === totalTutorialSlides) {
      nextBtn.textContent = 'Начать →';
    } else {
      nextBtn.textContent = 'Далее →';
    }
  }
}

// Показать основное приложение
function showMainApp() {
  // Показываем главную страницу
  showPage(mainPage);
}

// Завершить туториал
function completeTutorial() {
  // Сохраняем флаг завершения
  localStorage.setItem('tutorialCompleted', 'true');
  
  // Скрываем туториал
  hideTutorial();
  
  // Проверяем регистрацию и показываем нужную страницу
  setTimeout(() => {
    if (!isUserRegistered()) {
      showRegistrationModal();
    } else {
      showMainApp();
    }
  }, 500);
}

// Функция для сброса туториала (для тестирования)
function resetTutorial() {
  localStorage.removeItem('tutorialCompleted');
  location.reload();
}

// Функция для сброса всех флагов (для тестирования)
function resetAllFlags() {
  localStorage.removeItem('tutorialCompleted');
  localStorage.removeItem('userRegistered');
  localStorage.removeItem('userData');
  localStorage.removeItem('registrationDate');
  location.reload();
}

// Инициализация туториала при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Инициализируем туториал
  initTutorial();
  
  // Добавляем функции сброса в глобальную область для тестирования
  window.resetTutorial = resetTutorial;
  window.resetAllFlags = resetAllFlags;
  
  // Остальные обработчики...
  setupExportModalHandlers();
  
  // Обработчик кнопки получения отчета
  const getReportBtn = document.getElementById('get-report-btn');
  if (getReportBtn) {
    getReportBtn.addEventListener('click', openExportModal);
  }
  
  // Обработчик кнопки экспорта данных
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }

  // Обработчик кнопки импорта данных
  const importBtn = document.getElementById('import-data-btn');
  if (importBtn) {
    importBtn.addEventListener('click', importData);
  }

  // Обработчик выбора файла для импорта
  const importFileInput = document.getElementById('import-file-input');
  if (importFileInput) {
    importFileInput.addEventListener('change', handleImportFile);
  }
});


