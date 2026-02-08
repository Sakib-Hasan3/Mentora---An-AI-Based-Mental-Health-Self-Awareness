// Mentora - Main JavaScript File
// Version: 1.0 | Features: Dark Mode, Mobile Menu, Interactive Demo

document.addEventListener('DOMContentLoaded', function() {
    // ===== THEME MANAGEMENT =====
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.innerHTML = `
        <i class="fas fa-moon"></i>
        <i class="fas fa-sun" style="display: none;"></i>
    `;
    
    // Insert theme toggle before nav actions
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        navActions.insertBefore(themeToggle, navActions.firstChild);
    }
    
    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem('mentora-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcons(true);
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            updateThemeIcons(false);
        }
    }
    
    function updateThemeIcons(isDark) {
        const moonIcon = themeToggle.querySelector('.fa-moon');
        const sunIcon = themeToggle.querySelector('.fa-sun');
        
        if (isDark) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'inline-block';
        } else {
            moonIcon.style.display = 'inline-block';
            sunIcon.style.display = 'none';
        }
    }
    
    function toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('mentora-theme', newTheme);
        updateThemeIcons(!isDark);
        
        // Show notification
        showNotification(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    initTheme();
    
    // ===== MOBILE MENU TOGGLE =====
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    function toggleMobileMenu() {
        const isOpen = navMenu.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        
        if (isOpen) {
            icon.classList.replace('fa-bars', 'fa-times');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
    
    mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking outside or on a link
    document.addEventListener('click', function(event) {
        if (!navMenu || !mobileMenuToggle) return;
        
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnToggle = mobileMenuToggle.contains(event.target);
        
        if (navMenu.classList.contains('active') && !isClickInsideNav && !isClickOnToggle) {
            navMenu.classList.remove('active');
            mobileMenuToggle.querySelector('i')?.classList.replace('fa-times', 'fa-bars');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu?.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
    
    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.querySelector('.navbar');
    
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateNavbar);
    updateNavbar(); // Initial check
    
    // ===== AI ANALYSIS DEMO =====
    const analyzeBtn = document.querySelector('.analyze-btn');
    const analysisTextarea = document.querySelector('.analysis-input textarea');
    const emotionBars = document.querySelectorAll('.meter-fill');
    const emotionScores = document.querySelectorAll('.emotion-score');
    
    analyzeBtn?.addEventListener('click', function() {
        const text = analysisTextarea?.value.trim();
        
        if (!text) {
            showNotification('Please write something about how you feel.', 'warning');
            analysisTextarea?.focus();
            return;
        }
        
        // Show loading state
        const originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
        
        // Simulate AI processing (2 seconds)
        setTimeout(() => {
            // Generate scores based on text sentiment
            const hasPositiveWords = /good|happy|great|excited|joy|calm|peace/i.test(text);
            const hasStressWords = /stress|anxiety|worry|fear|scared|nervous|pressure/i.test(text);
            const hasHopeWords = /hope|better|improve|progress|future|optimistic/i.test(text);
            
            let stressScore, anxietyScore, hopeScore;
            
            if (hasPositiveWords) {
                stressScore = Math.floor(Math.random() * 30) + 20;
                anxietyScore = Math.floor(Math.random() * 25) + 25;
                hopeScore = Math.floor(Math.random() * 40) + 50;
            } else if (hasStressWords) {
                stressScore = Math.floor(Math.random() * 30) + 60;
                anxietyScore = Math.floor(Math.random() * 35) + 45;
                hopeScore = Math.floor(Math.random() * 30) + 30;
            } else {
                stressScore = Math.floor(Math.random() * 40) + 40;
                anxietyScore = Math.floor(Math.random() * 30) + 35;
                hopeScore = Math.floor(Math.random() * 35) + 40;
            }
            
            if (hasHopeWords) {
                hopeScore = Math.min(100, hopeScore + 15);
            }
            
            const scores = [stressScore, anxietyScore, hopeScore];
            
            // Animate bars
            emotionBars.forEach((bar, index) => {
                bar.style.transition = 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                bar.style.width = scores[index] + '%';
            });
            
            // Animate score counts
            emotionScores.forEach((scoreElement, index) => {
                animateCounter(scoreElement, scores[index]);
            });
            
            // Update suggestion
            const dominantBadge = document.querySelector('.dominant-badge strong');
            let suggestion;
            
            if (stressScore > 70) {
                suggestion = '5-minute meditation';
            } else if (anxietyScore > 60) {
                suggestion = 'Grounding exercise (5-4-3-2-1)';
            } else if (hopeScore < 40) {
                suggestion = 'Positive journaling';
            } else {
                suggestion = '2-minute breathing exercise';
            }
            
            dominantBadge.textContent = suggestion;
            
            // Reset button after animation
            setTimeout(() => {
                analyzeBtn.innerHTML = originalText;
                analyzeBtn.disabled = false;
                showNotification('Analysis complete! Check your mood insights.', 'success');
            }, 1500);
            
        }, 2000);
    });
    
    // Counter animation function
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '%';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '%';
            }
        }, 40);
    }
    
    // ===== QUICK TOOLS INTERACTIVITY =====
    const quickTools = document.querySelectorAll('.language-tag');
    
    const toolActions = {
        'Breathing (2 min)': {
            message: 'Starting 2-minute breathing exercise. Inhale... 1... 2... 3... 4...',
            icon: 'fas fa-wind',
            color: 'var(--info)'
        },
        'Grounding 5-4-3-2-1': {
            message: 'Grounding exercise: 5 things you see, 4 things you touch, 3 things you hear, 2 things you smell, 1 thing you taste',
            icon: 'fas fa-mountain',
            color: 'var(--success)'
        },
        'Journal Prompt': {
            message: 'Prompt: "What\'s one thing you\'re grateful for today?"',
            icon: 'fas fa-pen',
            color: 'var(--primary)'
        },
        'Mood Tracker': {
            message: 'Opening mood tracker. How are you feeling right now?',
            icon: 'fas fa-heart',
            color: 'var(--secondary)'
        },
        'Sleep Reminder': {
            message: 'Sleep reminder set for 10:00 PM. Good sleep = better mental health!',
            icon: 'fas fa-moon',
            color: 'var(--info)'
        },
        'Find Mentor': {
            message: 'Searching for verified mentors based on your interests...',
            icon: 'fas fa-user-tie',
            color: 'var(--primary)'
        },
        'Book Doctor': {
            message: 'Opening appointment calendar... Available slots shown.',
            icon: 'fas fa-stethoscope',
            color: 'var(--success)'
        },
        'Weekly Report': {
            message: 'Generating your weekly wellness insights...',
            icon: 'fas fa-chart-line',
            color: 'var(--info)'
        },
        'Anonymous Mode': {
            message: 'Anonymous mode activated for 60 minutes. Your activity is private.',
            icon: 'fas fa-user-secret',
            color: 'var(--warning)'
        }
    };
    
    quickTools.forEach(tool => {
        tool.addEventListener('click', function() {
            const toolName = this.textContent.trim();
            const action = toolActions[toolName];
            
            if (action) {
                showNotification(action.message, 'info', action.icon, action.color);
            }
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    
    // ===== NOTIFICATION SYSTEM =====
    let notificationTimeout;
    
    function showNotification(message, type = 'info', icon = 'fas fa-info-circle', color = null) {
        // Remove existing notification
        const existing = document.querySelector('.notification-toast');
        if (existing) {
            existing.remove();
            clearTimeout(notificationTimeout);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        
        // Determine border color
        let borderColor = color || 'var(--primary)';
        if (type === 'success') borderColor = 'var(--success)';
        if (type === 'warning') borderColor = 'var(--warning)';
        if (type === 'danger') borderColor = 'var(--danger)';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Apply border color
        notification.style.borderLeftColor = borderColor;
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
            clearTimeout(notificationTimeout);
        });
        
        // Auto-remove after 5 seconds
        notificationTimeout = setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        document.body.appendChild(notification);
    }
    
    // ===== SOS BUTTON =====
    function createSOSButton() {
        const sosButton = document.createElement('button');
        sosButton.className = 'sos-button';
        sosButton.innerHTML = `
            <i class="fas fa-triangle-exclamation"></i>
            <span>SOS Emergency</span>
        `;
        
        sosButton.addEventListener('click', function() {
            // Confirmation before triggering emergency
            if (!confirm('This will alert emergency contacts. Are you in immediate danger?')) {
                return;
            }
            
            showNotification('Emergency protocol activated. Help is on the way.', 'danger', 'fas fa-phone', 'var(--danger)');
            
            // Simulate emergency process
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Alerting...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Help Coming</span>
                `;
                this.style.background = 'var(--gradient-green)';
                
                setTimeout(() => {
                    this.innerHTML = `
                        <i class="fas fa-triangle-exclamation"></i>
                        <span>SOS Emergency</span>
                    `;
                    this.style.background = 'var(--gradient-danger)';
                    this.disabled = false;
                }, 3000);
            }, 2000);
        });
        
        document.body.appendChild(sosButton);
    }
    
    createSOSButton();
    
    // ===== SCROLL TO TOP BUTTON =====
    function createScrollTopButton() {
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
        scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        
        function updateScrollTopButton() {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', updateScrollTopButton);
        updateScrollTopButton(); // Initial check
        
        document.body.appendChild(scrollTopBtn);
    }
    
    createScrollTopButton();
    
    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#demo') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const navbarHeight = navbar?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== LAZY LOADING FOR IMAGES =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }
    
    // ===== FORM VALIDATION (if any forms exist) =====
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredInputs = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = 'var(--danger)';
                    isValid = false;
                    
                    // Focus first invalid input
                    if (isValid === false) {
                        input.focus();
                        isValid = null; // Prevent further focus changes
                    }
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields.', 'warning');
            }
        });
    });
    
    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search (if any)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
            searchInput?.focus();
        }
        
        // Escape to close notifications
        if (e.key === 'Escape') {
            const notification = document.querySelector('.notification-toast');
            if (notification) {
                notification.remove();
                clearTimeout(notificationTimeout);
            }
            
            // Close mobile menu
            if (navMenu?.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
        
        // Space to trigger AI analysis when focused
        if (e.key === ' ' && document.activeElement === analysisTextarea && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            // Allow normal space input
            analysisTextarea.value += ' ';
        }
    });
    
    // ===== PERFORMANCE OPTIMIZATION =====
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateNavbar, 100);
    });
    
    // ===== INITIALIZE ON LOAD =====
    console.log('Mentora platform loaded successfully!');
});