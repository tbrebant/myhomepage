const VERSION = '1.1.1';

const SEARCH_ENGINES = [
  { label: 'DuckDuckGo', value: 'duckduckgo', url: 'https://www.duckduckgo.com/?q={q}', shortcuts: ['d', 'dd'] },
  { label: 'DuckDuckGo Images', value: 'duckduckgo-images', url: 'https://duckduckgo.com/?q={q}&iar=images', shortcuts: ['i', 'di', 'ddi'] },
  { label: 'Google', value: 'google', url: 'https://www.google.com/search?q={q}', shortcuts: ['g', 'gg'] },
  { label: 'Google Images', value: 'google-images', url: 'https://www.google.com/search?tbm=isch&q={q}', shortcuts: ['gi', 'ggi'] },
  { label: 'YouTube', value: 'youtube', url: 'https://www.youtube.com/results?search_query={q}', shortcuts: ['y', 'yt'] },
  { label: 'Yahoo jp', value: 'yahoo', url: 'https://search.yahoo.co.jp/search?p={q}', shortcuts: ['ya', 'yj'] },
  { label: 'ChatGPT', value: 'chatgpt', url: 'https://chat.openai.com/?q={q}', shortcuts: ['c', 'cg'] },
  { label: '⇒ English', value: 'translate', url: 'https://translate.google.com/?sl=auto&tl=en&text={q}&op=translate', shortcuts: ['te'] },
  { label: '⇒ French', value: 'translate-fr', url: 'https://translate.google.com/?sl=auto&tl=fr&text={q}&op=translate', shortcuts: ['t', 'tf'] },
  { label: '⇒ Japanese', value: 'translate-ja', url: 'https://translate.google.com/?sl=auto&tl=ja&text={q}&op=translate', shortcuts: ['tj'] },
  { label: 'Google (fr results)', value: 'google-fr', url: 'https://www.google.com/search?q={q}&lr=lang_fr&hl=fr', shortcuts: ['gf', 'gfr'] },
  { label: 'Google (en results)', value: 'google-en', url: 'https://www.google.com/search?q={q}&lr=lang_en&hl=en', shortcuts: ['ge', 'gen'] },
  { label: 'Google (ja results)', value: 'google-ja', url: 'https://www.google.com/search?q={q}&lr=lang_ja&hl=ja', shortcuts: ['gj', 'gja'] },
  { label: 'DuckDuckGo (fr results)', value: 'duckduckgo-fr', url: 'https://www.duckduckgo.com/?q={q}&kl=fr-fr', shortcuts: ['df', 'dfr', 'ddf'] },
  { label: 'DuckDuckGo (en results)', value: 'duckduckgo-en', url: 'https://www.duckduckgo.com/?q={q}&kl=us-en', shortcuts: ['de', 'den', 'dde'] },
  { label: 'DuckDuckGo (ja results)', value: 'duckduckgo-ja', url: 'https://www.duckduckgo.com/?q={q}&kl=jp-ja', shortcuts: ['dj', 'dja', 'ddj'] }
];

const MEMOS = {
  ascii: '● •<br/>✓ ✔ ☑ ✅ ✗ ✘ ❌<br/>➜ ⬆ ➡ ⬇ ⬅<br/>—<br/>├ ─ │ └'
};

const BASE_PAGES = {
  perso: {
    title: 'Perso',
    logoSrc: './mountain.jpg',
    links: [
      { label: 'ChatGPT', url: 'https://chatgpt.com/' },
      { label: 'Gmail', url: 'https://mail.google.com/' },
      { label: 'docteeboh', url: 'https://www.docteeboh.net' },
      { label: 'Github', url: 'https://github.com/' },
      { label: 'Maps', url: 'https://www.google.com/maps' },
      { label: 'bgg', url: 'https://boardgamegeek.com/' },
      { label: 'YouTube', url: 'https://www.youtube.com/' },
      { label: 'Canard PC', url: 'https://www.canardpc.com/' },
      { label: 'Ascii', memoKey: 'ascii' }
    ]
  },
  work: {
    title: 'Work',
    logoSrc: './psychedelic.jpg',
    links: [
      { label: 'Gmail', url: 'https://mail.google.com/' },
      { label: 'Calendar', url: 'https://calendar.google.com/' },
      { label: 'Meet', url: 'https://meet.google.com/' },
      { label: 'Github', url: 'https://github.com/' },
      { label: 'AWS', url: 'https://us-east-1.console.aws.amazon.com/s3/buckets' },
      { label: 'ChatGPT', url: 'https://chatgpt.com/' },
      { label: 'Maps', url: 'https://www.google.com/maps' },
      { label: 'Ascii', memoKey: 'ascii' }
    ]
  }
};

function cloneDropdownOptions (options = []) {
  return options.map(option => ({
    ...option,
    shortcuts: Array.isArray(option.shortcuts) ? [...option.shortcuts] : option.shortcuts
  }));
}

function resolveLinks (linkDefs = [], openMemo) {
  return linkDefs.map(link => {
    if (link.memoKey) {
      return { label: link.label, js: () => openMemo(link.memoKey) };
    }
    return { label: link.label, url: link.url };
  });
}

class App extends DoDom {
  constructor () {
    super('div', { class: 'app', attachToBody: true });

    this.settingsManager = new SettingsManager('homepage');

    this.bindInstanceMethods();
    this.initializeState();
    this.loadPreferences();
    this.config = this.buildConfig();

    this.buildLayout();
    this.applyInitialPreferences();

    const initialPageKey = this.getInitialPageKey();
    this.currentPageKey = initialPageKey;
    this.renderSettingsPages();
    this.renderPage(initialPageKey);
    this.applyUrlSearchState();

    this.attachEventListeners();
    this.focusSearchInput();
    this.initializeCustomCss();

    window.renderPage = this.renderPage.bind(this);
  }

  bindInstanceMethods () {
    this.performSearch = this.performSearch.bind(this);
    this.onDropdownKeydown = this.onDropdownKeydown.bind(this);
    this.onCustomCssInput = this.onCustomCssInput.bind(this);
    this.onCustomCssInput = this.onCustomCssInput.bind(this);
    this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
    this.onGlobalKeyup = this.onGlobalKeyup.bind(this);
  }

  initializeState () {
    this.shortcutActive = false;
    this.shortcutBuffer = [];
    this.shortcutBufferRaw = [];
    this.dropdownShortcuts = {};
    this.dropdownSelectionViaPointer = false;
    this.pageCheckboxes = {};
    this.currentDropdownDef = [];
    this.hasAppliedUrlSearchState = false;
  }

  loadPreferences () {
    this.showVersionNumber = this.settingsManager.get('show-version', false);
    this.showDropdownShortcuts = this.settingsManager.get('show-dropdown-shortcuts', true);
    this.autoSearchOnDropdownClick = this.settingsManager.get('auto-search-on-click', true);
    this.urlSearchState = this.readSearchStateFromUrl();
  }

  buildConfig () {
    const openMemo = memoKey => this.openMemo(memoKey);
    const pages = Object.entries(BASE_PAGES).reduce((allPages, [key, page]) => {
      allPages[key] = {
        title: page.title,
        logo: { src: page.logoSrc },
        dropdown: cloneDropdownOptions(SEARCH_ENGINES),
        links: resolveLinks(page.links, openMemo)
      };
      return allPages;
    }, {});

    return {
      pages,
      default: 'perso'
    };
  }

  buildLayout () {
    this.version = this.addDoDom('div', { class: 'version', text: `v${VERSION}` });

    this.clickDetector = this.addDoDom('div', {
      class: 'clickDetector',
      onClick: () => {
        this.openCloseSettings(false);
        this.closePostIt();
      },
      visible: false
    });

    this.settingsButton = this.addDoDom('div', { class: 'settings-button', html: '&lt;&lt;' });

    this.mainContainer = this.addDoDom('div', { class: 'main-container' });
    this.logo = this.mainContainer.addDoDom('div', { class: 'logo-img' });
    this.mainContent = this.mainContainer.addDoDom('div', {});

    this.createSearchForm();
    this.linksContainer = this.mainContent.addDoDom('div', { class: 'link-columns' });

    this.postIt = this.addDoDom('div', { class: 'postIt', visible: false });

    this.createSettingsPanel();
  }

  createSearchForm () {
    this.form = this.mainContent.addDoDom('form', { class: 'search-container' });
    this.searchBox = this.form.addDoDom('input', { class: 'searchbox' });
    Object.assign(this.searchBox.dom, {
      type: 'text',
      name: 'searchbox',
      placeholder: 'Looking for something?',
      autofocus: true,
      autocomplete: 'off'
    });

    const actions = this.form.addDoDom('div', { class: 'search-actions' });
    this.searchDropdown = actions.addDoDom('select', { class: 'search-dropdown' });
    this.submitButton = actions.addDoDom('button', { text: 'Go', class: 'search-submit' });
    this.submitButton.dom.type = 'submit';
  }

  createSettingsPanel () {
    this.settingsWrapper = this.addDoDom('div', { class: 'settingsWrapper' });
    this.settingsContainer = this.settingsWrapper.addDoDom('div', { class: 'settingsContainer' });
    this.closeSettingsBtn = this.settingsContainer.addDoDom('div', { html: '&gt;&gt;', class: 'closeSettingsBtn' });
    this.settingsTitle = this.settingsContainer.addDoDom('div', { text: 'Settings', class: 'title' });

    this.generalSettingsSection = this.createSettingsSection();
    this.showVersionCheckbox = this.createCheckboxSetting({
      parent: this.generalSettingsSection,
      id: 'settings-show-version',
      label: 'Show version number',
      checked: this.showVersionNumber,
      onChange: this.onShowVersionChange.bind(this)
    });

    this.dropdownSettingsSection = this.createSettingsSection();
    this.dropdownShortcutsCheckbox = this.createCheckboxSetting({
      parent: this.dropdownSettingsSection,
      id: 'settings-show-dropdown-shortcuts',
      label: 'Show shortcuts in dropdown',
      checked: this.showDropdownShortcuts,
      onChange: this.onShowDropdownShortcutsChange.bind(this)
    });

    this.autoSearchOnClickCheckbox = this.createCheckboxSetting({
      parent: this.dropdownSettingsSection,
      id: 'settings-auto-search-on-click',
      label: 'Auto search on dropdown click',
      checked: this.autoSearchOnDropdownClick,
      onChange: this.onAutoSearchOnClickChange.bind(this)
    });

    this.customCssSection = this.createSettingsSection();
    this.customCssLabel = this.customCssSection.addDoDom('label', { text: 'Custom CSS', class: 'settingsLabel' });
    this.customCssTextarea = this.customCssSection.addDoDom('textarea', { class: 'settingsTextarea' });
    this.customCssTextarea.dom.rows = 8;
    this.customCssTextarea.dom.placeholder = '/* Write CSS rules here */';
    this.customCssLabel.dom.htmlFor = 'settings-custom-css';
    this.customCssTextarea.dom.id = 'settings-custom-css';

    this.reloadButton = this.settingsContainer.addDoDom('button', { text: 'Reload', class: 'settingsReloadBtn' });
    this.reloadButton.dom.type = 'button';
  }

  createSettingsSection () {
    return this.settingsContainer.addDoDom('div', { class: 'settingsSection' });
  }

  createCheckboxSetting ({ parent, id, label, checked, onChange }) {
    const wrapper = parent.addDoDom('label', { classes: ['settingsLabel', 'settingsCheckboxLabel'] });
    const input = wrapper.addDoDom('input', { class: 'settingsCheckboxInput' });
    input.dom.type = 'checkbox';
    input.dom.id = id;
    input.dom.checked = checked;
    input.dom.addEventListener('change', onChange);
    wrapper.dom.htmlFor = id;
    wrapper.addDoDom('span', { text: label });
    return input;
  }

  applyInitialPreferences () {
    if (!this.showVersionNumber) {
      this.version.hide();
    }
  }

  initializeCustomCss () {
    const savedCustomCss = this.settingsManager.get('custom-css', '');
    this.customCssTextarea.dom.value = savedCustomCss;
    this.updateCustomCss(savedCustomCss);
  }

  attachEventListeners () {
    this.settingsButton.onClick(() => this.openCloseSettings(true));
    this.closeSettingsBtn.onClick(() => this.openCloseSettings(false));
    this.submitButton.onClick(this.performSearch);
    this.reloadButton.onClick(() => this.hardReload());
    this.submitButton.onClick(this.performSearch);
    this.reloadButton.onClick(() => this.hardReload());
    document.addEventListener('keydown', this.onGlobalKeydown);
    document.addEventListener('keyup', this.onGlobalKeyup);
    this.form.dom.addEventListener('submit', this.performSearch);
    this.searchDropdown.dom.addEventListener('keydown', this.onDropdownKeydown);
    this.searchDropdown.dom.addEventListener('change', this.onDropdownChange.bind(this));
    if (typeof window !== 'undefined' && 'PointerEvent' in window) {
      this.searchDropdown.dom.addEventListener('pointerdown', this.onDropdownPointerDown.bind(this));
    } else {
      this.searchDropdown.dom.addEventListener('mousedown', this.onDropdownPointerDown.bind(this));
    }
    this.searchDropdown.dom.addEventListener('blur', this.onDropdownBlur.bind(this));
    this.customCssTextarea.dom.addEventListener('input', this.onCustomCssInput);
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
    input.focus();
  }

  renderDropdown (dropdownDef = []) {
    const select = this.searchDropdown;
    if (!select) return;
    const selectDom = select.dom;
    const previousValue = selectDom?.value;

    select.destroyChildren();
    this.dropdownShortcuts = {};
    this.currentDropdownDef = dropdownDef;
    dropdownDef.forEach(opt => {
      const shortcuts = Array.isArray(opt.shortcuts)
        ? opt.shortcuts
        : (opt.shortcut ? [opt.shortcut] : []);
      const option = select.addDoDom('option', { text: this.formatDropdownLabel(opt, shortcuts) });
      option.dom.value = opt.value;
      option.dom.dataset.url = opt.url;
      if (shortcuts?.length) {
        option.dom.dataset.shortcuts = shortcuts.join(',');
        shortcuts.forEach(shortcut => {
          const key = `${shortcut}`.trim().toLowerCase();
          if (!key) return;
          this.dropdownShortcuts[key] = opt.value;
        });
      }
    });

    if (selectDom) {
      const hasPrevious = dropdownDef.some(opt => opt.value === previousValue);
      const valueToSelect = hasPrevious ? previousValue : dropdownDef?.[0]?.value;
      if (valueToSelect) {
        selectDom.value = valueToSelect;
      }
    }
    this.applyUrlSearchState();
  }

  formatDropdownLabel (optionDef, shortcuts = []) {
    const baseLabel = optionDef?.label ?? '';
    if (!this.showDropdownShortcuts) return baseLabel;
    const list = Array.isArray(shortcuts) ? shortcuts : [];
    if (!list.length) return baseLabel;
    return `${baseLabel} (${list.join(', ')})`;
  }

  renderLinks (linksDef = []) {
    const container = this.linksContainer;
    container.destroyChildren();
    linksDef.forEach(link => {
      const anchor = container.addDoDom('a', { text: link.label });
      if (typeof link.js === 'function') {
        anchor.dom.href = '#';
        anchor.onClick(() => link.js());
      } else {
        anchor.dom.href = link.url;
        anchor.dom.target = '_self';
        anchor.dom.rel = 'noopener noreferrer';
      }
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
    const dropdownValue = dropdown?.value || '';
    this.saveSearchStateToUrl(query, dropdownValue);
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
    this.dropdownSelectionViaPointer = false;

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
      this.settingsContainer.reflow();
      this.settingsContainer.setStyle('right', '2vh');
      this.blurMainContent(true);
      this.settingsButton.setStyles({ opacity: '0', pointerEvents: 'none' });
      this.clickDetector.show();
    } else {
      this.settingsContainer.setStyle('right', '');
      this.blurMainContent(false);
      this.settingsButton.setStyles({ opacity: '', pointerEvents: '' });
      this.clickDetector.hide();
    }
  }

  blurMainContent (onOff = true) {
    this.mainContainer.setStyle('filter', onOff ? 'blur(5px)' : '');
  }

  focusSearchInput () {
    const input = this.searchBox?.dom;
    if (!input) return;
    input.focus();
    input.value = input.value;
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

  onGlobalKeyup (event) {
    if (event.key !== 'Shift') return;
    if (event.target !== this.searchBox.dom && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable)) return;

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

  onShowVersionChange (event) {
    const checked = !!event?.target?.checked;
    this.showVersionNumber = checked;
    this.settingsManager?.set('show-version', checked);
    if (checked) {
      this.version.show();
    } else {
      this.version.hide();
    }
  }

  onShowDropdownShortcutsChange (event) {
    const checked = !!event?.target?.checked;
    this.showDropdownShortcuts = checked;
    this.settingsManager?.set('show-dropdown-shortcuts', checked);
    this.renderDropdown(this.currentDropdownDef || []);
  }

  onAutoSearchOnClickChange (event) {
    const checked = !!event?.target?.checked;
    this.autoSearchOnDropdownClick = checked;
    this.settingsManager?.set('auto-search-on-click', checked);
  }

  onDropdownPointerDown () {
    this.dropdownSelectionViaPointer = true;
  }

  onDropdownBlur () {
    this.dropdownSelectionViaPointer = false;
  }

  onDropdownChange () {
    const triggeredByPointer = this.dropdownSelectionViaPointer;
    this.dropdownSelectionViaPointer = false;
    if (!this.autoSearchOnDropdownClick || !triggeredByPointer) return;
    this.performSearch();
  }

  readSearchStateFromUrl () {
    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const query = params.get('search-query') || '';
      const dropdown = params.get('search-dropdown') || '';
      if (!query && !dropdown) return null;
      return { query, dropdown };
    } catch (error) {
      console.warn('Failed to read search state from URL.', error);
      return null;
    }
  }

  applyUrlSearchState () {
    if (this.hasAppliedUrlSearchState) return;
    const state = this.urlSearchState;
    if (!state) return;

    const dropdown = this.searchDropdown?.dom;
    const searchInput = this.searchBox?.dom;

    if (searchInput && typeof state.query === 'string' && state.query) {
      searchInput.value = state.query;
    }

    if (dropdown && typeof state.dropdown === 'string' && state.dropdown) {
      const matchingOption = Array.from(dropdown.options || []).some(option => option.value === state.dropdown);
      if (matchingOption) {
        dropdown.value = state.dropdown;
      }
    }

    this.hasAppliedUrlSearchState = true;
  }

  saveSearchStateToUrl (query = '', dropdownValue = '') {
    try {
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('search-query', query);
      } else {
        url.searchParams.delete('search-query');
      }

      if (dropdownValue) {
        url.searchParams.set('search-dropdown', dropdownValue);
      } else {
        url.searchParams.delete('search-dropdown');
      }

      const newUrl = url.toString();
      if (newUrl !== window.location.href) {
        window.history.replaceState(window.history.state, '', newUrl);
      }
    } catch (error) {
      console.warn('Failed to save search state to URL.', error);
    }
  }

  onGlobalKeydown (event) {
    if (event.target !== this.searchBox.dom && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable)) return;

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

    if (event.target === this.searchBox.dom && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
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

    document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]').forEach(el => {
      const attr = el.tagName === 'LINK' ? 'href' : 'src';
      const url = new URL(el[attr], location.origin);
      url.searchParams.set('reload', now);
      el[attr] = url.toString();
    });

    const baseUrl = location.href.split('?')[0];
    location.replace(`${baseUrl}?reload=${now}`);
  }

  openPostIt (html = '') {
    this.blurMainContent(true);
    this.postIt.setStyle('opacity', '0');
    this.postIt.setHTML(html);
    this.postIt.show();
    this.postIt.reflow();
    this.postIt.setStyle('opacity', '1');
    this.clickDetector.show();
  }

  closePostIt () {
    this.blurMainContent(false);
    this.postIt.hide();
    this.clickDetector.hide();
  }

  openMemo (memoKey) {
    const memo = MEMOS[memoKey];
    if (memo) {
      this.openPostIt(memo);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
