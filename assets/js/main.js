const root = document.documentElement;
if (root && !root.classList.contains('js-enabled')) {
    root.classList.add('js-enabled');
}

const initialize = () => {
    if (initialize.hasRun) {
        return;
    }
    initialize.hasRun = true;

    const isStorageAvailable = (() => {
        try {
            const key = '__sdu-storage-check__';
            window.localStorage.setItem(key, key);
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    })();

    const setupMegaMenuForTouch = () => {
        const nav = document.querySelector('.main-nav');
        if (!nav) {
            return;
        }

        const navItems = Array.from(nav.querySelectorAll('li.has-mega'));
        if (navItems.length === 0) {
            return;
        }

        const coarseQuery =
            typeof window.matchMedia === 'function'
                ? window.matchMedia('(hover: none) and (pointer: coarse)')
                : null;

        const detectTouchEnvironment = () => {
            const hasTouchEvent =
                'ontouchstart' in window ||
                (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints) > 0);
            return Boolean((coarseQuery && coarseQuery.matches) || hasTouchEvent);
        };

        let touchEnabled = detectTouchEnvironment();

        const closeAll = () => {
            navItems.forEach((item) => {
                item.classList.remove('is-open');
                const trigger = item.querySelector(':scope > a');
                if (trigger) {
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        };

        const updateTouchState = () => {
            const nextState = detectTouchEnvironment();
            if (touchEnabled === nextState) {
                return;
            }

            touchEnabled = nextState;
            if (!touchEnabled) {
                closeAll();
            }
        };

        navItems.forEach((item) => {
            const trigger = item.querySelector(':scope > a');
            if (!trigger) {
                return;
            }

            trigger.setAttribute('aria-expanded', 'false');

            trigger.addEventListener('click', (event) => {
                if (!touchEnabled) {
                    closeAll();
                    return;
                }

                const isOpen = item.classList.contains('is-open');
                if (!isOpen) {
                    event.preventDefault();
                    closeAll();
                    item.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            item.addEventListener('focusout', (event) => {
                if (!touchEnabled) {
                    return;
                }

                if (!item.contains(event.relatedTarget)) {
                    item.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        });

        const megaLinks = nav.querySelectorAll('.mega-menu a');
        megaLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (!touchEnabled) {
                    return;
                }

                closeAll();
            });
        });

        document.addEventListener('click', (event) => {
            if (!touchEnabled) {
                return;
            }

            if (!nav.contains(event.target)) {
                closeAll();
            }
        });

        if (coarseQuery) {
            const handleChange = () => {
                updateTouchState();
            };

            if (typeof coarseQuery.addEventListener === 'function') {
                coarseQuery.addEventListener('change', handleChange);
            } else if (typeof coarseQuery.addListener === 'function') {
                coarseQuery.addListener(handleChange);
            }
        }

        window.addEventListener('resize', updateTouchState);
    };

    const ensureScrollButton = () => {
        let scrollButton = document.querySelector('[data-scroll-top]');
        if (scrollButton) {
            return scrollButton;
        }

        scrollButton = document.createElement('button');
        scrollButton.type = 'button';
        scrollButton.className = 'scroll-to-top';
        scrollButton.setAttribute('data-scroll-top', '');
        scrollButton.setAttribute('aria-label', '맨 위로');
        scrollButton.innerHTML =
            '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">' +
            '<path d="M12 5.5a1 1 0 0 1 .7.3l6 6a1 1 0 0 1-1.4 1.4L12 7.91l-5.3 5.29a1 1 0 0 1-1.4-1.42l6-6a1 1 0 0 1 .7-.28Z" />' +
            '<path d="M12 11.5a1 1 0 0 1 .7.3l6 6a1 1 0 0 1-1.4 1.4L12 13.91l-5.3 5.29a1 1 0 0 1-1.4-1.42l6-6a1 1 0 0 1 .7-.28Z" />' +
            '</svg>';
        document.body.appendChild(scrollButton);

        return scrollButton;
    };

    const ensureDarkModeToggle = () => {
        let themeToggle = document.querySelector('[data-theme-toggle]');
        if (themeToggle) {
            return themeToggle;
        }

        themeToggle = document.createElement('button');
        themeToggle.type = 'button';
        themeToggle.className = 'dark-mode-toggle';
        themeToggle.setAttribute('data-theme-toggle', '');
        themeToggle.setAttribute('aria-pressed', 'false');
        themeToggle.innerHTML =
            '<span class="dark-mode-toggle__icon" aria-hidden="true">🌙</span>' +
            '<span class="dark-mode-toggle__label">다크 모드</span>';
        document.body.appendChild(themeToggle);

        return themeToggle;
    };

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('theme-dark', isDark);
        document.documentElement.dataset.theme = theme;
    };

    const getStoredTheme = () => {
        if (!isStorageAvailable) {
            return null;
        }

        return window.localStorage.getItem('preferred-theme');
    };

    const storeTheme = (theme) => {
        if (!isStorageAvailable) {
            return;
        }

        window.localStorage.setItem('preferred-theme', theme);
    };

    const setupAdmissionConsultationForm = () => {
        const form = document.getElementById('admission-consultation-form');
        if (!form) {
            return;
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = String(formData.get('name') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            const date = String(formData.get('date') || '').trim();

            if (!name || !phone || !date) {
                if (typeof form.reportValidity === 'function') {
                    form.reportValidity();
                }
                return;
            }

            const parsedDate = new Date(date);
            const formattedDate = Number.isNaN(parsedDate.getTime())
                ? date
                : parsedDate.toLocaleDateString('ko-KR');

            const recipient = 'gtcccybercollege@gmail.com';
            const subject = encodeURIComponent('[GTCC Admissions] 상담 예약 신청');
            const bodyLines = [
                '다음과 같이 상담 예약 신청이 접수되었습니다.',
                '',
                `이름: ${name}`,
                `연락처: ${phone}`,
                `상담 희망일: ${formattedDate}`,
            ];
            const body = encodeURIComponent(bodyLines.join('\n'));
            const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

            window.location.href = mailtoLink;

            window.setTimeout(() => {
                form.reset();
            }, 100);
        });
    };

    setupMegaMenuForTouch();
    setupAdmissionConsultationForm();

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const track = slider.querySelector('[data-hero-track]');
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prevButton = slider.querySelector('[data-hero-prev]');
        const nextButton = slider.querySelector('[data-hero-next]');
        const interval = Number(slider.getAttribute('data-hero-interval')) || 8000;

        if (slides.length > 0 && track) {
            let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            let autoplayId = null;

            const setActive = (index) => {
                const targetIndex = (index + slides.length) % slides.length;
                slides.forEach((slide, idx) => {
                    const isActive = idx === targetIndex;
                    slide.classList.toggle('is-active', isActive);
                    slide.setAttribute('aria-hidden', String(!isActive));
                });

                dots.forEach((dot, idx) => {
                    const isActive = idx === targetIndex;
                    dot.classList.toggle('is-active', isActive);
                    dot.setAttribute('aria-selected', String(isActive));
                    if (isActive) {
                        dot.setAttribute('aria-current', 'true');
                    } else {
                        dot.removeAttribute('aria-current');
                    }
                });

                currentIndex = targetIndex;
            };

            const goTo = (index) => {
                setActive(index);
            };

            const goToNext = () => {
                goTo(currentIndex + 1);
            };

            const goToPrev = () => {
                goTo(currentIndex - 1);
            };

            const stopAutoplay = () => {
                if (autoplayId) {
                    window.clearInterval(autoplayId);
                    autoplayId = null;
                }
            };

            const startAutoplay = () => {
                if (slides.length < 2) {
                    return;
                }

                stopAutoplay();
                autoplayId = window.setInterval(() => {
                    goToNext();
                }, interval);
            };

            prevButton?.addEventListener('click', () => {
                goToPrev();
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                goToNext();
                startAutoplay();
            });

            dots.forEach((dot) => {
                dot.addEventListener('click', () => {
                    const target = Number(dot.getAttribute('data-hero-dot'));
                    if (Number.isNaN(target)) {
                        return;
                    }

                    goTo(target);
                    startAutoplay();
                });
            });

            slider.addEventListener('pointerenter', stopAutoplay);
            slider.addEventListener('pointerleave', startAutoplay);
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', (event) => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            slider.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goToPrev();
                    startAutoplay();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goToNext();
                    startAutoplay();
                }
            });

            setActive(currentIndex);
            startAutoplay();
        }
    }

    const prefersReducedMotionQuery =
        typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    const imageSliders = document.querySelectorAll('[data-image-slider]');
    if (imageSliders.length > 0) {
        const initImageSlider = (imageSlider) => {
            const track = imageSlider.querySelector('[data-image-track]');
            const slides = Array.from(imageSlider.querySelectorAll('[data-image-slide]'));

            if (!track || slides.length === 0) {
                return;
            }

            imageSlider.style.setProperty('--slide-count', String(slides.length));

            const prevButton = imageSlider.querySelector('[data-image-prev]');
            const nextButton = imageSlider.querySelector('[data-image-next]');
            const currentIndicator = imageSlider.querySelector('[data-image-current]');
            const totalIndicator = imageSlider.querySelector('[data-image-total]');
            const interval = Number(imageSlider.getAttribute('data-image-interval')) || 10000;

            let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            let autoplayId = null;

            const updateIndicators = () => {
                if (currentIndicator) {
                    currentIndicator.textContent = String(currentIndex + 1);
                }

                if (totalIndicator) {
                    totalIndicator.textContent = String(slides.length);
                }
            };

            const setActive = (index) => {
                const targetIndex = (index + slides.length) % slides.length;

                slides.forEach((slide, idx) => {
                    const isActive = idx === targetIndex;
                    slide.classList.toggle('is-active', isActive);
                    slide.setAttribute('aria-hidden', String(!isActive));
                });

                imageSlider.style.setProperty('--current-index', String(targetIndex));
                currentIndex = targetIndex;
                updateIndicators();
            };

            const goTo = (index) => {
                setActive(index);
            };

            const goToNext = () => {
                goTo(currentIndex + 1);
            };

            const goToPrev = () => {
                goTo(currentIndex - 1);
            };

            const stopAutoplay = () => {
                if (autoplayId) {
                    window.clearInterval(autoplayId);
                    autoplayId = null;
                }
            };

            const startAutoplay = () => {
                if (slides.length < 2) {
                    stopAutoplay();
                    return;
                }

                if (prefersReducedMotionQuery?.matches) {
                    stopAutoplay();
                    return;
                }

                stopAutoplay();
                autoplayId = window.setInterval(() => {
                    goToNext();
                }, interval);
            };

            prevButton?.addEventListener('click', () => {
                goToPrev();
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                goToNext();
                startAutoplay();
            });

            imageSlider.addEventListener('pointerenter', stopAutoplay);
            imageSlider.addEventListener('pointerleave', startAutoplay);
            imageSlider.addEventListener('focusin', stopAutoplay);
            imageSlider.addEventListener('focusout', (event) => {
                if (!imageSlider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            imageSlider.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goToPrev();
                    startAutoplay();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goToNext();
                    startAutoplay();
                }
            });

            const handlePreferenceChange = () => {
                if (prefersReducedMotionQuery?.matches) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            };

            if (prefersReducedMotionQuery) {
                if (typeof prefersReducedMotionQuery.addEventListener === 'function') {
                    prefersReducedMotionQuery.addEventListener('change', handlePreferenceChange);
                } else if (typeof prefersReducedMotionQuery.addListener === 'function') {
                    prefersReducedMotionQuery.addListener(handlePreferenceChange);
                }
            }

            setActive(currentIndex);
            updateIndicators();
            startAutoplay();
        };

        imageSliders.forEach((imageSlider) => {
            initImageSlider(imageSlider);
        });
    }

    const videoSliders = document.querySelectorAll('[data-video-slider]');
    if (videoSliders.length > 0) {
        const initVideoSlider = (slider) => {
            const track = slider.querySelector('[data-video-track]');
            const slides = Array.from(slider.querySelectorAll('[data-video-slide]'));
            if (!track || slides.length === 0) {
                return;
            }

            const dots = Array.from(slider.querySelectorAll('[data-video-dot]'));
            const prevButton = slider.querySelector('[data-video-prev]');
            const nextButton = slider.querySelector('[data-video-next]');
            const interval = Number(slider.getAttribute('data-video-interval')) || 12000;

            let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            let autoplayId = null;

            const updateHeight = () => {
                const activeSlide = slides[currentIndex];
                if (!activeSlide) {
                    return;
                }

                track.style.height = `${activeSlide.offsetHeight}px`;
            };

            const setActive = (index) => {
                const targetIndex = (index + slides.length) % slides.length;

                slides.forEach((slide, idx) => {
                    const isActive = idx === targetIndex;
                    slide.classList.toggle('is-active', isActive);
                    slide.setAttribute('aria-hidden', String(!isActive));
                });

                dots.forEach((dot, idx) => {
                    const isActive = idx === targetIndex;
                    dot.classList.toggle('is-active', isActive);
                    dot.setAttribute('aria-selected', String(isActive));
                    if (isActive) {
                        dot.setAttribute('aria-current', 'true');
                    } else {
                        dot.removeAttribute('aria-current');
                    }
                });

                currentIndex = targetIndex;
                updateHeight();
            };

            const goTo = (index) => {
                setActive(index);
            };

            const goToNext = () => {
                goTo(currentIndex + 1);
            };

            const goToPrev = () => {
                goTo(currentIndex - 1);
            };

            const stopAutoplay = () => {
                if (autoplayId) {
                    window.clearInterval(autoplayId);
                    autoplayId = null;
                }
            };

            const startAutoplay = () => {
                if (slides.length < 2) {
                    return;
                }

                stopAutoplay();
                autoplayId = window.setInterval(() => {
                    goToNext();
                }, interval);
            };

            prevButton?.addEventListener('click', () => {
                goToPrev();
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                goToNext();
                startAutoplay();
            });

            dots.forEach((dot) => {
                dot.addEventListener('click', () => {
                    const target = Number(dot.getAttribute('data-video-dot'));
                    if (Number.isNaN(target)) {
                        return;
                    }

                    goTo(target);
                    startAutoplay();
                });
            });

            slider.addEventListener('pointerenter', stopAutoplay);
            slider.addEventListener('pointerleave', startAutoplay);
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', (event) => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            slider.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goToPrev();
                    startAutoplay();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goToNext();
                    startAutoplay();
                }
            });

            setActive(currentIndex);
            startAutoplay();
            updateHeight();

            window.addEventListener('resize', () => {
                window.requestAnimationFrame(updateHeight);
            });

            window.addEventListener('load', updateHeight);
        };

        videoSliders.forEach((slider) => {
            initVideoSlider(slider);
        });
    }

    const initDepartmentTabs = () => {
        const tabGroups = document.querySelectorAll('.department-tabs');
        if (tabGroups.length === 0) {
            return;
        }

        tabGroups.forEach((tabGroup) => {
            const tabList = tabGroup.querySelector('[role="tablist"]') || tabGroup;
            const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
            if (tabs.length === 0) {
                return;
            }

            const getPanel = (tab) => {
                const controls = tab.getAttribute('aria-controls');
                if (!controls) {
                    return null;
                }

                return document.getElementById(controls);
            };

            const setActive = (targetTab, options = {}) => {
                if (!targetTab) {
                    return;
                }

                const { focus = false, updateHash = true } = options;
                const activeControls = targetTab.getAttribute('aria-controls');

                tabs.forEach((tab) => {
                    const isActive = tab === targetTab;
                    tab.classList.toggle('is-active', isActive);
                    tab.setAttribute('aria-selected', String(isActive));
                    tab.setAttribute('tabindex', isActive ? '0' : '-1');

                    const panel = getPanel(tab);
                    if (!panel) {
                        return;
                    }

                    if (isActive) {
                        panel.classList.add('is-active');
                        panel.removeAttribute('hidden');
                    } else {
                        panel.classList.remove('is-active');
                        panel.setAttribute('hidden', '');
                    }
                });

                if (updateHash && activeControls) {
                    const newHash = `#${activeControls}`;
                    if (window.location.hash !== newHash) {
                        if (typeof window.history.replaceState === 'function') {
                            window.history.replaceState(null, '', newHash);
                        } else {
                            window.location.hash = newHash;
                        }
                    }
                }

                if (focus) {
                    targetTab.focus();
                }
            };

            const focusTabByIndex = (index) => {
                if (tabs.length === 0) {
                    return;
                }

                const targetIndex = (index + tabs.length) % tabs.length;
                const targetTab = tabs[targetIndex];
                setActive(targetTab, { focus: true });
            };

            tabs.forEach((tab, index) => {
                if (!tab.hasAttribute('aria-selected')) {
                    const isActive = tab.classList.contains('is-active');
                    tab.setAttribute('aria-selected', String(isActive));
                }

                if (!tab.hasAttribute('tabindex')) {
                    tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');
                }

                tab.addEventListener('click', (event) => {
                    event.preventDefault();
                    setActive(tab);
                });

                tab.addEventListener('keydown', (event) => {
                    switch (event.key) {
                        case 'ArrowRight':
                        case 'ArrowDown':
                            event.preventDefault();
                            focusTabByIndex(index + 1);
                            break;
                        case 'ArrowLeft':
                        case 'ArrowUp':
                            event.preventDefault();
                            focusTabByIndex(index - 1);
                            break;
                        case 'Home':
                            event.preventDefault();
                            focusTabByIndex(0);
                            break;
                        case 'End':
                            event.preventDefault();
                            focusTabByIndex(tabs.length - 1);
                            break;
                        default:
                            break;
                    }
                });
            });

            const getTabByPanelId = (panelId) =>
                tabs.find((tab) => tab.getAttribute('aria-controls') === panelId) || null;

            const initialTab = tabs.find((tab) => tab.classList.contains('is-active')) || tabs[0];
            setActive(initialTab, { updateHash: false });

            const syncWithHash = (shouldFocus = false) => {
                const hash = window.location.hash.replace('#', '');
                if (!hash) {
                    return;
                }

                const matchingTab = getTabByPanelId(hash);
                if (matchingTab) {
                    setActive(matchingTab, { focus: shouldFocus, updateHash: false });
                }
            };

            syncWithHash();

            window.addEventListener('hashchange', () => {
                syncWithHash(true);
            });
        });
    };

    initDepartmentTabs();

    const initializeGoogleTranslate = () => {
        const container = document.getElementById('google_translate_element');
        if (!container) {
            return;
        }

        const includedLanguages = 'en,zh-CN,zh-TW,ja,th,vi,tl,fr,de,id,ru,es';

        const instantiateWidget = () => {
            if (container.dataset.translateInitialized === 'true') {
                return;
            }

            if (
                !window.google ||
                !window.google.translate ||
                !window.google.translate.TranslateElement
            ) {
                return;
            }

            container.dataset.translateInitialized = 'true';

            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'ko',
                    includedLanguages,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                },
                'google_translate_element'
            );
        };

        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
            instantiateWidget();
            return;
        }

        window.googleTranslateElementInit = () => {
            instantiateWidget();
        };

        const existingScript = document.querySelector(
            'script[src^="https://translate.google.com/translate_a/element.js"]'
        );
        if (existingScript) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    };

    initializeGoogleTranslate();

    const darkModeToggle = ensureDarkModeToggle();
    if (darkModeToggle) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = getStoredTheme();
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

        const updateDarkToggleLabel = () => {
            const isDark = document.body.classList.contains('theme-dark');
            darkModeToggle.setAttribute('aria-pressed', String(isDark));
            darkModeToggle.innerHTML =
                `<span class="dark-mode-toggle__icon" aria-hidden="true">${isDark ? '☀️' : '🌙'}</span>` +
                `<span class="dark-mode-toggle__label">${isDark ? '라이트 모드' : '다크 모드'}</span>`;
        };

        applyTheme(initialTheme);
        updateDarkToggleLabel();

        darkModeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('theme-dark');
            const nextTheme = isDark ? 'light' : 'dark';
            applyTheme(nextTheme);
            storeTheme(nextTheme);
            updateDarkToggleLabel();
        });

        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleMediaChange = (event) => {
                if (getStoredTheme()) {
                    return;
                }

                applyTheme(event.matches ? 'dark' : 'light');
                updateDarkToggleLabel();
            };

            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', handleMediaChange);
            } else if (typeof mediaQuery.addListener === 'function') {
                mediaQuery.addListener(handleMediaChange);
            }
        }
    }

    const scrollButton = ensureScrollButton();
    if (scrollButton) {
        const toggleVisibility = () => {
            const shouldShow = window.scrollY > 240;
            scrollButton.classList.toggle('is-visible', shouldShow);
        };

        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();
    }
};

const runWhenReady = () => {
    if (initialize.hasRun) {
        return;
    }

    if (document.querySelector('.site-header .container') || window.__includesReady) {
        initialize();
        return;
    }

    const handleIncludesReady = () => {
        initialize();
    };

    document.addEventListener('includes:ready', handleIncludesReady, { once: true });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runWhenReady);
} else {
    runWhenReady();
}
