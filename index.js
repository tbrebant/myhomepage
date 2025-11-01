class App extends DoDom {
  constructor () {
    super('div', { class: 'app', attachToBody: true });

    const dropdown = [
      { label: 'DuckDuckGo', value: 'duckduckgo', url: 'https://www.duckduckgo.com/?q={q}' },
      { label: 'DuckDuckGo Images', value: 'duckduckgo-images', url: 'https://duckduckgo.com/?q={q}&iar=images', shortcuts: ['i'] },
      { label: 'Google', value: 'google', url: 'https://www.google.com/search?q={q}', shortcuts: ['g'] },
      { label: 'Google Images', value: 'google-images', url: 'https://www.google.com/search?tbm=isch&q={q}', shortcuts: ['gi'] },
      { label: 'YouTube', value: 'youtube', url: 'https://www.youtube.com/results?search_query={q}', shortcuts: ['y'] },
      { label: 'Yahoo jp', value: 'yahoo', url: 'https://search.yahoo.co.jp/search?p={q}', shortcuts: ['ya'] },
      { label: 'ChatGPT', value: 'chatgpt', url: 'https://chat.openai.com/?q={q}' },
      { label: '⇒ English', value: 'translate', url: 'https://translate.google.com/?sl=auto&tl=en&text={q}&op=translate', shortcuts: ['te'] },
      { label: '⇒ French', value: 'translate-fr', url: 'https://translate.google.com/?sl=auto&tl=fr&text={q}&op=translate', shortcuts: ['t', 'tf'] },
      { label: '⇒ Japanese', value: 'translate-ja', url: 'https://translate.google.com/?sl=auto&tl=ja&text={q}&op=translate', shortcuts: ['tj'] },
      { label: 'Google (fr results)', value: 'google-fr', url: 'https://www.google.com/search?q={q}&lr=lang_fr&hl=fr', shortcuts: ['gf'] },
      { label: 'Google (en results)', value: 'google-en', url: 'https://www.google.com/search?q={q}&lr=lang_en&hl=en', shortcuts: ['ge'] },
      { label: 'Google (ja results)', value: 'google-ja', url: 'https://www.google.com/search?q={q}&lr=lang_ja&hl=ja', shortcuts: ['gj'] },
    ];

    this.config = {
      pages: {
        perso: {
          title: 'Perso',
          logo: { src: './mountain.jpg' },
          dropdown: [...dropdown],
          links: [
            { label: 'ChatGPT', url: 'https://chatgpt.com/' },
            { label: 'Gmail', url: 'https://mail.google.com/' },
            { label: 'docteeboh', url: 'https://www.docteeboh.net' },
            { label: 'Github', url: 'https://github.com/' },
            { label: 'Maps', url: 'https://www.google.com/maps' },
            { label: 'bgg', url: 'https://boardgamegeek.com/' },
            { label: 'Deepl', url: 'https://www.deepl.com/en/translator' },
            { label: 'YouTube', url: 'https://www.youtube.com/' },
            { label: 'Canard PC', url: 'https://www.canardpc.com/' }
          ]
        },
        work: {
          title: 'Work',
          logo: { src: './psychedelic.jpg' },
          dropdown: [...dropdown],
          links: [
            { label: 'Gmail', url: 'https://mail.google.com/' },
            { label: 'Calendar', url: 'https://calendar.google.com/' },
            { label: 'Meet', url: 'https://meet.google.com/' },
            { label: 'Github', url: 'https://github.com/' },
            { label: 'AWS', url: 'https://us-east-1.console.aws.amazon.com/s3/buckets' },
            { label: 'ChatGPT', url: 'https://chatgpt.com/' },
            { label: 'Maps', url: 'https://www.google.com/maps' },
          ]
        }
      },
      default: 'perso'
    };

    this.shortcutActive = false;
    this.shortcutBuffer = [];
    this.shortcutBufferRaw = [];
    this.dropdownShortcuts = {};

    this.settingsButton = this.addDoDom('div', { class: 'settings-button', html: '&lt;&lt;' });

    this.mainContainer = this.addDoDom('div', { class: 'main-container' });

    this.logo = this.mainContainer.addDoDom('div', { class: 'logo-img' });

    this.mainContent = this.mainContainer.addDoDom('div', {});

    this.form = this.mainContent.addDoDom('form', { class: 'search-container' });

    this.searchBox = this.form.addDoDom('input', { class: 'searchbox' });
    this.searchBox.dom.type = 'text';
    this.searchBox.dom.name = 'searchbox';
    this.searchBox.dom.placeholder = 'Looking for something?';
    this.searchBox.dom.autofocus = true;
    this.searchBox.dom.autocomplete = 'off';

    this.searchAction = this.form.addDoDom('div', { class: 'search-actions' });
    this.searchDropdown = this.searchAction.addDoDom('select', { class: 'search-dropdown' });
    this.submitButton = this.searchAction.addDoDom('button', { text: 'Go', class: 'search-submit' });
    this.submitButton.dom.type = 'submit';

    this.linksContainer = this.mainContent.addDoDom('div', { class: 'link-columns' });

    this.settingsManager = new SettingsManager('homepage');

    this.settingsWrapper = this.addDoDom('div', { class: 'settingsWrapper' });
    this.settingsContainer = this.settingsWrapper.addDoDom('div', { class: 'settingsContainer' });
    this.closeSettingsBtn = this.settingsContainer.addDoDom('div', { html: '&gt;&gt;', class: 'closeSettingsBtn' });
    this.settingsTitle = this.settingsContainer.addDoDom('div', { text: 'Settings', class: 'title' });
    // *** Page selector ***
    this.pageCheckboxes = {};
    const initialPageKey = this.getInitialPageKey();
    this.currentPageKey = initialPageKey;
    this.renderSettingsPages();
    this.renderPage(initialPageKey);
    // *** Custom CSS ***
    this.customCssSection = this.settingsContainer.addDoDom('div', { class: 'settingsSection' });
    this.customCssLabel = this.customCssSection.addDoDom('label', { text: 'Custom CSS', class: 'settingsLabel' });
    this.customCssTextarea = this.customCssSection.addDoDom('textarea', { class: 'settingsTextarea' });
    this.customCssTextarea.dom.rows = 8;
    this.customCssTextarea.dom.placeholder = '/* Write CSS rules here */';
    this.customCssLabel.dom.htmlFor = 'settings-custom-css';
    this.customCssTextarea.dom.id = 'settings-custom-css';
    // *** Reload button ***
    this.reloadButton = this.settingsContainer.addDoDom('button', { text: 'Reload', class: 'settingsReloadBtn' });
    this.reloadButton.dom.type = 'button';

    this.performSearch = this.performSearch.bind(this);
    this.onDropdownKeydown = this.onDropdownKeydown.bind(this);
    this.onCustomCssInput = this.onCustomCssInput.bind(this);
    this.onSearchboxKeydown = this.onSearchboxKeydown.bind(this);
    this.onSearchboxKeyup = this.onSearchboxKeyup.bind(this);

    this.attachEventListeners();
    this.focusSearchInput();

    const savedCustomCss = this.settingsManager.get('custom-css', '');
    this.customCssTextarea.dom.value = savedCustomCss;
    this.updateCustomCss(savedCustomCss);

    window.renderPage = this.renderPage.bind(this);
  }

  onSearchboxKeyup (event) {
    if (event.key !== 'Shift') return;

    const bufferJoined = this.shortcutBuffer.join('');
    const rawText = this.shortcutBufferRaw.join('');

    this.shortcutActive = false;
    this.shortcutBuffer = [];
    this.shortcutBufferRaw = [];

    if (!bufferJoined) return;

    const handled = this.applyShortcutFromBuffer(bufferJoined);
    if (handled) {
      this.focusSearchInput();
    } else {
      this.insertTextAtCursor(rawText);
    }
  }

  applyShortcutFromBuffer (shortcut = '') {
    const key = `${shortcut}`.toLowerCase();
    const dropdownValue = this.dropdownShortcuts?.[key];
    if (!dropdownValue) return false;

    const dropdown = this.searchDropdown?.dom;
    if (!dropdown) return false;

    dropdown.value = dropdownValue;
    dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    this.performSearch();
    return true;
  }

  insertTextAtCursor (text = '') {
    if (!text) return;
    const input = this.searchBox?.dom;
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    input.value = `${before}${text}${after}`;

    const caret = start + text.length;
    if (typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(caret, caret);
    }
  }

  attachEventListeners () {
    this.settingsButton.onClick(() => this.openCloseSettings(true));
    this.closeSettingsBtn.onClick(() => this.openCloseSettings(false));
    this.submitButton.onClick(this.performSearch);
    this.reloadButton.onClick(() => this.hardReload());
    this.searchBox.dom.addEventListener('keydown', this.onSearchboxKeydown);
    this.searchBox.dom.addEventListener('keyup', this.onSearchboxKeyup);
    this.form.dom.addEventListener('submit', this.performSearch);
    this.searchDropdown.dom.addEventListener('keydown', this.onDropdownKeydown);
    this.customCssTextarea.dom.addEventListener('input', this.onCustomCssInput);
  }

  renderDropdown (dropdownDef = []) {
    const select = this.searchDropdown;
    select.destroyChildren();
    this.dropdownShortcuts = {};
    this.currentDropdownDef = dropdownDef;
    dropdownDef.forEach(opt => {
      const option = select.addDoDom('option', { text: opt.label });
      option.dom.value = opt.value;
      option.dom.dataset.url = opt.url;
      const shortcuts = Array.isArray(opt.shortcuts)
        ? opt.shortcuts
        : (opt.shortcut ? [opt.shortcut] : []);
      if (shortcuts?.length) {
        option.dom.dataset.shortcuts = shortcuts.join(',');
        shortcuts.forEach(shortcut => {
          const key = `${shortcut}`.trim().toLowerCase();
          if (!key) return;
          this.dropdownShortcuts[key] = opt.value;
        });
      }
    });
  }

  renderLinks (linksDef = []) {
    const container = this.linksContainer;
    container.destroyChildren();
    linksDef.forEach(link => {
      const anchor = container.addDoDom('a', { text: link.label });
      anchor.dom.href = link.url;
      anchor.dom.target = '_self';
      anchor.dom.rel = 'noopener noreferrer';
    });
  }

  renderSettingsPages () {
    if (!this.settingsContainer?.dom) return;

    if (!this.pageToggleContainer) {
      this.pageToggleContainer = this.settingsContainer.addDoDom('div', { class: 'settingsPageToggleContainer' });
    } else {
      this.pageToggleContainer.destroyChildren();
    }

    this.pageCheckboxes = {};

    Object.entries(this.config.pages || {}).forEach(([key, page]) => {
      const option = this.pageToggleContainer.addDoDom('label', { class: 'settingsPageToggle' });
      const checkbox = option.addDoDom('input', {});
      checkbox.dom.type = 'checkbox';
      checkbox.dom.name = 'settings-page';
      checkbox.dom.value = key;
      checkbox.dom.addEventListener('change', event => this.onPageToggleChange(key, event));
      option.addDoDom('span', { text: page.title ?? key });
      this.pageCheckboxes[key] = checkbox;
    });

    this.updateSettingsPageSelection(this.currentPageKey || this.config.default);
  }

  onPageToggleChange (key, event) {
    const input = event?.target;
    if (!input?.checked) {
      if (input) input.checked = true;
      return;
    }

    this.updateSettingsPageSelection(key);
    if (this.currentPageKey !== key) {
      this.renderPage(key);
    }
  }

  updateSettingsPageSelection (activeKey) {
    Object.entries(this.pageCheckboxes || {}).forEach(([key, checkbox]) => {
      const input = checkbox?.dom;
      if (!input) return;
      input.checked = key === activeKey;
    });
  }

  getInitialPageKey () {
    const savedKey = this.settingsManager?.get('page-id');
    if (savedKey && this.config.pages?.[savedKey]) {
      return savedKey;
    }
    return this.config.default;
  }

  renderPage (key) {
    const pageKey = key || this.config.default;
    const page = this.config.pages[pageKey];
    if (!page) return;
    this.currentPageKey = pageKey;
    this.settingsManager?.set('page-id', pageKey);
    this.logo.setStyle('backgroundImage', `url(${page.logo.src})`);
    this.renderDropdown(page.dropdown);
    this.renderLinks(page.links);
    this.updateSettingsPageSelection(pageKey);
  }

  buildUrlFromTemplate (template, params = {}) {
    if (!template) return '';
    return template.replace(/\{([^}]+)\}/g, (_, key) => encodeURIComponent(params[key] ?? ''));
  }

  performSearch (event) {
    if (event) {
      event.preventDefault();
    }

    const query = this.searchBox?.dom?.value || '';
    const dropdown = this.searchDropdown?.dom;
    const selected = dropdown?.options?.[dropdown.selectedIndex];
    const template = selected?.dataset?.url;

    if (template) {
      const url = this.buildUrlFromTemplate(template, { q: query });
      if (url) {
        window.location.href = url;
      }
    } else {
      console.error('Unknown template');
      alert('Unknown template');
    }
  }

  onDropdownKeydown (event) {
    if (!this.searchDropdown?.dom) return;

    if (event.key === 'Enter') {
      this.performSearch(event);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();

      let delta = 0;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') delta = -1;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') delta = 1;

      this.adjustDropdownSelection(delta);
    }
  }

  openCloseSettings (open = true) {
    if (open) {
      this.settingsWrapper.setStyle('display', 'block');
      this.settingsContainer.reflow(); // reflow to enable transition
      this.settingsContainer.setStyle('right', '2vh');
      this.mainContainer.setStyle('filter', 'blur(5px)');
      this.settingsButton.setStyles({ opacity: '0', pointerEvents: 'none' });
    } else {
      this.settingsContainer.setStyle('right', '');
      this.mainContainer.setStyle('filter', '');
      this.settingsButton.setStyles({ opacity: '', pointerEvents: '' });
    }
  }

  focusSearchInput () {
    const input = this.searchBox.dom;
    input.focus();
    input.value = input.value; // move caret to end
  }

  ensureCustomCssStyleElement () {
    const existing = document.querySelector('style[data-settings-custom-css="true"]');
    if (existing) return existing;
    const styleEl = document.createElement('style');
    styleEl.dataset.settingsCustomCss = 'true';
    document.head.appendChild(styleEl);
    return styleEl;
  }

  updateCustomCss (css = '') {
    const styleEl = this.ensureCustomCssStyleElement();
    if (!styleEl) return;
    styleEl.textContent = css || '';
  }

  onCustomCssInput (event) {
    const css = event?.target?.value ?? '';
    this.settingsManager?.set('custom-css', css);
    this.updateCustomCss(css);
  }

  onSearchboxKeydown (event) {
    if (event.key === 'Shift') {
      this.shortcutActive = true;
      this.shortcutBuffer = [];
      this.shortcutBufferRaw = [];
      return;
    }

    if (this.shortcutActive && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (/^[a-z0-9]$/i.test(event.key)) {
        event.preventDefault();
        this.shortcutBuffer.push(event.key.toLowerCase());
        this.shortcutBufferRaw.push(event.key);
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        this.shortcutBuffer.pop();
        this.shortcutBufferRaw.pop();
        return;
      }
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const delta = event.key === 'ArrowUp' ? -1 : 1;
      this.adjustDropdownSelection(delta);
    }
  }

  adjustDropdownSelection (delta = 0) {
    if (delta === 0) return;
    const dropdown = this.searchDropdown.dom;
    const newIndex = dropdown.selectedIndex + delta;
    if (newIndex >= 0 && newIndex < dropdown.options.length) {
      dropdown.selectedIndex = newIndex;
    }
  }

  hardReload () {
    const now = Date.now();

    // Force-refresh all external resources
    document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]').forEach(el => {
      const attr = el.tagName === 'LINK' ? 'href' : 'src';
      const url = new URL(el[attr], location.origin);
      url.searchParams.set('reload', now);
      el[attr] = url.toString();
    });

    // Finally reload the HTML document itself with a cache-busting query
    const baseUrl = location.href.split('?')[0];
    location.replace(`${baseUrl}?reload=${now}`);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
