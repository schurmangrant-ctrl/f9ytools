(function () {
  'use strict';

  var MAX_TIERS = 20;
  var STORAGE_KEY = 'f9y-tier-list-v1';
  var MAX_IMAGE_DIM = 240;

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
    boardTitle: document.getElementById('board-title'),
    boardSubtitle: document.getElementById('board-subtitle'),
    tierCount: document.getElementById('tier-count'),
    btnAddTier: document.getElementById('btn-add-tier'),
    btnAddImages: document.getElementById('btn-add-images'),
    fileInput: document.getElementById('file-input'),
    btnAddText: document.getElementById('btn-add-text'),
    btnReset: document.getElementById('btn-reset'),
    btnExport: document.getElementById('btn-export'),
    toast: document.getElementById('toast')
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
    var item = { id: nextId('item'), type: 'text', text: 'New Card', color: color };
    var el = createItemElement(item);
    els.poolContainer.appendChild(el);
    refreshPoolEmptyState();
    saveState();

    var textEl = el.querySelector('.tl-item-text');
    window.requestAnimationFrame(function () {
      textEl.contentEditable = 'true';
      textEl.focus();
      selectAllText(textEl);
    });
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
      boardSubtitle: els.boardSubtitle.textContent,
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
    els.boardSubtitle.textContent = state.boardSubtitle || '';

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
      boardSubtitle: '',
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

  function exportPng() {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    var subtitleEmpty = els.boardSubtitle.textContent.trim().length === 0;
    els.boardSubtitle.classList.toggle('tl-subtitle-empty', subtitleEmpty);
    if (els.boardTitle.textContent.trim().length === 0) {
      els.boardTitle.textContent = 'MY TIER LIST';
    }

    els.captureRoot.classList.add('exporting');
    els.btnExport.disabled = true;
    els.btnExport.textContent = 'Exporting…';

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        html2canvas(els.captureRoot, {
          scale: 2,
          backgroundColor: getComputedStyle(document.body).getPropertyValue('--f9y-surface').trim(),
          useCORS: true
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
      });
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

  els.boardTitle.addEventListener('input', function () {
    window.clearTimeout(els.boardTitle._debounce);
    els.boardTitle._debounce = window.setTimeout(saveState, 400);
  });
  els.boardSubtitle.addEventListener('input', function () {
    window.clearTimeout(els.boardSubtitle._debounce);
    els.boardSubtitle._debounce = window.setTimeout(saveState, 400);
  });
  els.boardTitle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); els.boardTitle.blur(); }
  });
  els.boardSubtitle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); els.boardSubtitle.blur(); }
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

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------

  var saved = loadState();
  renderState(saved || buildDefaultState());
})();
