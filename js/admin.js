
document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const appointmentsTable = document.getElementById('appointments-table');
    const dateFilter = document.getElementById('date-filter');
    const nameFilter = document.getElementById('name-filter');
    const serviceFilter = document.getElementById('service-filter');
    const statusFilter = document.getElementById('status-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    // Элементы статистики
    const totalAppointmentsEl = document.getElementById('total-appointments');
    const todayAppointmentsEl = document.getElementById('today-appointments');
    const confirmedAppointmentsEl = document.getElementById('confirmed-appointments');
    const newAppointmentsEl = document.getElementById('new-appointments');
    
    // Данные для входа
    const adminCredentials = {
        username: 'admin',
        password: 'password123'
    };
    
    // Проверяем, авторизован ли пользователь
    if (localStorage.getItem('adminAuthenticated') === 'true') {
        showAdminPanel();
        loadAppointments();
    }
    
    // Обработчик формы входа
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === adminCredentials.username && password === adminCredentials.password) {
            localStorage.setItem('adminAuthenticated', 'true');
            showAdminPanel();
            loadAppointments();
            showNotification('Вход выполнен успешно!', 'success');
        } else {
            showNotification('Неверные логин или пароль', 'error');
        }
    });
    
    // Кнопка выхода
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminAuthenticated');
        hideAdminPanel();
        showNotification('Вы вышли из системы', 'info');
    });
    
    // Кнопка обновления
    refreshBtn.addEventListener('click', function() {
        loadAppointments();
        showNotification('Данные обновлены', 'success');
    });
    
    // Фильтрация
    dateFilter.addEventListener('change', filterAppointments);
    nameFilter.addEventListener('input', debounce(filterAppointments, 300));
    serviceFilter.addEventListener('change', filterAppointments);
    statusFilter.addEventListener('change', filterAppointments);
    
    // Сброс фильтров
    resetFiltersBtn.addEventListener('click', function() {
        dateFilter.value = '';
        nameFilter.value = '';
        serviceFilter.value = '';
        statusFilter.value = '';
        filterAppointments();
        showNotification('Фильтры сброшены', 'info');
    });
    
    function showAdminPanel() {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
    }
    
    function hideAdminPanel() {
        loginSection.style.display = 'block';
        adminPanel.style.display = 'none';
        loginForm.reset();
    }
    
    function loadAppointments() {
        // Показываем состояние загрузки
        const tbody = appointmentsTable.querySelector('tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Загрузка данных...</td></tr>';
        
        // Имитация загрузки данных
        setTimeout(() => {
            // Загружаем записи из localStorage
            const appointments = JSON.parse(localStorage.getItem('massageAppointments') || '[]');
            
            // Добавляем статусы, если их нет
            appointments.forEach(app => {
                if (!app.status) app.status = 'pending';
                if (!app.timestamp) app.timestamp = new Date(app.date + 'T' + app.time).getTime();
            });
            
            // Сортируем по дате (сначала ближайшие)
            appointments.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
            
            // Сохраняем для фильтрации
            window.allAppointments = appointments;
            
            // Обновляем статистику
            updateStats(appointments);
            
            // Отображаем
            displayAppointments(appointments);
        }, 500);
    }
    
    function updateStats(appointments) {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        
        // Подсчет статистики
        const total = appointments.length;
        const todayCount = appointments.filter(app => app.date === today).length;
        const confirmedCount = appointments.filter(app => app.status === 'confirmed').length;
        const newCount = appointments.filter(app => app.date >= weekAgoStr).length;
        
        // Обновление элементов
        totalAppointmentsEl.textContent = total;
        todayAppointmentsEl.textContent = todayCount;
        confirmedAppointmentsEl.textContent = confirmedCount;
        newAppointmentsEl.textContent = newCount;
    }
    
    function displayAppointments(appointments) {
        const tbody = appointmentsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (appointments.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" class="text-center">Нет записей</td>`;
            tbody.appendChild(row);
            return;
        }
        
        // В функции displayAppointments замените создание строк на это:
        appointments.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Дата">${formatDateForDisplay(app.date)}</td>
                <td data-label="Время">${app.time}</td>
                <td data-label="Имя">${app.name}</td>
                <td data-label="Телефон"><a href="tel:${app.phone}">${app.phone}</a></td>
                <td data-label="Услуга">${getServiceName(app.service)}</td>
                <td data-label="Статус"><span class="status status-${app.status}">${getStatusText(app.status)}</span></td>
                <td data-label="Действия" class="actions-cell">
                    <button class="btn btn-small btn-success confirm-btn" data-id="${app.timestamp}" ${app.status === 'confirmed' ? 'disabled' : ''}>Подтвердить</button>
                    <button class="btn btn-small btn-secondary cancel-btn" data-id="${app.timestamp}" ${app.status === 'cancelled' ? 'disabled' : ''}>Отменить</button>
                    <button class="btn btn-small delete-btn" data-id="${app.timestamp}">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });
                
        // Добавляем обработчики для кнопок
        addActionHandlers();
    }
    
    function addActionHandlers() {
        // Обработчики для кнопок подтверждения
        document.querySelectorAll('.confirm-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const timestamp = this.dataset.id;
                updateAppointmentStatus(timestamp, 'confirmed');
            });
        });
        
        // Обработчики для кнопок отмены
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const timestamp = this.dataset.id;
                updateAppointmentStatus(timestamp, 'cancelled');
            });
        });
        
        // Обработчики для кнопок удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const timestamp = this.dataset.id;
                deleteAppointment(timestamp);
            });
        });
    }
    
    function filterAppointments() {
        const dateValue = dateFilter.value;
        const nameValue = nameFilter.value.toLowerCase();
        const serviceValue = serviceFilter.value;
        const statusValue = statusFilter.value;
        
        let filtered = window.allAppointments;
        
        if (dateValue) {
            filtered = filtered.filter(app => app.date === dateValue);
        }
        
        if (nameValue) {
            filtered = filtered.filter(app => 
                app.name.toLowerCase().includes(nameValue)
            );
        }
        
        if (serviceValue) {
            filtered = filtered.filter(app => app.service === serviceValue);
        }
        
        if (statusValue) {
            filtered = filtered.filter(app => app.status === statusValue);
        }
        
        displayAppointments(filtered);
    }
    
    function updateAppointmentStatus(timestamp, status) {
        const updatedAppointments = window.allAppointments.map(app => {
            if (app.timestamp == timestamp) {
                return {...app, status};
            }
            return app;
        });
        
        localStorage.setItem('massageAppointments', JSON.stringify(updatedAppointments));
        window.allAppointments = updatedAppointments;
        
        // Обновляем статистику
        updateStats(updatedAppointments);
        
        // Применяем текущие фильтры
        filterAppointments();
        
        showNotification('Статус записи обновлен', 'success');
    }
    
    function deleteAppointment(timestamp) {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            const updatedAppointments = window.allAppointments.filter(app => app.timestamp != timestamp);
            localStorage.setItem('massageAppointments', JSON.stringify(updatedAppointments));
            window.allAppointments = updatedAppointments;
            
            // Обновляем статистику
            updateStats(updatedAppointments);
            
            // Применяем текущие фильтры
            filterAppointments();
            
            showNotification('Запись удалена', 'success');
        }
    }
    
    function formatDateForDisplay(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    }
    
    function getServiceName(serviceCode) {
        const services = {
            'classic': 'Классический массаж',
            'relax': 'Расслабляющий массаж',
            'sport': 'Спортивный массаж',
            'aroma': 'Ароматерапия'
        };
        return services[serviceCode] || serviceCode;
    }
    
    function getStatusText(status) {
        const statuses = {
            'pending': 'Ожидание',
            'confirmed': 'Подтверждено',
            'cancelled': 'Отменено'
        };
        return statuses[status] || status;
    }
    
    function showNotification(message, type = 'info') {
        // Удаляем предыдущие уведомления
        const notificationArea = document.getElementById('notification-area');
        notificationArea.innerHTML = '';
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notificationArea.appendChild(notification);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Вспомогательная функция для задержки выполнения
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Генерация тестовых данных, если их нет
    function generateTestDataIfNeeded() {
        if (!localStorage.getItem('massageAppointments')) {
            const services = ['classic', 'relax', 'sport', 'aroma'];
            const statuses = ['pending', 'confirmed', 'cancelled'];
            const names = ['Иван Иванов', 'Мария Петрова', 'Алексей Смирнов', 'Екатерина Сидорова', 'Дмитрий Кузнецов'];
            
            const testData = [];
            const today = new Date();
            
            for (let i = 0; i < 15; i++) {
                const date = new Date();
                date.setDate(today.getDate() + Math.floor(Math.random() * 14) - 2); // От 2 дней назад до 12 дней вперед
                
                const dateStr = date.toISOString().split('T')[0];
                const time = `${9 + Math.floor(Math.random() * 9)}:${Math.random() > 0.5 ? '00' : '30'}`;
                
                testData.push({
                    name: names[Math.floor(Math.random() * names.length)],
                    phone: `+7${9000000000 + Math.floor(Math.random() * 1000000000)}`,
                    service: services[Math.floor(Math.random() * services.length)],
                    date: dateStr,
                    time: time,
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    timestamp: new Date(dateStr + 'T' + time).getTime()
                });
            }
            
            localStorage.setItem('massageAppointments', JSON.stringify(testData));
        }
    }
    
    // Генерируем тестовые данные при первой загрузке
    generateTestDataIfNeeded();
});