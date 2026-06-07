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

    const setupModernShell = () => {
        const header = document.querySelector('.site-header');
        const nav = document.querySelector('.main-nav');
        const headerContainer = header ? header.querySelector('.container') : null;

        if (nav) {
            nav.querySelectorAll('.mega-menu').forEach((menu) => {
                const columns = Array.from(menu.querySelectorAll(':scope > .mega-columns > .mega-column'));
                columns.forEach((column) => {
                    if (!column.querySelector('.mega-section, a')) {
                        column.remove();
                    }
                });

                const activeColumns = menu.querySelectorAll(':scope > .mega-columns > .mega-column').length;
                if (activeColumns > 0 && activeColumns <= 4) {
                    menu.dataset.megaColumns = String(activeColumns);
                }
            });
        }

        if (header && nav && headerContainer && !header.querySelector('[data-mobile-menu-toggle]')) {
            header.classList.add('site-header--modern');
            nav.id = nav.id || 'primary-navigation';

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'mobile-menu-toggle';
            toggle.setAttribute('data-mobile-menu-toggle', '');
            toggle.setAttribute('aria-controls', nav.id);
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML =
                '<span class="mobile-menu-toggle__bar"></span>' +
                '<span class="mobile-menu-toggle__bar"></span>' +
                '<span class="mobile-menu-toggle__bar"></span>' +
                '<span class="sr-only">메뉴</span>';

            headerContainer.insertBefore(toggle, nav);

            const mobileSubmenuSelectors = [
                '.mega-menu',
                '.mega-columns',
                '.mega-column',
                '.mega-section',
                '.mega-section ul',
                '.mega-submenu',
                '.mega-section li',
                '.mega-section a',
                '.mega-heading'
            ];

            const forceMobileSubmenus = (isOpen) => {
                const elements = nav.querySelectorAll(mobileSubmenuSelectors.join(','));
                elements.forEach((element) => {
                    if (!(element instanceof HTMLElement)) {
                        return;
                    }

                    if (!isOpen) {
                        element.removeAttribute('style');
                        return;
                    }

                    element.style.visibility = 'visible';
                    element.style.opacity = '1';
                    element.style.maxHeight = 'none';
                    element.style.height = 'auto';
                    element.style.overflow = 'visible';
                    element.style.pointerEvents = 'auto';

                    if (element.matches('.mega-menu')) {
                        element.style.display = 'block';
                        element.style.position = 'static';
                        element.style.width = '100%';
                        element.style.padding = '1rem';
                        element.style.marginTop = '0.45rem';
                    } else if (element.matches('.mega-columns, .mega-column, .mega-section, .mega-section ul, .mega-submenu')) {
                        element.style.display = 'grid';
                    } else if (element.matches('.mega-section a, .mega-heading')) {
                        element.style.display = 'block';
                        element.style.whiteSpace = 'normal';
                        element.style.textOverflow = 'clip';
                    } else {
                        element.style.display = 'block';
                    }
                });
            };

            const closeMenu = () => {
                document.body.classList.remove('is-mobile-menu-open');
                toggle.setAttribute('aria-expanded', 'false');
                forceMobileSubmenus(false);
                nav.querySelectorAll('li.has-mega').forEach((item) => {
                    item.classList.remove('is-open');
                    item.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
                });
            };

            toggle.addEventListener('click', () => {
                const isOpen = document.body.classList.toggle('is-mobile-menu-open');
                toggle.setAttribute('aria-expanded', String(isOpen));
                nav.querySelectorAll('li.has-mega').forEach((item) => {
                    item.classList.toggle('is-open', isOpen);
                    item.querySelector(':scope > a')?.setAttribute('aria-expanded', String(isOpen));
                });
                forceMobileSubmenus(isOpen);
            });

            nav.addEventListener('click', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) {
                    return;
                }

                const link = target.closest('a');
                const isTopLevelMegaLink =
                    link instanceof HTMLElement && link.parentElement?.classList.contains('has-mega');
                if (document.body.classList.contains('is-mobile-menu-open') && isTopLevelMegaLink) {
                    event.preventDefault();
                    forceMobileSubmenus(true);
                    return;
                }

                if (link) {
                    closeMenu();
                }
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeMenu();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 860) {
                    closeMenu();
                }
            });
        }

        const pageName = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        document.body.classList.toggle('is-home-page', pageName === '' || pageName === 'index.html');

        const pageGroups = [
            ['is-admissions-page', /admission|enrollment|course-|readmission|transfer|graduation|leave-|withdrawal|double-minor/],
            ['is-scholarship-page', /scholarship/],
            ['is-program-page', /program|college-|graduate-|lifelong-|medicine|convergence|academics/],
            ['is-news-page', /news|notice|event|press|newsletter|media/],
            ['is-support-page', /support/],
        ];

        pageGroups.forEach(([className, matcher]) => {
            document.body.classList.toggle(className, matcher.test(pageName));
        });
    };

    const setupMobileConsultBar = () => {
        if (document.querySelector('[data-mobile-consult-bar]')) {
            return;
        }

        const phoneLink = document.querySelector('a[href^="tel:"]');
        const kakaoLink =
            Array.from(document.querySelectorAll('a[href]')).find((link) =>
                /open\.kakao\.com/i.test(link.getAttribute('href') || '')
            ) || null;

        if (!phoneLink && !kakaoLink) {
            return;
        }

        const bar = document.createElement('div');
        bar.className = 'mobile-consult-bar';
        bar.setAttribute('data-mobile-consult-bar', '');
        bar.setAttribute('aria-label', '모바일 빠른 상담');

        if (phoneLink) {
            const phone = document.createElement('a');
            phone.href = phoneLink.getAttribute('href') || '#';
            phone.className = 'mobile-consult-bar__link mobile-consult-bar__link--phone';
            phone.textContent = '전화 상담';
            bar.appendChild(phone);
        }

        if (kakaoLink) {
            const kakao = document.createElement('a');
            kakao.href = kakaoLink.getAttribute('href') || '#';
            kakao.className = 'mobile-consult-bar__link mobile-consult-bar__link--primary';
            kakao.textContent = '카카오 상담';
            if (kakaoLink.getAttribute('target')) {
                kakao.target = kakaoLink.getAttribute('target');
            }
            kakao.rel = 'noopener noreferrer';
            bar.appendChild(kakao);
        }

        document.body.appendChild(bar);
    };

    const setupHomeConversionLayout = () => {
        if (!document.body.classList.contains('is-home-page')) {
            return;
        }

        const main = document.querySelector('main');
        const hero = document.querySelector('.hero-slider');
        if (!main || !hero) {
            return;
        }

        document.body.classList.add('home-conversion-layout');

        const phoneHref = document.querySelector('a[href^="tel:"]')?.getAttribute('href') || 'tel:010-5909-9320';
        const kakaoHref =
            Array.from(document.querySelectorAll('a[href]')).find((link) =>
                /open\.kakao\.com/i.test(link.getAttribute('href') || '')
            )?.getAttribute('href') || 'https://open.kakao.com/o/pfJrLjVh';

        const activeHeroContainer = hero.querySelector('[data-hero-slide]:first-child .container');
        if (activeHeroContainer && !activeHeroContainer.querySelector('.hero-consult-panel')) {
            const panel = document.createElement('aside');
            panel.className = 'hero-consult-panel';
            panel.setAttribute('aria-label', '빠른 상담 정보');
            panel.innerHTML =
                '<span>상담 정보</span>' +
                '<strong>010-5909-9320</strong>' +
                '<small>평일 09:00 - 18:00</small>' +
                '<hr>' +
                '<strong>상담 분야</strong>' +
                '<small>입학 상담, 장학, 학과 선택, 학습 상담</small>';
            activeHeroContainer.appendChild(panel);
        }

        if (!document.querySelector('[data-generated-admissions-strip]')) {
            const admissions = document.createElement('section');
            admissions.className = 'section admissions-strip generated-conversion-section';
            admissions.setAttribute('data-generated-admissions-strip', '');
            admissions.innerHTML =
                '<div class="container">' +
                '<div class="conversion-card conversion-card--wide">' +
                '<div><span class="conversion-eyebrow">Admissions</span>' +
                '<h2>입학 준비, 먼저 상담으로 확인하세요</h2>' +
                '<p>지원 가능 과정, 제출 서류, 장학 혜택, 학습 방식까지 한 번에 안내받을 수 있습니다.</p></div>' +
                '<div class="conversion-actions">' +
                `<a class="btn primary" href="${kakaoHref}" target="_blank" rel="noopener noreferrer">입학 상담</a>` +
                `<a class="btn ghost" href="${phoneHref}">전화 상담</a>` +
                '</div></div></div>';
            hero.insertAdjacentElement('afterend', admissions);
        }

        if (!document.querySelector('[data-generated-interest-card]')) {
            const interest = document.createElement('section');
            interest.className = 'section interest-consult generated-conversion-section';
            interest.setAttribute('data-generated-interest-card', '');
            interest.innerHTML =
                '<div class="container">' +
                '<div class="conversion-card conversion-card--split">' +
                '<div><span class="conversion-eyebrow">Quick Match</span>' +
                '<h2>관심 과정을 선택하면 상담 방향을 빠르게 잡을 수 있습니다</h2>' +
                '<p>아직 과정이 정해지지 않아도 괜찮습니다. 관심 분야만 선택해도 필요한 준비 순서를 안내받을 수 있습니다.</p></div>' +
                '<form class="interest-form">' +
                '<label>관심 과정<select aria-label="관심 과정 선택"><option>학위 과정</option><option>학과 과정</option><option>장학 혜택</option><option>평생교육 과정</option><option>국제 자격 과정</option></select></label>' +
                `<a class="btn primary" href="${kakaoHref}" target="_blank" rel="noopener noreferrer">입학 상담</a>` +
                `<a class="btn ghost" href="${phoneHref}">전화 상담</a>` +
                '</form></div></div>';

            const afterAdmissions = document.querySelector('[data-generated-admissions-strip]');
            (afterAdmissions || hero).insertAdjacentElement('afterend', interest);
        }

        const quickLinks = document.querySelector('.quick-links');
        const interestCard = document.querySelector('[data-generated-interest-card]');
        if (quickLinks && interestCard && quickLinks.previousElementSibling !== interestCard) {
            interestCard.insertAdjacentElement('afterend', quickLinks);
        }

        const programs = document.querySelector('#programs');
        if (programs && quickLinks && programs.previousElementSibling !== quickLinks) {
            quickLinks.insertAdjacentElement('afterend', programs);
        }

        const support = document.querySelector('#support');
        if (support && programs && support.previousElementSibling !== programs) {
            programs.insertAdjacentElement('afterend', support);
        }

        if (!document.querySelector('[data-generated-scholarship-strip]')) {
            const scholarship = document.createElement('section');
            scholarship.className = 'section scholarship-strip generated-conversion-section';
            scholarship.setAttribute('data-generated-scholarship-strip', '');
            scholarship.innerHTML =
                '<div class="container split">' +
                '<div><span class="conversion-eyebrow">Scholarship</span>' +
                '<h2>학습 비용은 장학 혜택과 함께 확인하세요</h2>' +
                '<p>과정 선택 전 장학 가능 여부를 함께 확인하면 학습 계획을 더 현실적으로 세울 수 있습니다.</p>' +
                '<div class="hero-actions">' +
                '<a class="btn primary" href="scholarship-benefits.html">장학 혜택 보기</a>' +
                `<a class="btn ghost" href="${kakaoHref}" target="_blank" rel="noopener noreferrer">입학 상담</a>` +
                '</div></div>' +
                '<div class="scholarship-mini-grid">' +
                '<article><strong>재직자 상담</strong><span>일과 학습을 병행하는 학습자 혜택 확인</span></article>' +
                '<article><strong>편입생 상담</strong><span>보유 학습 이력에 맞춘 비용 계획</span></article>' +
                '<article><strong>과정별 안내</strong><span>학위, 평생교육, 자격 과정별 기준</span></article>' +
                '<article><strong>신청 절차</strong><span>필요 서류와 상담 순서 확인</span></article>' +
                '</div></div>';

            if (support) {
                support.insertAdjacentElement('beforebegin', scholarship);
            } else if (programs) {
                programs.insertAdjacentElement('afterend', scholarship);
            }
        }

        const sections = Array.from(main.querySelectorAll(':scope > section')).filter(
            (section) => !section.classList.contains('hero-slider')
        );
        const mediaSection = sections.find((section) => section.querySelector('[data-video-slider], iframe[src*="youtube"]'));
        const scholarshipSection =
            sections.find((section) => /scholarship|장학/i.test(section.textContent || '')) ||
            document.querySelector('#support');
        if (mediaSection) {
            mediaSection.classList.add('home-media-section');
        }
        if (scholarshipSection) {
            scholarshipSection.classList.add('home-scholarship-section');
        }
    };

    setupModernShell();
    setupMobileConsultBar();
    setupHomeConversionLayout();
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

                if (document.body.classList.contains('is-home-page')) {
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

        const includedLanguages = 'ko,en,zh-CN,zh-TW,ja,th,vi,tl,fr,de,id,ru,es';

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

    applyTheme('light');
    document.querySelectorAll('[data-theme-toggle], .dark-mode-toggle').forEach((toggle) => {
        toggle.remove();
    });

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

    const setupModernReveal = () => {
        const candidates = document.querySelectorAll(
            '.quick-item, .highlight-card, .news-card, .guide-card, .stat-card, .resource-card, .detail-card, .program-card, .support-card, .contact-card, .info-card, .admission-card, .scholarship-card, .benefit-card, .process-card, .timeline-card, .profile-card, .profile-content, .info-block, .info-aside, .department-hero, .department-section, .department-card, .career-card, .faculty-card, .page-body, .page-detail, .page-hero, .section-heading, .support-cta, .image-slider, .video-slider'
        );

        if (!candidates.length) {
            return;
        }

        candidates.forEach((element) => {
            element.classList.add('modern-reveal');
        });

        if (!('IntersectionObserver' in window)) {
            candidates.forEach((element) => element.classList.add('is-revealed'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: '0px 0px -8% 0px',
                threshold: 0.12,
            }
        );

        candidates.forEach((element) => observer.observe(element));
    };

    setupModernReveal();
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
