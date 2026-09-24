(function () {
  'use strict';

  var MAX_TIERS = 20;
  var STORAGE_KEY = 'f9y-tier-list-v1';
  var LOGO_STORAGE_KEY = 'f9y-logo-overrides-v1';
  var MAX_IMAGE_DIM = 240;
  var IMAGE_LOAD_TIMEOUT_MS = 8000;

  // Instagram's optimal feed-post ratio (4:5) — the card is always
  // exported at exactly this size regardless of how many tiers/items are
  // on the board; see layoutBoard() for how everything inside adapts.
  var EXPORT_WIDTH = 1080;
  var EXPORT_HEIGHT = 1350;
  var CARD_ASPECT = EXPORT_HEIGHT / EXPORT_WIDTH;

  var HEADER_RATIO = 0.17;
  var FOOTER_RATIO = 0.05;
  var PAD_X_RATIO = 0.032; // shared header/body/footer horizontal inset — kept small so tier rows run wide
  var TIER_GAP = 4;       // must match .tl-tiers gap in style.css
  var ITEM_GAP = 6;       // must match .tl-items-row gap in style.css
  var ITEMS_ROW_PAD_X = 16; // must match .tl-items-row padding (4px 8px) L+R
  var ITEMS_ROW_PAD_Y = 8;  // must match .tl-items-row padding (4px 8px) T+B
  var MIN_ITEM_SIZE = 12;
  var MAX_ITEMS_PER_ROW = 10; // beyond this, items stack onto additional lines
  var MIN_LABEL_WIDTH = 60;
  var MAX_LABEL_WIDTH = 140;
  var LABEL_WIDTH_RATIO = 0.16;

  // Conferences in display order for the filter dropdown
  var CONFERENCE_ORDER = [
    'ACC', 'Big Ten', 'Big 12', 'SEC',
    'American', 'Conference USA', 'MAC', 'Mountain West', 'Pac-12', 'Sun Belt',
    'Independent'
  ];

  // Muted, editorial tones that sit well on the brand's cream body —
  // matches assets/brand.css's --f9y-tier-* tokens (first 6), extended
  // to 10 for cycling through up to MAX_TIERS.
  var DEFAULT_TIER_COLORS = [
    '#c0524a', '#cf8a3f', '#c7ad4a', '#5f9468', '#4a7f96', '#7a6a9e',
    '#a15c7e', '#4a9a8f', '#a37b3f', '#6c7a8c'
  ];

  var els = {
    tiersContainer: document.getElementById('tiers-container'),
    poolContainer: document.getElementById('pool-container'),
    captureRoot: document.getElementById('capture-root'),
    captureHeader: document.querySelector('.tl-capture-header'),
    captureBody: document.querySelector('.tl-capture-body'),
    captureFooter: document.querySelector('.tl-capture-footer'),
    captureLogo: document.querySelector('.tl-capture-logo'),
    boardTitle: document.getElementById('board-title'),
    tierCount: document.getElementById('tier-count'),
    btnAddTier: document.getElementById('btn-add-tier'),
    btnAddImages: document.getElementById('btn-add-images'),
    fileInput: document.getElementById('file-input'),
    btnAddText: document.getElementById('btn-add-text'),
    btnReset: document.getElementById('btn-reset'),
    btnExport: document.getElementById('btn-export'),
    exportResolution: document.getElementById('export-resolution'),
    toast: document.getElementById('toast'),

    btnToggleTeams: document.getElementById('btn-toggle-teams'),
    teamBrowser: document.getElementById('team-browser'),
    teamSearch: document.getElementById('team-search'),
    teamConfFilter: document.getElementById('team-conf-filter'),
    teamClassFilter: document.getElementById('team-class-filter'),
    teamGrid: document.getElementById('team-grid'),
    teamResultCount: document.getElementById('team-result-count'),
    btnAddAllFiltered: document.getElementById('btn-add-all-filtered'),

    btnImportLogos: document.getElementById('btn-import-logos'),
    importModal: document.getElementById('import-modal'),
    importTextarea: document.getElementById('import-textarea'),
    btnImportSave: document.getElementById('btn-import-save'),
    btnImportCancel: document.getElementById('btn-import-cancel'),
    btnImportClear: document.getElementById('btn-import-clear')
  };

  var sortables = [];
  var idCounter = 0;

  function nextId(prefix) {
    idCounter += 1;
    return prefix + '-' + Date.now().toString(36) + '-' + idCounter;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      els.toast.hidden = true;
    }, 2200);
  }

  // ---------------------------------------------------------------------
  // Item elements (images / text cards)
  // ---------------------------------------------------------------------

  function createItemElement(item) {
    var el = document.createElement('div');
    el.className = 'tl-item';
    el.dataset.id = item.id;
    el.dataset.type = item.type;

    var removeBtn = document.createElement('button');
    removeBtn.className = 'tl-item-remove';
    removeBtn.type = 'button';
    removeBtn.title = 'Remove';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      el.remove();
      refreshPoolEmptyState();
      saveState();
    });
    el.appendChild(removeBtn);

    if (item.type === 'image') {
      var img = document.createElement('img');
      img.className = 'tl-item-img';
      img.src = item.src;
      img.alt = '';
      img.draggable = false;
      el.appendChild(img);
    } else {
      var text = document.createElement('div');
      text.className = 'tl-item-text';
      text.contentEditable = 'false';
      text.textContent = item.text || '';
      text.style.background = item.color || 'var(--f9y-surface-3)';
      text.title = 'Double-click to edit';
      text.addEventListener('dblclick', function () {
        text.contentEditable = 'true';
        text.focus();
        selectAllText(text);
      });
      text.addEventListener('blur', function () {
        text.contentEditable = 'false';
        saveState();
      });
      text.addEventListener('input', function () {
        window.clearTimeout(text._debounce);
        text._debounce = window.setTimeout(saveState, 400);
      });
      text.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); text.blur(); }
        e.stopPropagation();
      });
      el.appendChild(text);
    }

    return el;
  }

  function addImageItemsToPool(dataUrls) {
    dataUrls.forEach(function (src) {
      var item = { id: nextId('item'), type: 'image', src: src };
      els.poolContainer.appendChild(createItemElement(item));
    });
    refreshPoolEmptyState();
    saveState();
  }

  function addTextItemToPool() {
    var color = DEFAULT_TIER_COLORS[Math.floor(Math.random() * DEFAULT_TIER_COLORS.length)];
    var el = appendTextItem(els.poolContainer, 'New Card', color);
    saveState();

    var textEl = el.querySelector('.tl-item-text');
    window.requestAnimationFrame(function () {
      textEl.contentEditable = 'true';
      textEl.focus();
      selectAllText(textEl);
    });
  }

  // Appends a text-card item without stealing focus — used for
  // programmatic inserts (team fallback chips, bulk "add all").
  function appendTextItem(container, text, color) {
    var item = { id: nextId('item'), type: 'text', text: text, color: color };
    var el = createItemElement(item);
    container.appendChild(el);
    refreshPoolEmptyState();
    return el;
  }

  function selectAllText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function refreshPoolEmptyState() {
    var hasItems = els.poolContainer.children.length > 0;
    els.poolContainer.classList.toggle('tl-pool-empty', !hasItems);
  }

  // ---------------------------------------------------------------------
  // Image resizing on upload (keeps localStorage + export payload small)
  // ---------------------------------------------------------------------

  function resizeImageFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.86));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Loads a (possibly cross-origin) image URL and bakes it down to a
  // resized data URL via canvas — same treatment as an uploaded file, so
  // team logos become normal portable/exportable image items with no
  // ongoing dependency on the source URL or its CORS headers being
  // present at export time. Rejects if the URL 404s, times out, or the
  // source doesn't allow cross-origin canvas reads (tainted canvas).
  function loadImageAsDataURL(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('timeout'));
      }, IMAGE_LOAD_TIMEOUT_MS);

      img.crossOrigin = 'anonymous';
      img.onload = function () {
        if (settled) return;
        window.clearTimeout(timer);
        try {
          var scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          var dataUrl = canvas.toDataURL('image/png');
          settled = true;
          resolve(dataUrl);
        } catch (e) {
          settled = true;
          reject(e);
        }
      };
      img.onerror = function () {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(new Error('image failed to load'));
      };
      img.src = url;
    });
  }

  function handleFiles(fileList) {
    var files = Array.prototype.filter.call(fileList, function (f) {
      return f.type.indexOf('image/') === 0;
    });
    if (!files.length) return;
    Promise.all(files.map(resizeImageFile)).then(addImageItemsToPool).catch(function () {
      showToast('Could not read one or more images.');
    });
  }

  // ---------------------------------------------------------------------
  // Tiers
  // ---------------------------------------------------------------------

  function tierCountValue() {
    return els.tiersContainer.children.length;
  }

  function updateTierCountLabel() {
    els.tierCount.textContent = tierCountValue() + ' / ' + MAX_TIERS + ' tiers';
    els.btnAddTier.disabled = tierCountValue() >= MAX_TIERS;
  }

  function createTierElement(tier) {
    var row = document.createElement('div');
    row.className = 'tl-tier';
    row.dataset.tierId = tier.id;

    var label = document.createElement('div');
    label.className = 'tl-tier-label';
    label.style.background = tier.color;

    var name = document.createElement('div');
    name.className = 'tl-tier-name';
    name.contentEditable = 'true';
    name.spellcheck = false;
    name.textContent = tier.name;
    name.addEventListener('input', function () {
      window.clearTimeout(name._debounce);
      name._debounce = window.setTimeout(saveState, 400);
    });
    name.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        name.blur();
      }
    });

    var colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'tl-tier-color';
    colorInput.value = tier.color;
    colorInput.addEventListener('input', function () {
      label.style.background = colorInput.value;
      saveState();
    });

    label.appendChild(name);
    label.appendChild(colorInput);

    var items = document.createElement('div');
    items.className = 'tl-items-row';
    items.dataset.tierId = tier.id;
    (tier.items || []).forEach(function (item) {
      items.appendChild(createItemElement(item));
    });

    var controls = document.createElement('div');
    controls.className = 'tl-tier-controls';

    var upBtn = makeIconButton('↑', 'Move tier up', function () {
      var prev = row.previousElementSibling;
      if (prev) {
        row.parentNode.insertBefore(row, prev);
        saveState();
      }
    });
    var downBtn = makeIconButton('↓', 'Move tier down', function () {
      var next = row.nextElementSibling;
      if (next) {
        row.parentNode.insertBefore(next, row);
        saveState();
      }
    });
    var delBtn = makeIconButton('✕', 'Delete tier (items move to pool)', function () {
      Array.prototype.slice.call(items.children).forEach(function (child) {
        els.poolContainer.appendChild(child);
      });
      row.remove();
      refreshPoolEmptyState();
      updateTierCountLabel();
      saveState();
    });

    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    controls.appendChild(delBtn);

    row.appendChild(label);
    row.appendChild(items);
    row.appendChild(controls);

    registerSortable(items);

    return row;
  }

  function makeIconButton(symbol, title, onClick) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tl-icon-btn';
    btn.title = title;
    btn.textContent = symbol;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function addTier(opts) {
    if (tierCountValue() >= MAX_TIERS) {
      showToast('Maximum of ' + MAX_TIERS + ' tiers reached.');
      return;
    }
    var index = tierCountValue();
    var tier = {
      id: nextId('tier'),
      name: (opts && opts.name) || 'New Tier',
      color: (opts && opts.color) || DEFAULT_TIER_COLORS[index % DEFAULT_TIER_COLORS.length],
      items: (opts && opts.items) || []
    };
    els.tiersContainer.appendChild(createTierElement(tier));
    updateTierCountLabel();
    saveState();
  }

  // ---------------------------------------------------------------------
  // Layout engine — keeps the card at exactly the Instagram-optimal 4:5
  // ratio no matter how many tiers/items are on it. Header/footer/each
  // tier row get an explicit pixel height computed from the card's
  // current width; each tier's items lay out on a single line (see
  // .tl-items-row's flex-wrap:nowrap in style.css) and are sized here to
  // fit whatever's in that row — more logos in a tier means smaller
  // logos, not a taller row. Re-run after any structural change (tier/
  // item add/remove/move) and on resize; see saveState() for the main
  // hook, plus the extra calls in exportPng() around the 'exporting'
  // class toggle (hiding controls changes the available width).
  // ---------------------------------------------------------------------

  function layoutBoard() {
    var width = els.captureRoot.offsetWidth;
    if (!width) return;

    var height = Math.round(width * CARD_ASPECT);
    els.captureRoot.style.height = height + 'px';

    // one shared horizontal inset for header/body/footer so the eyebrow,
    // headline and tagline all line up with the tier boxes' left edge
    var padX = Math.round(width * PAD_X_RATIO);
    els.captureHeader.style.paddingLeft = padX + 'px';
    els.captureHeader.style.paddingRight = padX + 'px';
    els.captureBody.style.paddingLeft = padX + 'px';
    els.captureBody.style.paddingRight = padX + 'px';
    els.captureFooter.style.paddingLeft = padX + 'px';
    els.captureFooter.style.paddingRight = padX + 'px';

    var headerH = Math.round(height * HEADER_RATIO);
    var footerH = Math.round(height * FOOTER_RATIO);
    var bodyH = height - headerH - footerH;

    // small, fixed top/bottom inset (not centered) so the eyebrow sits
    // near the header's top edge and the headline gets the rest of the
    // space to grow into
    var headerPadY = Math.round(headerH * 0.1);
    els.captureHeader.style.paddingTop = headerPadY + 'px';
    els.captureHeader.style.paddingBottom = headerPadY + 'px';

    els.captureHeader.style.height = headerH + 'px';
    els.captureFooter.style.height = footerH + 'px';
    els.captureBody.style.height = bodyH + 'px';

    fitHeadlineFontSize(headerH);
    syncLogoHeightToTitle();
    // the logo's width just changed, which can shift how much horizontal
    // space the title has left in the header's flex row — re-fit once
    // more against that updated width for an exact result
    fitHeadlineFontSize(headerH);

    var tierRows = Array.prototype.slice.call(els.tiersContainer.children);
    var tierCount = tierRows.length;
    if (!tierCount) return;

    // measure the tiers container's actual available height (rather than
    // reusing bodyH directly) so the body's own top/bottom padding is
    // correctly excluded — using bodyH as-is here previously left the
    // tier stack taller than the body's content box, and the overflow
    // got clipped at the bottom by the body's overflow:hidden.
    var tiersAvailableH = els.tiersContainer.clientHeight;
    var totalGap = TIER_GAP * (tierCount - 1);
    var tierRowH = Math.max(20, Math.floor((tiersAvailableH - totalGap) / tierCount));

    var labelWidth = Math.min(MAX_LABEL_WIDTH, Math.max(MIN_LABEL_WIDTH, Math.round(width * LABEL_WIDTH_RATIO)));
    var labelFontSize = Math.max(9, Math.min(20, Math.round(tierRowH * 0.34)));

    tierRows.forEach(function (row) {
      row.style.height = tierRowH + 'px';

      var label = row.querySelector('.tl-tier-label');
      label.style.flex = '0 0 ' + labelWidth + 'px';
      fitTierLabelFontSize(row.querySelector('.tl-tier-name'), labelFontSize);

      layoutTierItems(row.querySelector('.tl-items-row'), tierRowH);
    });
  }

  // Tier names wrap up to 2 lines (see .tl-tier-name's -webkit-line-clamp
  // in style.css) and shrink further if even that doesn't fit the row's
  // fixed height, rather than truncating with an ellipsis.
  function fitTierLabelFontSize(nameEl, startSize) {
    var hasSpace = /\s/.test((nameEl.textContent || '').trim());

    // Phase 1: try to shrink to fit on a single line — no wrapping, so
    // never breaks a word apart.
    nameEl.style.whiteSpace = 'nowrap';
    nameEl.style.display = 'block';
    nameEl.style.webkitLineClamp = '';

    var size = startSize;
    nameEl.style.fontSize = size + 'px';
    var guard = 0;
    while (nameEl.scrollWidth > nameEl.clientWidth && size > 9 && guard < 30) {
      size -= 1;
      nameEl.style.fontSize = size + 'px';
      guard++;
    }
    if (nameEl.scrollWidth <= nameEl.clientWidth) {
      return; // fits on one line at a reasonable size — done
    }

    // Phase 2: still doesn't fit as one line. Only wrap for multi-word
    // labels (breaking only at spaces, never mid-word); a single long
    // word just stays at its smallest single-line size from phase 1.
    if (hasSpace) {
      nameEl.style.whiteSpace = 'normal';
      nameEl.style.wordBreak = 'normal';
      nameEl.style.display = '-webkit-box';
      nameEl.style.webkitLineClamp = '2';
      nameEl.style.webkitBoxOrient = 'vertical';

      size = startSize;
      nameEl.style.fontSize = size + 'px';
      guard = 0;
      while (nameEl.scrollHeight > nameEl.clientHeight + 1 && size > 7 && guard < 30) {
        size -= 1;
        nameEl.style.fontSize = size + 'px';
        guard++;
      }
    }
  }

  function layoutTierItems(itemsRow, tierRowH) {
    var items = Array.prototype.slice.call(itemsRow.children);
    if (!items.length) return;

    // Beyond MAX_ITEMS_PER_ROW, items stack onto additional lines instead
    // of shrinking indefinitely into one long sliver — e.g. 11-20 items
    // becomes 2 lines, 21-30 becomes 3, etc. Rows split as evenly as
    // possible (11 items -> 6 + 5, not 10 + 1).
    var rows = items.length <= MAX_ITEMS_PER_ROW ? 1 : Math.ceil(items.length / MAX_ITEMS_PER_ROW);
    var itemsPerRow = Math.ceil(items.length / rows);

    var availableWidth = itemsRow.clientWidth - ITEMS_ROW_PAD_X;
    var availableHeight = tierRowH - ITEMS_ROW_PAD_Y;

    var rowGapTotal = ITEM_GAP * (rows - 1);
    var heightPerRow = (availableHeight - rowGapTotal) / rows;

    var colGapTotal = ITEM_GAP * (itemsPerRow - 1);
    var widthPerItem = (availableWidth - colGapTotal) / itemsPerRow;

    var itemSize = Math.max(MIN_ITEM_SIZE, Math.floor(Math.min(heightPerRow, widthPerItem)));

    items.forEach(function (item) {
      item.style.width = itemSize + 'px';
      item.style.height = itemSize + 'px';
      var textEl = item.querySelector('.tl-item-text');
      if (textEl) {
        textEl.style.fontSize = Math.max(7, Math.round(itemSize * 0.2)) + 'px';
      }
    });
  }

  // Headline is sized to dominate the header (per "make the title
  // bigger"), then shrunk in small steps until it fits on one line —
  // #board-title has white-space:nowrap, so an untamed size would
  // otherwise just overflow the card's fixed width.
  // Sizes the logo mark to match the headline's actual rendered height
  // (not a guessed percentage of the header, and not the source PNG's
  // own dimensions — that file has some transparent margin baked in) so
  // the wordmark and the badge read as the same visual scale.
  function syncLogoHeightToTitle() {
    if (!els.captureLogo || !els.captureLogo.naturalHeight) return;
    var titleH = els.boardTitle.getBoundingClientRect().height;
    if (!titleH) return;
    els.captureLogo.style.height = Math.round(titleH) + 'px';
  }

  function fitHeadlineFontSize(headerH) {
    var size = Math.max(18, Math.round(headerH * 0.46));
    els.boardTitle.style.fontSize = size + 'px';
    var guard = 0;
    while (els.boardTitle.scrollWidth > els.boardTitle.clientWidth && size > 9 && guard < 60) {
      size -= 1;
      els.boardTitle.style.fontSize = size + 'px';
      guard++;
    }
  }

  // ---------------------------------------------------------------------
  // Team browser (FBS roster + conference/P4-G6 filters)
  // ---------------------------------------------------------------------

  var ALL_TEAMS = window.F9Y_TEAMS || [];
  var LOCAL_LOGO_DIR = '../../assets/logos/';

  function normalizeKey(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Matches the slug scheme used when the real logo files were copied into
  // assets/logos/ (see the repo's logo-import notes) — lowercase,
  // non-alphanumeric runs collapsed to a single hyphen.
  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function localLogoPath(team) {
    return LOCAL_LOGO_DIR + slugify(team.name) + '.png';
  }

  function loadLogoOverrides() {
    try {
      var raw = window.localStorage.getItem(LOGO_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLogoOverrides(map) {
    try {
      window.localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      // storage full/unavailable — non-fatal
    }
  }

  // Builds a normalized-key -> URL lookup once per render so matching an
  // imported team_logo_lookup()-shaped map (whose keys may not exactly
  // match our team names) against `name` or any `aliases` is a cheap hit.
  function buildLogoIndex(overrides) {
    var index = {};
    Object.keys(overrides).forEach(function (key) {
      index[normalizeKey(key)] = overrides[key];
    });
    return index;
  }

  // Candidate logo sources for a team, in priority order: the real logo
  // file shipped in assets/logos/ (if one was copied in for this team),
  // then any imported team_logo_lookup()-style override. Both are tried
  // in order at load time; the first that actually loads wins, and if
  // neither does the team falls back to its colored initials chip.
  function resolveLogoCandidates(team, logoIndex) {
    var candidates = [localLogoPath(team)];
    var keys = [team.name].concat(team.aliases || []);
    for (var i = 0; i < keys.length; i++) {
      var hit = logoIndex[normalizeKey(keys[i])];
      if (hit) {
        candidates.push(hit);
        break;
      }
    }
    return candidates;
  }

  function populateConferenceFilter() {
    var confs = [];
    ALL_TEAMS.forEach(function (t) {
      if (confs.indexOf(t.conf) === -1) confs.push(t.conf);
    });
    confs.sort(function (a, b) {
      var ai = CONFERENCE_ORDER.indexOf(a);
      var bi = CONFERENCE_ORDER.indexOf(b);
      if (ai === -1) ai = CONFERENCE_ORDER.length;
      if (bi === -1) bi = CONFERENCE_ORDER.length;
      return ai - bi;
    });

    var frag = document.createDocumentFragment();
    var allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All Conferences';
    frag.appendChild(allOpt);
    confs.forEach(function (conf) {
      var opt = document.createElement('option');
      opt.value = conf;
      opt.textContent = conf;
      frag.appendChild(opt);
    });
    els.teamConfFilter.appendChild(frag);
  }

  function filteredTeams() {
    var query = normalizeKey(els.teamSearch.value);
    var conf = els.teamConfFilter.value;
    var cls = els.teamClassFilter.value;

    return ALL_TEAMS.filter(function (t) {
      if (conf !== 'all' && t.conf !== conf) return false;
      if (cls !== 'all' && t.tier !== cls) return false;
      if (query) {
        var haystack = normalizeKey(t.name) + normalizeKey(t.abbr);
        if (haystack.indexOf(query) === -1) return false;
      }
      return true;
    });
  }

  function createTeamChipLogo(team, candidates) {
    var logo = document.createElement('div');
    logo.className = 'tl-team-chip-logo';
    logo.style.background = 'linear-gradient(135deg, ' + team.colors[0] + ', ' + team.colors[1] + ')';

    var remaining = candidates.slice();
    function tryNext() {
      var url = remaining.shift();
      if (!url) {
        logo.textContent = team.abbr;
        return;
      }
      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = function () {
        logo.removeChild(img);
        tryNext();
      };
      logo.appendChild(img);
    }
    tryNext();
    return logo;
  }

  function renderTeamGrid() {
    var overrides = loadLogoOverrides();
    var logoIndex = buildLogoIndex(overrides);
    var teams = filteredTeams();

    els.teamGrid.innerHTML = '';
    els.teamResultCount.textContent = teams.length + ' team' + (teams.length === 1 ? '' : 's');

    if (!teams.length) {
      var empty = document.createElement('div');
      empty.className = 'tl-team-empty';
      empty.textContent = 'No teams match those filters.';
      els.teamGrid.appendChild(empty);
      return;
    }

    var frag = document.createDocumentFragment();
    teams.forEach(function (team) {
      var candidates = resolveLogoCandidates(team, logoIndex);
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tl-team-chip';
      chip.title = team.name + ' (' + team.conf + ')';
      chip.appendChild(createTeamChipLogo(team, candidates));

      var name = document.createElement('div');
      name.className = 'tl-team-chip-name';
      name.textContent = team.name;
      chip.appendChild(name);

      chip.addEventListener('click', function () {
        addTeamToPool(team, candidates);
      });
      frag.appendChild(chip);
    });
    els.teamGrid.appendChild(frag);
  }

  // Tries each candidate logo source (real file, then any imported
  // override) in order and bakes the first one that actually loads down
  // to a resized data URL — safe even for the local same-origin files,
  // and it means the pool item never has a live dependency on the source
  // path. Falls back to a colored initials card if every candidate fails.
  function teamToItem(team, candidates) {
    function tryCandidate(index) {
      if (index >= candidates.length) {
        return Promise.resolve({ kind: 'text', text: team.abbr, color: team.colors[0] });
      }
      return loadImageAsDataURL(candidates[index]).then(
        function (dataUrl) { return { kind: 'image', src: dataUrl }; },
        function () { return tryCandidate(index + 1); }
      );
    }
    return tryCandidate(0);
  }

  function addTeamToPool(team, candidates) {
    teamToItem(team, candidates).then(function (result) {
      if (result.kind === 'image') {
        addImageItemsToPool([result.src]);
      } else {
        appendTextItem(els.poolContainer, result.text, result.color);
        saveState();
      }
    });
  }

  function addAllFilteredToPool() {
    var overrides = loadLogoOverrides();
    var logoIndex = buildLogoIndex(overrides);
    var teams = filteredTeams();
    if (!teams.length) return;

    if (teams.length > 40 && !window.confirm('Add all ' + teams.length + ' filtered teams to the pool?')) {
      return;
    }

    els.btnAddAllFiltered.disabled = true;
    var originalLabel = els.btnAddAllFiltered.textContent;
    els.btnAddAllFiltered.textContent = 'Adding…';

    Promise.all(teams.map(function (team) {
      return teamToItem(team, resolveLogoCandidates(team, logoIndex));
    })).then(function (results) {
      results.forEach(function (result) {
        if (result.kind === 'image') {
          var item = { id: nextId('item'), type: 'image', src: result.src };
          els.poolContainer.appendChild(createItemElement(item));
        } else {
          appendTextItem(els.poolContainer, result.text, result.color);
        }
      });
      refreshPoolEmptyState();
      saveState();
      showToast('Added ' + results.length + ' teams to the pool.');
    }).finally(function () {
      els.btnAddAllFiltered.disabled = false;
      els.btnAddAllFiltered.textContent = originalLabel;
    });
  }

  function openImportModal() {
    var overrides = loadLogoOverrides();
    els.importTextarea.value = Object.keys(overrides).length
      ? JSON.stringify(overrides, null, 2)
      : '';
    els.importModal.hidden = false;
    els.importTextarea.focus();
  }

  function closeImportModal() {
    els.importModal.hidden = true;
  }

  // ---------------------------------------------------------------------
  // Drag & drop between tiers / pool (SortableJS), shared group
  // ---------------------------------------------------------------------

  function registerSortable(container) {
    var s = Sortable.create(container, {
      group: 'f9y-tier-items',
      animation: 150,
      filter: '.tl-item-remove',
      preventOnFilter: false,
      onSort: function () {
        refreshPoolEmptyState();
        saveState();
      }
    });
    sortables.push(s);
    return s;
  }

  // ---------------------------------------------------------------------
  // Persistence (localStorage)
  // ---------------------------------------------------------------------

  function collectState() {
    var tiers = Array.prototype.map.call(els.tiersContainer.children, function (row) {
      var label = row.querySelector('.tl-tier-label');
      var name = row.querySelector('.tl-tier-name');
      var color = row.querySelector('.tl-tier-color').value;
      var items = collectItems(row.querySelector('.tl-items-row'));
      return { id: row.dataset.tierId, name: name.textContent, color: color, items: items };
    });
    var pool = collectItems(els.poolContainer);

    return {
      version: 1,
      boardTitle: els.boardTitle.textContent,
      tiers: tiers,
      pool: pool
    };
  }

  function collectItems(container) {
    return Array.prototype.map.call(container.children, function (el) {
      if (el.dataset.type === 'image') {
        return { id: el.dataset.id, type: 'image', src: el.querySelector('.tl-item-img').src };
      }
      var textEl = el.querySelector('.tl-item-text');
      return {
        id: el.dataset.id,
        type: 'text',
        text: textEl.textContent,
        color: textEl.style.background
      };
    });
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
    } catch (e) {
      // storage full or unavailable — non-fatal, just skip autosave
    }
    layoutBoard();
  }

  function loadState() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      raw = null;
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function renderState(state) {
    els.tiersContainer.innerHTML = '';
    els.poolContainer.innerHTML = '';
    sortables = [];

    els.boardTitle.textContent = state.boardTitle || '';

    (state.tiers || []).forEach(function (tier) {
      els.tiersContainer.appendChild(createTierElement(tier));
    });
    (state.pool || []).forEach(function (item) {
      els.poolContainer.appendChild(createItemElement(item));
    });

    registerSortable(els.poolContainer);
    refreshPoolEmptyState();
    updateTierCountLabel();
  }

  function buildDefaultState() {
    return {
      version: 1,
      boardTitle: '',
      tiers: [
        { id: nextId('tier'), name: 'S', color: DEFAULT_TIER_COLORS[0], items: [] },
        { id: nextId('tier'), name: 'A', color: DEFAULT_TIER_COLORS[1], items: [] },
        { id: nextId('tier'), name: 'B', color: DEFAULT_TIER_COLORS[2], items: [] },
        { id: nextId('tier'), name: 'C', color: DEFAULT_TIER_COLORS[3], items: [] },
        { id: nextId('tier'), name: 'D', color: DEFAULT_TIER_COLORS[4], items: [] },
        { id: nextId('tier'), name: 'F', color: DEFAULT_TIER_COLORS[5], items: [] }
      ],
      pool: []
    };
  }

  // ---------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------

  function getResolutionMultiplier() {
    var val = parseInt(els.exportResolution && els.exportResolution.value, 10);
    return val > 0 ? val : 2;
  }

  function exportPng() {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    if (els.boardTitle.textContent.trim().length === 0) {
      els.boardTitle.textContent = 'MY TIER LIST';
    }

    els.captureRoot.classList.add('exporting');
    // hiding controls/color swatches/remove buttons changes each tier's
    // available width, so re-run the layout before measuring for capture
    layoutBoard();

    els.btnExport.disabled = true;
    els.btnExport.textContent = 'Exporting…';

    // Wait for the custom @font-face fonts (Barlow Condensed Black, DM
    // Mono) to finish loading before capturing — if html2canvas rasterizes
    // before they're ready, it falls back to different font metrics and
    // the text renders bunched/overlapping despite looking fine live.
    var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();

    fontsReady.then(function () {
      return new Promise(function (resolve) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(resolve);
        });
      });
    }).then(function () {
      return (function () {
        // scale so the output is always exactly EXPORT_WIDTH wide (and,
        // since layoutBoard() pins the card to CARD_ASPECT, exactly
        // EXPORT_HEIGHT tall) regardless of the on-screen render width
        var scale = (EXPORT_WIDTH * getResolutionMultiplier()) / els.captureRoot.offsetWidth;
        return html2canvas(els.captureRoot, {
          scale: scale,
          backgroundColor: null,
          useCORS: true,
          // html2canvas measures text on an offscreen canvas per-string by
          // default, which can silently fall back to different metrics
          // than the live DOM for a custom @font-face and bunch/overlap
          // characters together — rendering letter-by-letter avoids that
          // mismatch at the cost of a little performance.
          letterRendering: true
        });
      })();
    }).then(function (canvas) {
      var link = document.createElement('a');
      link.download = 'full9yards-tier-list.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(function () {
      showToast('Export failed — try again.');
    }).finally(function () {
      els.captureRoot.classList.remove('exporting');
      els.btnExport.disabled = false;
      els.btnExport.textContent = 'Export PNG';
      saveState();
    });
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------

  els.btnAddTier.addEventListener('click', function () {
    addTier();
  });

  els.btnAddImages.addEventListener('click', function () {
    els.fileInput.click();
  });

  els.fileInput.addEventListener('change', function (e) {
    handleFiles(e.target.files);
    e.target.value = '';
  });

  els.btnAddText.addEventListener('click', addTextItemToPool);

  els.btnReset.addEventListener('click', function () {
    if (window.confirm('Reset the board? This clears all tiers and items.')) {
      renderState(buildDefaultState());
      saveState();
    }
  });

  els.btnExport.addEventListener('click', exportPng);

  els.btnToggleTeams.addEventListener('click', function () {
    els.teamBrowser.hidden = !els.teamBrowser.hidden;
    if (!els.teamBrowser.hidden) renderTeamGrid();
  });
  els.teamSearch.addEventListener('input', function () {
    window.clearTimeout(els.teamSearch._debounce);
    els.teamSearch._debounce = window.setTimeout(renderTeamGrid, 150);
  });
  els.teamConfFilter.addEventListener('change', renderTeamGrid);
  els.teamClassFilter.addEventListener('change', renderTeamGrid);
  els.btnAddAllFiltered.addEventListener('click', addAllFilteredToPool);

  els.btnImportLogos.addEventListener('click', openImportModal);
  els.btnImportCancel.addEventListener('click', closeImportModal);
  els.importModal.addEventListener('click', function (e) {
    if (e.target === els.importModal) closeImportModal();
  });
  els.btnImportSave.addEventListener('click', function () {
    var text = els.importTextarea.value.trim();
    var parsed = {};
    if (text) {
      try {
        parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('not an object');
        }
      } catch (e) {
        showToast('That doesn\'t look like valid JSON — expected {"Team Name": "url"}.');
        return;
      }
    }
    saveLogoOverrides(parsed);
    closeImportModal();
    renderTeamGrid();
    showToast('Logo map saved (' + Object.keys(parsed).length + ' teams).');
  });
  els.btnImportClear.addEventListener('click', function () {
    if (window.confirm('Clear all saved logo overrides?')) {
      saveLogoOverrides({});
      els.importTextarea.value = '';
      renderTeamGrid();
      showToast('Cleared saved logos.');
    }
  });

  els.boardTitle.addEventListener('input', function () {
    fitHeadlineFontSize(els.captureHeader.clientHeight); // live shrink-to-fit while typing
    window.clearTimeout(els.boardTitle._debounce);
    els.boardTitle._debounce = window.setTimeout(saveState, 400);
  });
  els.boardTitle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); els.boardTitle.blur(); }
  });

  ['dragover', 'dragenter'].forEach(function (evt) {
    els.poolContainer.addEventListener(evt, function (e) {
      if (e.dataTransfer && e.dataTransfer.types.indexOf('Files') !== -1) {
        e.preventDefault();
        els.poolContainer.classList.add('tl-drag-over');
      }
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    els.poolContainer.addEventListener(evt, function () {
      els.poolContainer.classList.remove('tl-drag-over');
    });
  });
  els.poolContainer.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    }
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layoutBoard, 100);
  });

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------

  if (els.captureLogo && !els.captureLogo.complete) {
    els.captureLogo.addEventListener('load', layoutBoard);
  }

  var saved = loadState();
  renderState(saved || buildDefaultState());
  populateConferenceFilter();
  layoutBoard();
})();
