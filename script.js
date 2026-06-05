// ============================================
// NAVIGATION
// ============================================
const navbar = document.getElementById('navbar');
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

// Scroll handling - add background to nav
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
        navbar.classList.add('nav--scrolled');
    } else {
        navbar.classList.remove('nav--scrolled');
    }
    lastScroll = currentScroll;
}, { passive: true });

// Mobile menu toggle
burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
const animateElements = document.querySelectorAll('[data-animate]');

const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay') || 0;
            setTimeout(() => {
                entry.target.classList.add('animated');
            }, parseInt(delay));
            animateObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

animateElements.forEach(el => animateObserver.observe(el));

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(target * eased);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

// Trigger counter animation when hero stats are visible
const statsSection = document.querySelector('.hero__stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

// ============================================
// TERMINAL ANIMATION
// ============================================
function animateTerminal() {
    const lines = document.querySelectorAll('.terminal__line');
    let delay = 0;

    lines.forEach((line, index) => {
        const typingEl = line.querySelector('.terminal__typing');

        setTimeout(() => {
            line.classList.add('visible');

            if (typingEl) {
                const text = typingEl.getAttribute('data-text');
                let charIndex = 0;
                typingEl.innerHTML = '';

                const typeInterval = setInterval(() => {
                    if (charIndex < text.length) {
                        typingEl.textContent += text[charIndex];
                        charIndex++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, 40);

                delay += text.length * 40 + 300;
            } else {
                delay += 200;
            }
        }, delay);

        if (typingEl) {
            const text = typingEl.getAttribute('data-text');
            delay += text.length * 40 + 400;
        } else {
            delay += 250;
        }
    });
}

// Trigger terminal animation
const terminalSection = document.querySelector('.about__terminal');
if (terminalSection) {
    const terminalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(animateTerminal, 300);
                terminalObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    terminalObserver.observe(terminalSection);
}

// ============================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const btn = document.getElementById('submitBtn');
        const originalContent = btn.innerHTML;

        // Pokaż animację wysyłania (spinner)
        btn.innerHTML = `
            <span>Wysyłanie...</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
        `;
        btn.disabled = true;

        // Przygotuj dane do wysyłki
        const formData = new FormData(contactForm);
        const payload = {
            _subject: "Nowa wiadomość ze strony sarnowski.dev!",
            _captcha: "false"
        };
        formData.forEach((value, key) => {
            if (key === 'rodo') {
                payload['Zgoda RODO'] = value === 'on' ? 'Zaakceptowano' : 'Niezaakceptowano';
            } else {
                payload[key] = value;
            }
        });

        // Wyślij dane za pomocą AJAX do FormSubmit
        fetch('https://formsubmit.co/ajax/kontakt@sarnowskidev.pl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Błąd serwera przy wysyłaniu formularza');
        })
        .then(data => {
            // Sukces - zmień przycisk na zielony i "Wysłano!"
            btn.innerHTML = `
                <span>Wysłano!</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.style.background = '';
                contactForm.reset();
            }, 2500);
        })
        .catch(error => {
            console.error('Błąd podczas wysyłania wiadomości:', error);
            // Błąd - zmień przycisk na czerwony i "Błąd wysyłania"
            btn.innerHTML = `
                <span>Błąd wysyłania</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
            btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.style.background = '';
            }, 3000);
        });
    });
}

// ============================================
// PROFILE TYPING ANIMATION
// ============================================
const heroProfile = document.querySelector('.hero__profile');
const profileTyping = document.getElementById('profileTyping');

if (heroProfile && profileTyping) {
    const fullName = 'Jakub Sarnowski';
    let typingInterval = null;
    let clearTimeout_id = null;

    heroProfile.addEventListener('mouseenter', () => {
        // Cancel any pending clear from previous mouseleave
        if (clearTimeout_id) {
            clearTimeout(clearTimeout_id);
            clearTimeout_id = null;
        }
        // Cancel any ongoing typing
        if (typingInterval) {
            clearInterval(typingInterval);
            typingInterval = null;
        }

        // Reset and start fresh
        profileTyping.textContent = '';
        profileTyping.classList.remove('done');
        profileTyping.classList.add('visible');

        let i = 0;
        typingInterval = setInterval(() => {
            if (i < fullName.length) {
                profileTyping.textContent += fullName[i];
                i++;
            } else {
                clearInterval(typingInterval);
                typingInterval = null;
                profileTyping.classList.add('done');
            }
        }, 50);
    });

    heroProfile.addEventListener('mouseleave', () => {
        if (typingInterval) {
            clearInterval(typingInterval);
            typingInterval = null;
        }
        profileTyping.classList.remove('visible', 'done');

        clearTimeout_id = setTimeout(() => {
            profileTyping.textContent = '';
            clearTimeout_id = null;
        }, 300);
    });
}

// ============================================
// CURSOR GLOW EFFECT ON CARDS
// ============================================
document.querySelectorAll('.service-card, .project-card').forEach(card => {
    let rafId = null;

    card.addEventListener('mousemove', (e) => {
        if (rafId) return; // Skip if a frame is already scheduled

        rafId = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            card.style.background = `
                radial-gradient(
                    300px circle at ${x}px ${y}px,
                    rgba(99, 102, 241, 0.06),
                    transparent 60%
                ),
                rgba(22, 22, 31, 0.6)
            `;

            // Calculate 3D tilt angles based on mouse position relative to card center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const maxRotation = 4; // Subtly elegant tilt (max 4 degrees)
            
            const rotateX = -((y - centerY) / centerY) * maxRotation;
            const rotateY = ((x - centerX) / centerX) * maxRotation;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            rafId = null;
        });
    });

    card.addEventListener('mouseleave', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        card.style.background = '';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
});

// ============================================
// SPIN ANIMATION (for loading state)
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

// ============================================
// PROJECT PREVIEW MODAL
// ============================================
const projectModal = document.getElementById('projectModal');
const projectIframe = document.getElementById('projectIframe');
const projectFrameWrapper = document.getElementById('projectFrameWrapper');
const projectModalClose = document.getElementById('projectModalClose');
const projectModalBackdrop = document.getElementById('projectModalBackdrop');
const viewDesktop = document.getElementById('viewDesktop');
const viewMobile = document.getElementById('viewMobile');
const projectCards = document.querySelectorAll('.project-card');

// Set lazy loading on iframe
if (projectIframe) projectIframe.setAttribute('loading', 'lazy');

function openProjectModal(url) {
    // Pause all background animations to free up GPU for iframe rendering
    document.body.classList.add('modal-active');
    projectIframe.src = url;
    requestAnimationFrame(() => {
        projectModal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    document.body.style.overflow = '';
    // Resume background animations
    document.body.classList.remove('modal-active');

    // Reset mobile view state
    if (projectFrameWrapper) projectFrameWrapper.classList.remove('mobile-view');
    if (viewDesktop) viewDesktop.classList.add('active');
    if (viewMobile) viewMobile.classList.remove('active');

    // Clear src after animation finishes
    setTimeout(() => {
        if (!projectModal.classList.contains('active')) {
            projectIframe.src = '';
        }
    }, 400);
}

projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const url = card.getAttribute('href');
        if (url) openProjectModal(url);
    });
});

if (projectModalClose) projectModalClose.addEventListener('click', closeProjectModal);
if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeProjectModal);

// ESC key closes modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeProjectModal();
    }
});

if (viewDesktop && viewMobile) {
    viewDesktop.addEventListener('click', () => {
        viewDesktop.classList.add('active');
        viewMobile.classList.remove('active');
        if (projectFrameWrapper) projectFrameWrapper.classList.remove('mobile-view');
    });

    viewMobile.addEventListener('click', () => {
        viewMobile.classList.add('active');
        viewDesktop.classList.remove('active');
        if (projectFrameWrapper) projectFrameWrapper.classList.add('mobile-view');
    });
}

// ============================================
// AI CHATBOT
// ============================================
const chatbotBubble = document.getElementById('chatbotBubble');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotNudge = document.getElementById('chatbotNudge');
const chatbotNudgeClose = document.getElementById('chatbotNudgeClose');

let chatbotOpen = false;
let chatbotInitialized = false;

// Dismiss the nudge tooltip
function dismissNudge() {
    if (chatbotNudge) {
        chatbotNudge.classList.remove('visible');
        chatbotBubble.classList.remove('bounce');
    }
}

// Show nudge tooltip after 3 seconds
setTimeout(() => {
    if (!chatbotOpen && chatbotNudge) {
        chatbotNudge.classList.add('visible');
        chatbotBubble.classList.add('bounce');

        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (!chatbotOpen) dismissNudge();
        }, 8000);
    }
}, 3000);

if (chatbotNudgeClose) {
    chatbotNudgeClose.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissNudge();
    });
}

function toggleChatbot() {
    chatbotOpen = !chatbotOpen;
    chatbotWindow.classList.toggle('active', chatbotOpen);
    dismissNudge();

    if (chatbotOpen && !chatbotInitialized) {
        chatbotInitialized = true;
        showTypingThenMessage(
            'Cześć! 👋 Jestem wirtualnym asystentem Jakuba. Wybierz temat, który Cię interesuje:',
            showMainActions
        );
    }
}

chatbotBubble.addEventListener('click', toggleChatbot);
chatbotClose.addEventListener('click', () => {
    chatbotOpen = false;
    chatbotWindow.classList.remove('active');
});

// Add a typing indicator, then replace it with a bot message
function showTypingThenMessage(text, afterCallback) {
    const typing = document.createElement('div');
    typing.classList.add('chatbot__typing');
    typing.innerHTML = `
        <span class="chatbot__typing-dot"></span>
        <span class="chatbot__typing-dot"></span>
        <span class="chatbot__typing-dot"></span>
    `;
    chatbotMessages.appendChild(typing);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    setTimeout(() => {
        typing.remove();
        addBotMessage(text);
        if (afterCallback) afterCallback();
    }, 1000);
}

function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.classList.add('chatbot__msg', 'chatbot__msg--bot');
    msg.innerHTML = text;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.classList.add('chatbot__msg', 'chatbot__msg--user');
    msg.textContent = text;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showMainActions() {
    const actions = document.createElement('div');
    actions.classList.add('chatbot__actions');

    const buttons = [
        { text: '💰 Ile kosztuje strona?', handler: handleCost },
        { text: '🛡️ Czym jest Abonament na Święty Spokój?', handler: handleAbonament },
        { text: '📋 Chcę darmową wycenę', handler: handleWycena },
    ];

    buttons.forEach(({ text, handler }) => {
        const btn = document.createElement('button');
        btn.classList.add('chatbot__action-btn');
        btn.textContent = text;
        btn.addEventListener('click', () => {
            actions.remove();
            handler(text);
        });
        actions.appendChild(btn);
    });

    chatbotMessages.appendChild(actions);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function handleCost(userText) {
    addUserMessage(userText);
    showTypingThenMessage(
        'Cena zależy od zakresu projektu. Prosta strona-wizytówka zaczyna się od <strong>ok. 500–1500 zł</strong>, a bardziej rozbudowane serwisy od <strong>2000 zł</strong>. Każda wycena jest indywidualna i bezpłatna! 😊<br><br>👉 <a href="#kontakt">Napisz do mnie</a>, a przygotuję ofertę dopasowaną do Twoich potrzeb.',
        showMainActions
    );
}

function handleAbonament(userText) {
    addUserMessage(userText);
    showTypingThenMessage(
        '<strong>Abonament na Święty Spokój</strong> to stała, comiesięczna opieka techniczna nad Twoją stroną. W ramach abonamentu otrzymujesz:<br><br>✅ Szybkie zmiany treści i cenników<br>✅ Aktualizacje zabezpieczeń<br>✅ Wsparcie techniczne i pomoc IT<br>✅ Monitoring działania strony<br><br>Dzięki temu nie musisz się martwić o stronę — ja zajmę się wszystkim! 🚀',
        showMainActions
    );
}

function handleWycena(userText) {
    addUserMessage(userText);
    showTypingThenMessage(
        'Świetnie! Zaraz przekieruję Cię do formularza kontaktowego, gdzie możesz opisać swój projekt. Odpowiem w ciągu 24 godzin! ✉️',
        () => {
            setTimeout(() => {
                chatbotOpen = false;
                chatbotWindow.classList.remove('active');
                const kontakt = document.querySelector('#kontakt');
                if (kontakt) {
                    kontakt.scrollIntoView({ behavior: 'smooth' });
                }
            }, 1200);
        }
    );
}
