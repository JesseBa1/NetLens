/* NetLens UI */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var I18N = window.NetLensI18n;
  var MB = 1024 * 1024;
  var LOCALES = { zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR', pt: 'pt-BR' };

  var state = {
    result: null,
    fileName: '',
    isDemo: false,
    localIps: [],
    lang: 'zh',
    theme: 'light',
    initialTab: null,
    elapsed: 0
  };

  function t(key, vars) { return I18N.t(state.lang, key, vars); }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmtBytes(v) {
    if (v === undefined || v === null) return '-';
    if (v >= 1e9) return (v / 1e9).toFixed(2) + ' GB';
    if (v >= 1e6) return (v / 1e6).toFixed(2) + ' MB';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + ' KB';
    return Math.round(v) + ' B';
  }
  function fmtNum(v) { return (v || 0).toLocaleString(LOCALES[state.lang] || 'en-US'); }
  function fmtDur(s) {
    if (s >= 60) return t('time.min', { m: Math.floor(s / 60), s: Math.round(s % 60) });
    return t('time.sec', { s: (+s).toFixed(1) });
  }
  function fmtMbps(v) { return (+v).toFixed(2) + ' Mbps'; }

  function toast(msg, ms) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, ms || 2800);
  }
  function overlay(show, text) {
    $('overlay').classList.toggle('show', !!show);
    if (text !== undefined) $('overlayText').textContent = text;
  }

  /* ---------- theme & language ---------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    $('btnTheme').textContent = state.theme === 'light' ? '☾' : '☀';
    $('btnTheme').title = state.theme === 'light' ? 'Dark theme' : 'Light theme';
  }
  function applyStatic() {
    document.documentElement.lang = LOCALES[state.lang] || 'en';
    document.title = t('app.title');
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    var ph = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < ph.length; j++) ph[j].placeholder = t(ph[j].getAttribute('data-i18n-ph'));
    $('langSelect').value = state.lang;
    $('helpBody').innerHTML = t('help.html');
    $('aboutBody').innerHTML = t('settings.about.body');
  }
  function setLang(lang) {
    if (I18N.langs.indexOf(lang) < 0) lang = 'en';
    state.lang = lang;
    try { localStorage.setItem('netlens.lang', lang); } catch (e) { }
    applyStatic();
    if (state.result) render();
  }
  function setTheme(theme) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    try { localStorage.setItem('netlens.theme', state.theme); } catch (e) { }
    applyTheme();
    if (state.result) renderChart();
  }

  /* ---------- loading ---------- */
  function parseConns(text) {
    var map = new Map();
    if (!text) return map;
    var lines = text.split(/\r?\n/);
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      var p = lines[i].split(',');
      if (p.length < 7 || p[4] !== 'Established') continue;
      var loc = p[2], k = loc.lastIndexOf(':');
      if (k < 0) continue;
      var ip = loc.slice(0, k).replace(/^\[|\]$/g, ''), port = loc.slice(k + 1);
      var key = ip + ':' + port;
      if (!map.has(key)) map.set(key, { pid: +p[5], proc: p[6] });
    }
    return map;
  }

  function analyzeBuffer(buf, name, localIps, connsText) {
    overlay(true, t('overlay.parse', { name: name }));
    setTimeout(function () {
      try {
        var started = Date.now();
        var res = NetLensCore.analyze(buf, {
          localIps: localIps || [],
          portMap: parseConns(connsText),
          onProgress: function (p, ph) {
            if (ph === 'parse') overlay(true, t('overlay.analyzing', { pct: Math.round(p * 100) }));
          }
        });
        state.elapsed = (Date.now() - started) / 1000;
        state.result = res;
        state.fileName = name;
        state.isDemo = false;
        state.localIps = localIps || res.meta.localIps;
        render();
        overlay(false);
      } catch (e) {
        overlay(false);
        console.error(e);
        toast(t('toast.parseFail', { msg: e.message }), 5000);
      }
    }, 40);
  }

  function loadFile(file) {
    if (!file) return;
    if (!/\.(pcapng|pcap|cap)$/i.test(file.name)) { toast('.pcapng / .pcap only'); return; }
    var fr = new FileReader();
    overlay(true, t('overlay.reading', { pct: 0, loaded: 0, total: Math.round(file.size / MB) }));
    fr.onprogress = function (e) {
      if (e.lengthComputable) {
        overlay(true, t('overlay.reading', {
          pct: Math.round(e.loaded / e.total * 100),
          loaded: Math.round(e.loaded / MB),
          total: Math.round(e.total / MB)
        }));
      }
    };
    fr.onload = function () { analyzeBuffer(fr.result, file.name, state.localIps, ''); };
    fr.readAsArrayBuffer(file);
  }

  function pollStatus() {
    fetch('/api/status').then(function (r) { return r.json(); }).then(function (s) {
      if (s.phase === 'done') { overlay(false); toast(t('toast.captureDone')); loadFromServer(); return; }
      if (s.phase === 'error') { overlay(false); toast(t('toast.captureFail', { msg: s.message || '' }), 6000); return; }
      overlay(true, t('overlay.capture', { pct: Math.round((s.progress || 0) * 100), msg: s.message || '' }));
      setTimeout(pollStatus, 1500);
    }).catch(function () { setTimeout(pollStatus, 3000); });
  }

  function startCapture() {
    if (!(location.protocol === 'http:' || location.protocol === 'https:')) {
      toast(t('toast.needCmd'));
      return;
    }
    if (!confirm(t('confirm.capture'))) return;
    fetch('/api/capture?seconds=180').then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { toast(j.message || t('toast.captureFail', { msg: '' }), 5000); return; }
      pollStatus();
    }).catch(function () { toast(t('toast.serverFail'), 5000); });
  }

  function loadFromServer() {
    overlay(true, t('overlay.connecting'));
    fetch('/api/latest').then(function (r) { return r.json(); }).then(function (meta) {
      if (!meta || !meta.capture) {
        overlay(false);
        if (!state.result) toast(t('toast.captureEmpty'));
        return;
      }
      state.localIps = meta.localIps || [];
      var url = '/api/file?name=' + encodeURIComponent(meta.capture);
      return fetch(url).then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var total = +resp.headers.get('content-length') || 0;
        var reader = resp.body.getReader(), chunks = [], loaded = 0;
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              var buf = new Uint8Array(loaded), off = 0;
              chunks.forEach(function (c) { buf.set(c, off); off += c.length; });
              var p = meta.conns
                ? fetch('/api/file?name=' + encodeURIComponent(meta.conns)).then(function (x) { return x.text(); })
                : Promise.resolve('');
              return p.then(function (txt) { analyzeBuffer(buf.buffer, meta.capture, state.localIps, txt); });
            }
            chunks.push(r.value); loaded += r.value.length;
            if (total) {
              overlay(true, t('overlay.downloading', {
                pct: Math.round(loaded / total * 100),
                loaded: Math.round(loaded / MB),
                total: Math.round(total / MB)
              }));
            }
            return pump();
          });
        }
        return pump();
      });
    }).catch(function (e) {
      overlay(false);
      toast(t('toast.loadFail', { msg: e.message }), 5000);
    });
  }

  /* ---------- render ---------- */
  function render() {
    var r = state.result;
    $('dropZone').classList.add('hidden');
    $('result').classList.remove('hidden');
    var name = state.isDemo ? t('demo.name') : state.fileName;
    $('fileInfo').innerHTML = '<b>' + esc(name) + '</b> · ' + esc(fmtBytes(r.meta.bytesOut + r.meta.bytesIn)) +
      ' · ' + esc(t('file.packets', { n: fmtNum(r.meta.packets) })) +
      ' · ' + esc(t('file.parsed', { sec: (state.elapsed || 0).toFixed(1) }));

    var ipRank = function (ip) {
      if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(ip)) return 0;
      if (/^169\.254\./.test(ip)) return 2;
      if (ip.indexOf(':') < 0) return 1;
      if (/^fe80/i.test(ip)) return 4;
      return 3;
    };
    var ips = (r.meta.localIps || []).slice().sort(function (a, b) { return ipRank(a) - ipRank(b); });
    if (!ips.length) {
      $('localIpsLine').textContent = t('file.localIpsNone');
    } else if (ips.length > 2) {
      $('localIpsLine').textContent = t('file.localIpsMore', { ips: ips.slice(0, 2).join(', '), n: ips.length });
    } else {
      $('localIpsLine').textContent = t('file.localIps', { ips: ips.join(', ') });
    }
    $('localIpsLine').title = ips.join(', ');
    $('ipsInput').value = ips.join(', ');

    var warns = (r.meta.warnings || []).slice();
    if (state.isDemo) warns.unshift(t('demo.warn'));
    $('warnBox').innerHTML = warns.map(function (w) { return '<div class="warnbox">' + esc(w) + '</div>'; }).join('');

    renderVerdict();
    renderCards();
    renderChart();
    renderTopTables();
    renderChecks();
    renderProcs();
    renderRemotes();
    renderDomains();
    renderFlows();
    if (state.initialTab) {
      var tb = document.querySelector('.tab[data-tab="' + state.initialTab + '"]');
      if (tb) tb.click();
      state.initialTab = null;
    }
  }

  function checkLabel(id) { return t('check.' + id + '.label'); }

  function renderVerdict() {
    var failed = state.result.checks.filter(function (c) { return !c.pass; });
    var el = $('verdict');
    var icon = el.querySelector('.icon'), title = el.querySelector('.t'), desc = el.querySelector('.d');
    if (!failed.length) {
      el.className = 'verdict ok';
      icon.textContent = '✓';
      title.textContent = t('verdict.ok.title');
      desc.textContent = t('verdict.ok.desc');
    } else if (failed.length === 1) {
      el.className = 'verdict warn';
      icon.textContent = '!';
      title.textContent = t('verdict.warn.title', { label: checkLabel(failed[0].id) });
      desc.textContent = t('verdict.warn.desc', { value: checkValue(failed[0]) });
    } else {
      el.className = 'verdict bad';
      icon.textContent = '!';
      title.textContent = t('verdict.bad.title', { n: failed.length });
      desc.textContent = t('verdict.bad.desc', { list: failed.map(function (c) { return checkLabel(c.id); }).join(', ') });
    }
  }

  function renderCards() {
    var m = state.result.meta;
    var ratio = m.bytesIn ? (m.bytesOut / m.bytesIn * 100) : 100;
    var cards = [
      { k: t('card.up'), v: fmtBytes(m.bytesOut), s: t('card.up.sub', { mbps: m.upMbps.toFixed(2) }), c: 'up', tip: t('card.up.tip') },
      { k: t('card.down'), v: fmtBytes(m.bytesIn), s: t('card.down.sub', { mbps: m.downMbps.toFixed(2) }), c: 'down', tip: t('card.down.tip') },
      { k: t('card.ratio'), v: ratio.toFixed(1) + '%', s: t('card.ratio.sub', { n: ratio ? (100 / ratio).toFixed(0) : '-' }), c: (ratio > 50 && m.upMbps > 2) ? 'bad' : 'ok', tip: t('card.ratio.tip') },
      { k: t('card.payload'), v: fmtBytes(m.payloadOut), s: t('card.payload.sub'), tip: t('card.payload.tip') },
      { k: t('card.peak'), v: m.peakUpMbps + ' Mbps', s: t('card.peak.sub', { down: m.peakDownMbps }), c: m.peakUpMbps > 10 ? 'bad' : 'ok', tip: t('card.peak.tip') },
      { k: t('card.remotes'), v: fmtNum(m.distinctRemotes), s: t('card.remotes.sub', { packets: fmtNum(m.packets) }), c: '', tip: t('card.remotes.tip') },
      { k: t('card.duration'), v: fmtDur(m.duration), s: t('card.duration.sub', { dup: fmtNum(m.dupPackets) }), c: '', tip: t('card.duration.tip') }
    ];
    $('summaryCards').innerHTML = cards.map(function (x) {
      return '<div class="card"><div class="k">' + esc(x.k) +
        (x.tip ? '<span class="i" title="' + esc(x.tip) + '">?</span>' : '') +
        '</div><div class="v ' + (x.c || '') + '">' + x.v +
        '</div><div class="s">' + esc(x.s) + '</div></div>';
    }).join('');
  }

  function renderTopTables() {
    var r = state.result;
    var ups = r.flows.slice().sort(function (a, b) { return b.up - a.up; }).slice(0, 10);
    var downs = r.remotes.slice().sort(function (a, b) { return b.down - a.down; }).slice(0, 10);
    $('tblTopUp').innerHTML =
      '<thead><tr><th>' + esc(t('th.process')) + '</th><th>' + esc(t('th.remote')) +
      '</th><th class="num">' + esc(t('th.up')) + '</th><th class="num">' + esc(t('th.down')) + '</th></tr></thead><tbody>' +
      ups.map(function (f) {
        return '<tr><td>' + esc(f.proc) + '</td><td class="mono small">' + esc(f.server) +
          (f.domain ? '<div class="dim small">' + esc(f.domain) + '</div>' : '') + '</td>' +
          '<td class="num" style="color:var(--warn)">' + fmtBytes(f.up) + '</td><td class="num">' + fmtBytes(f.down) + '</td></tr>';
      }).join('') + '</tbody>';
    $('tblTopDown').innerHTML =
      '<thead><tr><th>' + esc(t('th.remote')) + '</th><th class="num">' + esc(t('th.down')) +
      '</th><th class="num">' + esc(t('th.up')) + '</th></tr></thead><tbody>' +
      downs.map(function (x) {
        return '<tr><td class="mono small">' + esc(x.ip) + (x.name ? '<div class="dim small">' + esc(x.name) + '</div>' : '') +
          '</td><td class="num" style="color:var(--accent)">' + fmtBytes(x.down) + '</td><td class="num">' + fmtBytes(x.up) + '</td></tr>';
      }).join('') + '</tbody>';
  }

  function checkValue(c) {
    var d = c.data || {};
    switch (c.id) {
      case 'up_rate': return fmtMbps(d.upMbps || 0);
      case 'max_flow_up': return d.flow ? fmtBytes(d.flow.up) : t('check.none');
      case 'fanout': return d.proc ? t('check.fanout.value', { proc: d.proc, n: d.remotes }) : t('check.none');
      case 'inbound': return t('check.inbound.value', { n: d.count || 0 });
      case 'udp_fanout': return t('check.udp_fanout.value', { n: d.count || 0 });
      case 'unknown_proc': return t('check.unknown_proc.value', { size: fmtBytes(d.bytes || 0) });
      case 'peak_up': return t('check.peak_up.value', { mbps: (d.mbps || 0).toFixed(2) });
      default: return '';
    }
  }
  function checkDetail(c) {
    var d = c.data || {};
    switch (c.id) {
      case 'up_rate':
        return t('check.up_rate.detail', { up: (d.upMbps || 0).toFixed(2), down: (d.downMbps || 0).toFixed(2) });
      case 'max_flow_up':
        return d.flow ? t('check.max_flow.detail', {
          proc: d.flow.proc, server: d.flow.server,
          domain: d.flow.domain ? ' (' + d.flow.domain + ')' : ''
        }) : '';
      case 'fanout':
        return d.proc ? t('check.fanout.detail', { proc: d.proc, up: fmtBytes(d.up), n: d.remotes }) : '';
      case 'inbound':
        return (d.peers && d.peers.length)
          ? d.peers.map(function (p) { return p.src + ':' + p.port; }).join(', ')
          : t('check.inbound.detailEmpty');
      case 'udp_fanout':
        return (d.peers && d.peers.length)
          ? d.peers.map(function (p) { return p.ip; }).join(', ')
          : t('check.udp_fanout.detailEmpty');
      case 'unknown_proc':
        return t('check.unknown_proc.detail', { pct: (d.pct || 0).toFixed(1) });
      default: return '';
    }
  }

  function renderChecks() {
    var cs = state.result.checks;
    $('checkCards').innerHTML = cs.map(function (c) {
      var cls = c.pass ? 'ok' : 'warn';
      return '<div class="check ' + cls + '"><div class="t"><b>' + esc(checkLabel(c.id)) + '</b>' +
        '<span class="pill ' + cls + '">' + esc(t(c.pass ? 'export.ok' : 'export.warn')) + '</span></div>' +
        '<div class="val">' + esc(checkValue(c)) + '</div>' +
        '<div class="why">' + esc(t('check.' + c.id + '.plain')) + '</div>' +
        '<div class="why">' + esc(checkDetail(c)) + '</div>' +
        '<div class="thr">' + esc(t('check.' + c.id + '.thr')) + '</div></div>';
    }).join('');
  }

  function table(el, cols, rows) {
    var html = '<thead><tr>' + cols.map(function (c) {
      return '<th class="' + (c.num ? 'num' : '') + '">' + esc(c.label) + '</th>';
    }).join('') + '</tr></thead><tbody>';
    if (!rows.length) {
      html += '<tr><td colspan="' + cols.length + '" class="muted">' + esc(t('flows.empty')) + '</td></tr>';
    } else {
      rows.forEach(function (row) {
        html += '<tr>' + cols.map(function (c) {
          return '<td class="' + (c.num ? 'num ' : '') + '">' + c.value(row) + '</td>';
        }).join('') + '</tr>';
      });
    }
    el.innerHTML = html + '</tbody>';
  }

  function renderProcs() {
    table($('tblProcs'), [
      { label: t('th.process'), value: function (p) { return esc(p.proc) + ' <span class="dim small">#' + p.pid + '</span>'; } },
      { label: t('th.up'), num: true, value: function (p) { return '<span style="color:var(--warn)">' + fmtBytes(p.up) + '</span>'; } },
      { label: t('th.payload'), num: true, value: function (p) { return fmtBytes(p.payloadUp); } },
      { label: t('th.down'), num: true, value: function (p) { return fmtBytes(p.down); } },
      { label: t('th.flows'), num: true, value: function (p) { return fmtNum(p.flows); } },
      { label: t('th.remotes'), num: true, value: function (p) { return fmtNum(p.remotes); } },
      { label: t('th.domains'), value: function (p) { return '<span class="small muted">' + esc((p.domains || []).join(', ')) + '</span>'; } }
    ], state.result.procs);
  }

  function renderRemotes() {
    table($('tblRemotes'), [
      { label: t('th.remote'), value: function (x) { return '<span class="mono">' + esc(x.ip) + '</span>'; } },
      { label: t('th.name'), value: function (x) { return '<span class="small muted">' + esc(x.name || '-') + '</span>'; } },
      { label: t('th.up'), num: true, value: function (x) { return '<span style="color:var(--warn)">' + fmtBytes(x.up) + '</span>'; } },
      { label: t('th.down'), num: true, value: function (x) { return fmtBytes(x.down); } },
      { label: t('th.total'), num: true, value: function (x) { return fmtBytes(x.up + x.down); } }
    ], state.result.remotes.slice(0, 300));
  }

  function renderDomains() {
    table($('tblDomains'), [
      { label: t('th.domain'), value: function (x) { return '<span class="mono small">' + esc(x.name) + '</span>'; } },
      { label: t('th.up'), num: true, value: function (x) { return fmtBytes(x.up); } },
      { label: t('th.down'), num: true, value: function (x) { return fmtBytes(x.down); } },
      { label: t('th.total'), num: true, value: function (x) { return fmtBytes(x.up + x.down); } }
    ], state.result.domains.slice(0, 200));
  }

  function renderFlows(filter) {
    var rows = state.result.flows;
    if (filter) {
      var f = filter.toLowerCase();
      rows = rows.filter(function (x) {
        return (x.proc + ' ' + x.client + ' ' + x.server + ' ' + x.domain + ' ' + x.pid).toLowerCase().indexOf(f) >= 0;
      });
    }
    $('flowCountLine').textContent = t('flows.count', { shown: rows.length, total: state.result.flowCount });
    table($('tblFlows'), [
      { label: t('th.proto'), value: function (x) { return '<span class="tag">' + esc(x.proto) + '</span>'; } },
      { label: t('th.local'), value: function (x) { return '<span class="mono small">' + esc(x.client) + '</span>'; } },
      { label: t('th.remote'), value: function (x) { return '<span class="mono small">' + esc(x.server) + '</span>'; } },
      { label: t('th.up'), num: true, value: function (x) { return '<span style="color:var(--warn)">' + fmtBytes(x.up) + '</span>'; } },
      { label: t('th.down'), num: true, value: function (x) { return fmtBytes(x.down); } },
      { label: t('th.packets'), num: true, value: function (x) { return fmtNum(x.pkts); } },
      { label: t('th.process'), value: function (x) { return esc(x.proc) + ' <span class="dim small">#' + x.pid + '</span>'; } },
      { label: t('th.domain'), value: function (x) { return '<span class="small muted">' + esc(x.domain || '-') + '</span>'; } }
    ], rows);
  }

  /* ---------- chart ---------- */
  var chartGeom = null;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function buildTimeline() {
    var raw = state.result.timeline;
    if (!raw || !raw.length) return [];
    var group = Math.max(1, Math.ceil(raw.length / 90));
    var tl = [], i, j;
    for (i = 0; i < raw.length; i += group) {
      var sD = 0, sU = 0, c = 0;
      for (j = i; j < Math.min(raw.length, i + group); j++) { sD += raw[j].down; sU += raw[j].up; c++; }
      tl.push({ t: raw[i].t, down: sD, up: sU, span: c });
    }
    return tl;
  }

  function renderChart() {
    var cv = $('chart'), wrap = cv.parentElement;
    var w = Math.max(320, wrap.clientWidth - 32), h = 230;
    var dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
    var tl = buildTimeline();
    if (!tl.length) return;
    var maxD = 1, maxU = 1;
    tl.forEach(function (x) { if (x.down > maxD) maxD = x.down; if (x.up > maxU) maxU = x.up; });
    var padL = 60, padR = 64, padT = 14, padB = 26;
    chartGeom = {
      tl: tl, maxD: maxD, maxU: maxU, w: w, h: h, padL: padL, padR: padR, padT: padT, padB: padB,
      iw: Math.max(10, w - padL - padR), ih: h - padT - padB, n: tl.length,
      xOf: function (k) { return padL + (tl.length <= 1 ? this.iw / 2 : k / (tl.length - 1) * this.iw); },
      yD: function (v) { return padT + this.ih - (v / maxD) * this.ih; },
      yU: function (v) { return padT + this.ih - (v / maxU) * this.ih; }
    };
    drawChart(null);
    var tip = $('chartTip');
    cv.onmousemove = function (e) {
      var g = chartGeom; if (!g) return;
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var idx = Math.round((mx - g.padL) / g.iw * (g.n - 1));
      idx = Math.max(0, Math.min(g.n - 1, idx));
      drawChart(idx);
      var b = g.tl[idx], secs = b.span || 1;
      tip.querySelector('.t').textContent = 't+' + b.t + 's · ' + secs + 's';
      tip.querySelector('.down').textContent = (b.down * 8 / secs / 1e6).toFixed(2) + ' Mbps';
      tip.querySelector('.up').textContent = (b.up * 8 / secs / 1e6).toFixed(2) + ' Mbps';
      var wr = wrap.getBoundingClientRect();
      tip.style.display = 'block';
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var left = e.clientX - wr.left + 16;
      if (left + tw > wr.width - 8) left = e.clientX - wr.left - tw - 16;
      var top = e.clientY - wr.top - th - 12;
      if (top < 4) top = e.clientY - wr.top + 18;
      tip.style.left = Math.max(6, left) + 'px';
      tip.style.top = Math.max(4, top) + 'px';
    };
    cv.onmouseleave = function () {
      tip.style.display = 'none';
      drawChart(null);
    };
  }

  function drawChart(hoverIdx) {
    var cv = $('chart'), g = chartGeom;
    if (!g) return;
    var ctx = cv.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, g.w, g.h);

    var accent = cssVar('--accent'), warn = cssVar('--up-line');
    var lineCol = cssVar('--line'), dim = cssVar('--dim'), textCol = cssVar('--muted');

    ctx.font = '11px Consolas,monospace';
    for (var gi = 0; gi <= 4; gi++) {
      var y = g.padT + g.ih * gi / 4;
      ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(g.padL, y); ctx.lineTo(g.w - g.padR, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillStyle = dim;
      ctx.fillText(fmtBytes(g.maxD * (1 - gi / 4)), g.padL - 8, y + 4);
      ctx.textAlign = 'left'; ctx.fillStyle = dim;
      ctx.fillText(fmtBytes(g.maxU * (1 - gi / 4)), g.w - g.padR + 8, y + 4);
    }

    var span = state.result.meta.duration;
    ctx.textAlign = 'center'; ctx.fillStyle = dim;
    for (var k = 0; k <= 4; k++) {
      ctx.fillText(Math.round(span * k / 4) + 's', g.padL + g.iw * k / 4, g.h - 8);
    }

    var tl = g.tl, n = g.n;
    ctx.beginPath();
    ctx.moveTo(g.xOf(0), g.yD(tl[0].down));
    for (var i = 1; i < n; i++) ctx.lineTo(g.xOf(i), g.yD(tl[i].down));
    ctx.lineTo(g.xOf(n - 1), g.padT + g.ih);
    ctx.lineTo(g.xOf(0), g.padT + g.ih);
    ctx.closePath();
    ctx.globalAlpha = 0.13; ctx.fillStyle = accent; ctx.fill(); ctx.globalAlpha = 1;

    ctx.beginPath();
    for (var i2 = 0; i2 < n; i2++) {
      if (i2 === 0) ctx.moveTo(g.xOf(i2), g.yD(tl[i2].down)); else ctx.lineTo(g.xOf(i2), g.yD(tl[i2].down));
    }
    ctx.strokeStyle = accent; ctx.lineWidth = 1.8; ctx.stroke();

    ctx.beginPath();
    for (var i3 = 0; i3 < n; i3++) {
      if (i3 === 0) ctx.moveTo(g.xOf(i3), g.yU(tl[i3].up)); else ctx.lineTo(g.xOf(i3), g.yU(tl[i3].up));
    }
    ctx.strokeStyle = warn; ctx.lineWidth = 1.6; ctx.stroke();

    if (hoverIdx !== null && hoverIdx !== undefined) {
      var x = g.xOf(hoverIdx);
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = textCol; ctx.globalAlpha = .55; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, g.padT); ctx.lineTo(x, g.padT + g.ih); ctx.stroke();
      ctx.restore();
      var b = tl[hoverIdx];
      ctx.beginPath(); ctx.arc(x, g.yD(b.down), 3.2, 0, Math.PI * 2);
      ctx.fillStyle = accent; ctx.fill();
      ctx.strokeStyle = cssVar('--card'); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, g.yU(b.up), 3.2, 0, Math.PI * 2);
      ctx.fillStyle = warn; ctx.fill();
      ctx.strokeStyle = cssVar('--card'); ctx.stroke();
    }
  }

  /* ---------- export ---------- */
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function exportMd() {
    var r = state.result, m = r.meta, L = [];
    L.push('# ' + t('export.reportTitle'));
    L.push('');
    L.push('- ' + t('export.file') + ': `' + (state.isDemo ? t('demo.name') : state.fileName) + '`');
    L.push('- ' + t('export.duration') + ': ' + fmtDur(m.duration) + ' (' + fmtNum(m.packets) + ' packets)');
    L.push('- ' + t('export.localIps') + ': ' + m.localIps.join(', '));
    L.push('');
    L.push('## ' + t('export.total'));
    L.push('');
    L.push('| ' + t('export.dir') + ' | Bytes | ' + t('export.mbps') + ' |');
    L.push('|---|---|---|');
    L.push('| ' + t('th.up') + ' | ' + fmtBytes(m.bytesOut) + ' | ' + fmtMbps(m.upMbps) + ' |');
    L.push('| ' + t('th.down') + ' | ' + fmtBytes(m.bytesIn) + ' | ' + fmtMbps(m.downMbps) + ' |');
    L.push('| ' + t('card.payload') + ' | ' + fmtBytes(m.payloadOut) + ' | — |');
    L.push('');
    L.push('## ' + t('export.checks'));
    L.push('');
    L.push('| ' + t('export.result') + ' | ' + t('export.value') + ' | ' + t('export.threshold') + ' |');
    L.push('|---|---|---|');
    r.checks.forEach(function (c) {
      L.push('| ' + checkLabel(c.id) + ' | ' + (c.pass ? t('export.ok') : t('export.warn')) + ' | ' +
        checkValue(c) + ' | ' + t('check.' + c.id + '.thr') + ' |');
    });
    L.push('');
    L.push('## ' + t('export.procs'));
    L.push('');
    L.push('| ' + t('th.process') + ' | ' + t('th.up') + ' | ' + t('th.payload') + ' | ' + t('th.down') + ' | ' + t('th.remotes') + ' |');
    L.push('|---|---|---|---|---|');
    r.procs.slice(0, 20).forEach(function (p) {
      L.push('| ' + p.proc + ' (' + p.pid + ') | ' + fmtBytes(p.up) + ' | ' + fmtBytes(p.payloadUp) + ' | ' +
        fmtBytes(p.down) + ' | ' + p.remotes + ' |');
    });
    L.push('');
    L.push('## ' + t('export.flows'));
    L.push('');
    L.push('| ' + t('th.process') + ' | ' + t('th.remote') + ' | ' + t('th.up') + ' | ' + t('th.down') + ' | ' + t('th.domain') + ' |');
    L.push('|---|---|---|---|---|');
    r.flows.slice().sort(function (a, b) { return b.up - a.up; }).slice(0, 15).forEach(function (f) {
      L.push('| ' + f.proc + ' | ' + f.server + ' | ' + fmtBytes(f.up) + ' | ' + fmtBytes(f.down) + ' | ' + (f.domain || '-') + ' |');
    });
    L.push('');
    L.push('> ' + t('app.title'));
    download('netlens-report.md', L.join('\n'), 'text/markdown;charset=utf-8');
  }

  function exportCsv() {
    var rows = [['proto', 'local', 'remote', 'up_bytes', 'down_bytes', 'payload_up', 'packets', 'pid', 'process', 'domain', 'first_s', 'last_s']];
    state.result.flows.forEach(function (f) {
      rows.push([f.proto, f.client, f.server, f.up, f.down, f.payloadUp, f.pkts, f.pid, f.proc, f.domain, f.first, f.last]);
    });
    download('netlens-flows.csv', '\ufeff' + rows.map(function (r) {
      return r.map(function (x) {
        var s = String(x === undefined ? '' : x);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\n'), 'text/csv;charset=utf-8');
  }

  function exportJson() {
    download('netlens.json', JSON.stringify(state.result, null, 1), 'application/json');
  }

  /* ---------- demo ---------- */
  function demo() {
    var rnd = (function (seed) { return function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; })(42);
    var tl = [], out = 0, down = 0, peakUp = 0, peakDown = 0;
    var perSec = [];
    for (var s = 0; s < 180; s++) {
      var mbpsD = (s > 145 ? 38 : 4.2) * (0.65 + rnd() * 0.7);
      var mbpsU = 0.25 * (0.4 + rnd() * 1.2);
      var dB = mbpsD * 1e6 / 8, uB = mbpsU * 1e6 / 8;
      perSec.push({ d: dB, u: uB });
      down += dB; out += uB;
    }
    for (var b = 0; b < 180; b++) {
      tl.push({ t: b, down: perSec[b].d, up: perSec[b].u });
      if (perSec[b].u > peakUp) peakUp = perSec[b].u;
      if (perSec[b].d > peakDown) peakDown = perSec[b].d;
    }
    var mk = function (proc, pid, up, dn, rem) {
      return { proc: proc, pid: pid, up: up, down: dn, payloadUp: up * 0.4, flows: 30, remotes: rem, maxFlow: up * 0.6, domains: [] };
    };
    var res = {
      meta: {
        duration: 180, packets: 222665, dupPackets: 215000, bytesOut: out, bytesIn: down,
        payloadOut: out * 0.55, payloadIn: down * 0.96,
        upMbps: out * 8 / 180 / 1e6, downMbps: down * 8 / 180 / 1e6,
        peakUpMbps: +(peakUp * 8 / 1e6).toFixed(2), peakDownMbps: +(peakDown * 8 / 1e6).toFixed(2),
        distinctRemotes: 103, localIps: ['192.168.1.23'], warnings: []
      },
      timeline: tl,
      procs: [mk('chrome', 4420, 1.1e6, 120e6, 18), mk('FlClashCore', 9808, 3.2e6, 188e6, 23),
      mk('DeepSeek Harness', 20660, 1.3e6, 2.6e6, 3), mk('svchost', 1200, 0.1e6, 3e6, 6)],
      remotes: [
        { ip: '61.241.139.193', up: 1.5e6, down: 113e6, name: '' },
        { ip: '27.44.143.2', up: 1.1e6, down: 74e6, name: 'zerohollow.org' },
        { ip: '123.125.246.121', up: 1.2e6, down: 2.7e6, name: 'api.deepseek.com' },
        { ip: '185.199.108.133', up: 0.03e6, down: 2e6, name: 'raw.githubusercontent.com' }
      ],
      domains: [
        { name: 'api.deepseek.com', up: 1.2e6, down: 2.7e6 },
        { name: 'zerohollow.org', up: 1.1e6, down: 74e6 },
        { name: 'raw.githubusercontent.com', up: 0.03e6, down: 2e6 }
      ],
      flows: [
        { proto: 'TCP', client: '192.168.1.23:59903', server: '61.241.139.193:8443', up: 1.5e6, down: 113e6, payloadUp: 0.4e6, pkts: 47000, pid: 9808, proc: 'FlClashCore', domain: '', first: 0.2, last: 179.9 },
        { proto: 'TCP', client: '192.168.1.23:53264', server: '27.44.143.2:12560', up: 1.1e6, down: 74e6, payloadUp: 0.3e6, pkts: 20000, pid: 9808, proc: 'FlClashCore', domain: 'zerohollow.org', first: 1, last: 179 },
        { proto: 'TCP', client: '192.168.1.23:51234', server: '123.125.246.121:443', up: 1.2e6, down: 2.6e6, payloadUp: 1.0e6, pkts: 6000, pid: 20660, proc: 'DeepSeek Harness', domain: 'api.deepseek.com', first: 0.5, last: 178 }
      ],
      flowCount: 349,
      checks: [
        { id: 'up_rate', pass: true, data: { upMbps: out * 8 / 180 / 1e6, downMbps: down * 8 / 180 / 1e6 } },
        { id: 'max_flow_up', pass: true, data: { flow: { proc: 'DeepSeek Harness', server: '123.125.246.121:443', domain: 'api.deepseek.com', up: 1.2e6 }, bytesOut: out } },
        { id: 'fanout', pass: true, data: { fanout: null } },
        { id: 'inbound', pass: true, data: { count: 0, peers: [] } },
        { id: 'udp_fanout', pass: true, data: { count: 0, peers: [] } },
        { id: 'unknown_proc', pass: true, data: { bytes: 148700, pct: 2.1 } },
        { id: 'peak_up', pass: true, data: { mbps: +(peakUp * 8 / 1e6).toFixed(2), bucket: 1 } }
      ]
    };
    state.result = res;
    state.isDemo = true;
    state.fileName = '';
    state.elapsed = 0;
    state.localIps = res.meta.localIps;
    render();
  }

  /* ---------- events ---------- */
  function init() {
    var served = (location.protocol === 'http:' || location.protocol === 'https:');
    var params = new URLSearchParams(location.search);

    var savedLang = null, savedTheme = null;
    try { savedLang = localStorage.getItem('netlens.lang'); savedTheme = localStorage.getItem('netlens.theme'); } catch (e) { }
    var urlLang = params.get('lang'), urlTheme = params.get('theme');
    state.lang = (urlLang && I18N.langs.indexOf(urlLang) >= 0) ? urlLang
      : ((savedLang && I18N.langs.indexOf(savedLang) >= 0) ? savedLang : I18N.detect());
    state.theme = urlTheme === 'dark' ? 'dark' : urlTheme === 'light' ? 'light' : (savedTheme === 'dark' ? 'dark' : 'light');
    applyTheme();
    applyStatic();

    $('langSelect').onchange = function (e) { setLang(e.target.value); };
    $('btnTheme').onclick = function () { setTheme(state.theme === 'light' ? 'dark' : 'light'); };

    var pick = function (e) { if (e) e.stopPropagation(); $('fileInput').click(); };
    $('btnPick2').onclick = pick;
    $('btnOpen').onclick = function () { $('fileInput').click(); };
    $('fileInput').onchange = function (e) { loadFile(e.target.files[0]); e.target.value = ''; };
    $('btnDemo2').onclick = function (e) { e.stopPropagation(); demo(); };

    var dz = $('droparea');
    dz.onclick = function () { $('fileInput').click(); };
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
    document.addEventListener('dragover', function (e) { e.preventDefault(); });
    document.addEventListener('drop', function (e) {
      e.preventDefault();
      if (!$('result').classList.contains('hidden') && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });

    if (served) {
      $('btnRecapture').style.display = '';
      $('btnRecapture').onclick = function () { startCapture(); };
      $('btnStartCapture').onclick = function (e) { e.stopPropagation(); startCapture(); };
    } else {
      $('btnStartCapture').disabled = true;
      $('btnStartCapture').title = t('toast.needCmd');
      $('captureHint').classList.remove('hidden');
    }

    $('tabs').addEventListener('click', function (e) {
      var tab = e.target.closest('.tab'); if (!tab) return;
      var name = tab.getAttribute('data-tab');
      Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (x) {
        x.classList.toggle('active', x === tab);
      });
      ['overview', 'checks', 'procs', 'remotes', 'domains', 'flows', 'help', 'settings'].forEach(function (n) {
        $('tab-' + n).classList.toggle('hidden', n !== name);
      });
      if (name === 'overview') renderChart();
    });

    $('btnExport').onclick = function (e) {
      e.stopPropagation();
      $('exportMenu').classList.toggle('hidden');
    };
    document.addEventListener('click', function () { $('exportMenu').classList.add('hidden'); });
    $('exportMenu').addEventListener('click', function (e) {
      var b = e.target.closest('[data-export]'); if (!b) return;
      if (!state.result) return toast(t('toast.noFile'));
      if (b.getAttribute('data-export') === 'md') exportMd();
      if (b.getAttribute('data-export') === 'csv') exportCsv();
      if (b.getAttribute('data-export') === 'json') exportJson();
    });

    $('flowFilter').addEventListener('input', function (e) { if (state.result) renderFlows(e.target.value); });

    $('btnReanalyze').onclick = function () {
      if (!state.result) return;
      toast(t('toast.reanalyze'));
    };

    window.addEventListener('resize', function () { if (state.result) renderChart(); });

    state.initialTab = params.get('tab');
    if (params.get('demo') === '1') demo();
    else if (served) loadFromServer();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
