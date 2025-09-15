// Анимация появления элементов при скролле
document.addEventListener('DOMContentLoaded', function() {
    // Функция для проверки видимости элемента
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
            rect.bottom >= 0
        );
    }
    
    // Функция для обработки появления элементов
    function handleScroll() {
        const sections = document.querySelectorAll('section');
        const items = document.querySelectorAll('.stagger-item');
        
        sections.forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('visible');
            }
        });
        
        items.forEach((item, index) => {
            if (isElementInViewport(item)) {
                // Задержка для каждого элемента для эффекта "лесенки"
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * 100);
            }
        });
    }
    
    // Обработчик события скролла
    window.addEventListener('scroll', handleScroll);
    // Вызов сразу при загрузке для видимых элементов
    handleScroll();
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Анимация для кнопок при наведении
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('pulse');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('pulse');
        });
    });
    
    // Инициализация плавающих элементов
    const floatingElements = document.querySelectorAll('.floating');
    floatingElements.forEach((el, index) => {
        // Разная задержка для каждого элемента
        el.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Анимация текста в заголовке
    const heroTitle = document.querySelector('.hero h2');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.innerHTML = '';
        
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.animation = `fadeIn 0.5s ${i * 0.05}s forwards`;
            span.style.opacity = '0';
            heroTitle.appendChild(span);
        });
    }
});