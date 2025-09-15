// Add intersection observer for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Add floating animation to hero elements
    const heroElements = document.querySelectorAll('.hero h2, .hero p, .hero .btn');
    heroElements.forEach((el, index) => {
        el.style.animation = `float 3s ease-in-out ${index * 0.3}s infinite`;
    });
});