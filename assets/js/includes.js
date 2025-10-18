(() => {
    const INCLUDE_ATTR = 'data-include';

    const ensureFavicon = () => {
        const head = document.head;
        if (!head) {
            return;
        }

        const hasFavicon = head.querySelector('link[rel~="icon"]');
        if (hasFavicon) {
            return;
        }

        const faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        faviconLink.setAttribute('type', 'image/png');
        faviconLink.setAttribute('href', 'assets/icons/gtcc.png');
        head.appendChild(faviconLink);
    };

    ensureFavicon();

    const loadIncludes = async () => {
        const elements = Array.from(document.querySelectorAll(`[${INCLUDE_ATTR}]`));

        if (elements.length === 0) {
            window.__includesReady = true;
            document.dispatchEvent(new CustomEvent('includes:ready'));
            return;
        }

        await Promise.all(
            elements.map(async (element) => {
                const url = element.getAttribute(INCLUDE_ATTR);
                if (!url) {
                    return;
                }

                try {
                    const response = await fetch(url, { cache: 'no-cache' });
                    if (!response.ok) {
                        throw new Error(`Failed to load include: ${url}`);
                    }

                    const html = await response.text();
                    element.innerHTML = html;
                    element.removeAttribute(INCLUDE_ATTR);
                } catch (error) {
                    console.error(error);
                }
            })
        );

        window.__includesReady = true;
        document.dispatchEvent(new CustomEvent('includes:ready'));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadIncludes);
    } else {
        loadIncludes();
    }
})();
