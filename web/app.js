/* NetLens UI */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var state = { result: null, name: '', localIps: [], connsText: '', source: 'file' };
  var MB = 1024 * 1024;

  function fmtBytes(v) {
    if (v === undefined || v === null) return '-';
    if (v >= 1e9) return (v / 1e9).toFixed(2) + ' GB';
    if (v >= 1e6) return (v / 1e6).toFixed(2) + ' MB';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + ' KB';
    return v + ' B';
  }
  function fmtNum(v) { return (v || 0).toLocaleString('zh-CN'); }
  function fmtDur(s) { return s >= 60 ? Math.floor(s / 60) + ' 分 ' + Math.round(s % 60) + ' 秒' : s.toFixed(1) + ' 秒'; }
  function esc(s) { return String(s === undefined ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function toast(msg, ms) {
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  }
  function overlay(show, text) {
    $('overlay').classList.toggle('show', !!show);
    if (text) $('overlayText').textContent = text;
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
    overlay(true, '正在解析 ' + name + ' …');
    setTimeout(function () {
      try {
        var t = Date.now();
        var res = NetLensCore.analyze(buf, {
          localIps: localIps || [],
          portMap: parseConns(connsText),
          onProgress: function (p, ph) {
            if (ph === 'parse') overlay(true, '解析中 ' + Math.round(p * 100) + '%');
          }
        });
        res.elapsed = (Date.now() - t) / 1000;
        state.result = res;
        state.name = name;
        state.localIps = localIps || res.meta.localIps;
        state.connsText = connsText || '';
        render();
        overlay(false);
      } catch (e) {
        overlay(false);
        console.error(e);
        toast('解析失败：' + e.message, 5000);
      }
    }, 60);
  }

  function loadFile(file) {
    if (!file) return;
    if (!/\.(pcapng|pcap|cap)$/i.test(file.name)) {
      toast('请选择 .pcapng / .pcap 文件'); return;
    }
    var fr = new FileReader();
    overlay(true, '读取文件 ' + Math.round(file.size / MB) + ' MB …');
    fr.onprogress = function (e) { if (e.lengthComputable) overlay(true, '读取文件 ' + Math.round(e.loaded / MB) + ' / ' + Math.round(e.total / MB) + ' MB'); };
    fr.onload = function () {
      var conns = '';
      analyzeBuffer(fr.result, file.name, state.localIps, conns);
    };
    fr.readAsArrayBuffer(file);
  }

  function pollStatus() {
    fetch('/api/status').then(function (r) { return r.json(); }).then(function (s) {
      if (s.phase === 'done') { overlay(false); toast('抓包完成'); loadFromServer(); return; }
      if (s.phase === 'error') { overlay(false); toast('抓包失败：' + (s.message || ''), 6000); return; }
      overlay(true, '抓包中 ' + Math.round((s.progress || 0) * 100) + '% · ' + (s.message || ''));
      setTimeout(pollStatus, 1500);
    }).catch(function () { setTimeout(pollStatus, 3000); });
  }

  function loadFromServer() {
    overlay(true, '正在连接本地采集服务…');
    fetch('/api/latest').then(function (r) { return r.json(); }).then(function (meta) {
      if (!meta || !meta.capture) {
        overlay(false);
        toast('本地服务里还没有抓包文件，请拖入 pcap');
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
              var buf = new Uint8Array(loaded);
              var off = 0;
              chunks.forEach(function (c) { buf.set(c, off); off += c.length; });
              var conns = '';
              var p = meta.conns ? fetch('/api/file?name=' + encodeURIComponent(meta.conns)).then(function (x) { return x.text(); }) : Promise.resolve('');
              return p.then(function (txt) {
                analyzeBuffer(buf.buffer, meta.capture, state.localIps, txt);
              });
            }
            chunks.push(r.value); loaded += r.value.length;
            if (total) overlay(true, '下载抓包 ' + Math.round(loaded / MB) + ' / ' + Math.round(total / MB) + ' MB');
            return pump();
          });
        }
        return pump();
      });
    }).catch(function (e) {
      overlay(false);
      toast('无法读取本地服务：' + e.message + '（可直接拖入文件）', 5000);
    });
  }

  /* ---------- rendering ---------- */
  function render() {
    var r = state.result;
    $('dropZone').classList.add('hidden');
    $('result').classList.remove('hidden');
    $('fileInfo').innerHTML = '<b>' + esc(state.name) + '</b> · ' + fmtBytes(r.meta.bytesOut + r.meta.bytesIn) +
      ' · ' + fmtNum(r.meta.packets) + ' 个包 · 解析 ' + (r.elapsed || 0).toFixed(1) + 's';
    var ips = r.meta.localIps || [];
    $('localIpsLine').textContent = '本机 IP：' + (ips.length ? ips.slice(0, 3).join(', ') + (ips.length > 3 ? ' 等 ' + ips.length + ' 个' : '') : '未识别');
    $('localIpsLine').title = ips.join(', ');
    $('ipsInput').value = (r.meta.localIps || []).join(', ');

    var wb = $('warnBox');
    wb.innerHTML = (r.meta.warnings || []).map(function (w) { return '<div class="warnbox">' + esc(w) + '</div>'; }).join('');

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

  function renderCards() {
    var m = state.result.meta;
    var ratio = m.bytesIn ? (m.bytesOut / m.bytesIn * 100) : 100;
    var cards = [
      { k: '上行（IP 字节）', v: fmtBytes(m.bytesOut), s: m.upMbps.toFixed(2) + ' Mbps 平均', c: 'up' },
      { k: '下行（IP 字节）', v: fmtBytes(m.bytesIn), s: m.downMbps.toFixed(2) + ' Mbps 平均', c: 'down' },
      { k: '上行 / 下行', v: ratio.toFixed(1) + '%', s: '1 : ' + (ratio ? (100 / ratio).toFixed(0) : '-'), c: (ratio > 50 && m.upMbps > 2) ? 'bad' : 'ok' },
      { k: '应用层上行', v: fmtBytes(m.payloadOut), s: '去掉 ACK 与协议头' },
      { k: '上行峰值（1s）', v: m.peakUpMbps + ' Mbps', s: '1 秒峰值，下行 ' + m.peakDownMbps + ' Mbps', c: m.peakUpMbps > 10 ? 'bad' : 'ok' },
      { k: '远端 IP', v: fmtNum(m.distinctRemotes), s: '去重后 ' + fmtNum(m.packets) + ' 包', c: '' },
      { k: '时长', v: fmtDur(m.duration), s: '重复包 ' + fmtNum(m.dupPackets), c: '' }
    ];
    $('summaryCards').innerHTML = cards.map(function (x) {
      return '<div class="card"><div class="k">' + x.k + '</div><div class="v ' + (x.c || '') + '">' + x.v +
        '</div><div class="s">' + esc(x.s) + '</div></div>';
    }).join('');
  }

  function renderTopTables() {
    var r = state.result;
    var ups = r.flows.slice().sort(function (a, b) { return b.up - a.up; }).slice(0, 10);
    var downs = r.remotes.slice().sort(function (a, b) { return b.down - a.down; }).slice(0, 10);
    $('tblTopUp').innerHTML =
      '<thead><tr><th>进程</th><th>远端</th><th class="num">上行</th><th class="num">下行</th></tr></thead><tbody>' +
      ups.map(function (f) {
        return '<tr><td>' + esc(f.proc) + '</td><td class="mono small">' + esc(f.server) +
          (f.domain ? '<div class="dim small">' + esc(f.domain) + '</div>' : '') + '</td>' +
          '<td class="num" style="color:#ffb020">' + fmtBytes(f.up) + '</td><td class="num">' + fmtBytes(f.down) + '</td></tr>';
      }).join('') + '</tbody>';
    $('tblTopDown').innerHTML =
      '<thead><tr><th>远端</th><th class="num">下行</th><th class="num">上行</th></tr></thead><tbody>' +
      downs.map(function (x) {
        return '<tr><td class="mono small">' + esc(x.ip) + (x.name ? '<div class="dim small">' + esc(x.name) + '</div>' : '') +
          '</td><td class="num" style="color:#4f8cff">' + fmtBytes(x.down) + '</td><td class="num">' + fmtBytes(x.up) + '</td></tr>';
      }).join('') + '</tbody>';
  }

  function renderChecks() {
    var cs = state.result.checks;
    $('checkCards').innerHTML = cs.map(function (c) {
      var cls = c.pass ? 'ok' : 'warn';
      return '<div class="check ' + cls + '"><div class="t"><b>' + esc(c.label) + '</b>' +
        '<span class="pill ' + cls + '">' + (c.pass ? '正常' : '需注意') + '</span></div>' +
        '<div class="val">' + esc(c.value) + '</div>' +
        '<div class="why">' + esc(c.detail || '') + '<br><span class="dim">阈值：' + esc(c.threshold) + '</span></div></div>';
    }).join('');
  }

  function table(el, cols, rows, opts) {
    var html = '<thead><tr>' + cols.map(function (c) {
      return '<th class="' + (c.num ? 'num ' : '') + (c.sort ? 'sortable' : '') + '" data-key="' + (c.key || '') + '">' + c.label + '</th>';
    }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (row) {
      html += '<tr>' + cols.map(function (c) {
        return '<td class="' + (c.num ? 'num ' : '') + (c.cls || '') + '">' + c.value(row) + '</td>';
      }).join('') + '</tr>';
    });
    if (!rows.length) html += '<tr><td colspan="' + cols.length + '" class="muted">没有数据</td></tr>';
    el.innerHTML = html + '</tbody>';
  }

  function renderProcs() {
    var rows = state.result.procs;
    table($('tblProcs'), [
      { label: '进程', value: function (p) { return esc(p.proc) + ' <span class="dim small">#' + p.pid + '</span>'; } },
      { label: '上行', num: true, value: function (p) { return '<span style="color:#ffb020">' + fmtBytes(p.up) + '</span>'; } },
      { label: '其中载荷', num: true, value: function (p) { return fmtBytes(p.payloadUp); } },
      { label: '下行', num: true, value: function (p) { return fmtBytes(p.down); } },
      { label: '连接数', num: true, value: function (p) { return fmtNum(p.flows); } },
      { label: '远端数', num: true, value: function (p) { return fmtNum(p.remotes); } },
      { label: '域名', value: function (p) { return '<span class="small muted">' + esc((p.domains || []).join(', ')) + '</span>'; } }
    ], rows);
  }

  function renderRemotes() {
    var rows = state.result.remotes.slice(0, 300);
    table($('tblRemotes'), [
      { label: '远端 IP', value: function (x) { return '<span class="mono">' + esc(x.ip) + '</span>'; } },
      { label: '名称（DNS/SNI）', value: function (x) { return '<span class="small muted">' + esc(x.name || '-') + '</span>'; } },
      { label: '上行', num: true, value: function (x) { return '<span style="color:#ffb020">' + fmtBytes(x.up) + '</span>'; } },
      { label: '下行', num: true, value: function (x) { return fmtBytes(x.down); } },
      { label: '合计', num: true, value: function (x) { return fmtBytes(x.up + x.down); } }
    ], rows);
  }

  function renderDomains() {
    var rows = state.result.domains.slice(0, 200);
    table($('tblDomains'), [
      { label: '域名', value: function (x) { return '<span class="mono small">' + esc(x.name) + '</span>'; } },
      { label: '上行', num: true, value: function (x) { return fmtBytes(x.up); } },
      { label: '下行', num: true, value: function (x) { return fmtBytes(x.down); } },
      { label: '合计', num: true, value: function (x) { return fmtBytes(x.up + x.down); } }
    ], rows);
  }

  function renderFlows(filter) {
    var rows = state.result.flows;
    if (filter) {
      var f = filter.toLowerCase();
      rows = rows.filter(function (x) {
        return (x.proc + ' ' + x.client + ' ' + x.server + ' ' + x.domain + ' ' + x.pid).toLowerCase().indexOf(f) >= 0;
      });
    }
    $('flowCountLine').textContent = '显示 ' + rows.length + ' / ' + state.result.flowCount + ' 条连接（按流量排序，最多 3000 条）';
    table($('tblFlows'), [
      { label: '协议', value: function (x) { return '<span class="tag">' + esc(x.proto) + '</span>'; } },
      { label: '本机', value: function (x) { return '<span class="mono small">' + esc(x.client) + '</span>'; } },
      { label: '远端', value: function (x) { return '<span class="mono small">' + esc(x.server) + '</span>'; } },
      { label: '上行', num: true, value: function (x) { return '<span style="color:#ffb020">' + fmtBytes(x.up) + '</span>'; } },
      { label: '下行', num: true, value: function (x) { return fmtBytes(x.down); } },
      { label: '包数', num: true, value: function (x) { return fmtNum(x.pkts); } },
      { label: '进程', value: function (x) { return esc(x.proc) + ' <span class="dim small">#' + x.pid + '</span>'; } },
      { label: '域名', value: function (x) { return '<span class="small muted">' + esc(x.domain || '-') + '</span>'; } }
    ], rows);
  }

  /* ---------- chart ---------- */
  var chartCache = null;
  function renderChart() {
    var cv = $('chart');
    var wrap = cv.parentElement;
    var w = Math.max(320, wrap.clientWidth - 32), h = 230;
    var dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr;
    cv.style.height = h + 'px';
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var raw = state.result.timeline;
    if (!raw || !raw.length) return;
    var group = Math.max(1, Math.ceil(raw.length / 90));
    var tl = [], i, j;
    for (i = 0; i < raw.length; i += group) {
      var sD = 0, sU = 0, c = 0;
      for (j = i; j < Math.min(raw.length, i + group); j++) { sD += raw[j].down; sU += raw[j].up; c++; }
      tl.push({ t: raw[i].t, down: sD, up: sU, span: c });
    }
    var maxD = 1, maxU = 1;
    tl.forEach(function (x) { if (x.down > maxD) maxD = x.down; if (x.up > maxU) maxU = x.up; });

    var padL = 60, padR = 64, padT = 14, padB = 26;
    var iw = Math.max(10, w - padL - padR), ih = h - padT - padB;
    var n = tl.length;
    function xOf(k) { return padL + (n <= 1 ? iw / 2 : k / (n - 1) * iw); }
    function yD(v) { return padT + ih - (v / maxD) * ih; }
    function yU(v) { return padT + ih - (v / maxU) * ih; }

    ctx.font = '11px Consolas,monospace';
    for (var g = 0; g <= 4; g++) {
      var y = padT + ih * g / 4;
      ctx.strokeStyle = '#1d2739'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillStyle = '#6b7d9c';
      ctx.fillText(fmtBytes(maxD * (1 - g / 4)), padL - 8, y + 4);
      ctx.textAlign = 'left'; ctx.fillStyle = '#9a7420';
      ctx.fillText(fmtBytes(maxU * (1 - g / 4)), w - padR + 8, y + 4);
    }
    var span = state.result.meta.duration;
    ctx.textAlign = 'center'; ctx.fillStyle = '#5f6f8c';
    for (var k2 = 0; k2 <= 4; k2++) {
      ctx.fillText(Math.round(span * k2 / 4) + 's', padL + iw * k2 / 4, h - 8);
    }

    ctx.beginPath();
    ctx.moveTo(xOf(0), yD(tl[0].down));
    for (i = 1; i < n; i++) ctx.lineTo(xOf(i), yD(tl[i].down));
    ctx.lineTo(xOf(n - 1), padT + ih); ctx.lineTo(xOf(0), padT + ih); ctx.closePath();
    var grad = ctx.createLinearGradient(0, padT, 0, padT + ih);
    grad.addColorStop(0, 'rgba(79,140,255,.38)'); grad.addColorStop(1, 'rgba(79,140,255,0)');
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    for (i = 0; i < n; i++) { if (i === 0) ctx.moveTo(xOf(i), yD(tl[i].down)); else ctx.lineTo(xOf(i), yD(tl[i].down)); }
    ctx.strokeStyle = '#4f8cff'; ctx.lineWidth = 1.8; ctx.stroke();

    ctx.beginPath();
    for (i = 0; i < n; i++) { if (i === 0) ctx.moveTo(xOf(i), yU(tl[i].up)); else ctx.lineTo(xOf(i), yU(tl[i].up)); }
    ctx.strokeStyle = '#ffb020'; ctx.lineWidth = 1.6; ctx.stroke();

    chartCache = { tl: tl, padL: padL, iw: iw, n: n };
    cv.onmousemove = function (e) {
      if (!chartCache) return;
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var c = chartCache;
      var idx = Math.round((mx - c.padL) / c.iw * (c.n - 1));
      idx = Math.max(0, Math.min(c.n - 1, idx));
      var b = c.tl[idx], secs = b.span || 1;
      $('chartHint').textContent = 't+' + b.t + 's（' + secs + 's 窗口）上行 ' +
        (b.up * 8 / secs / 1e6).toFixed(2) + ' Mbps · 下行 ' + (b.down * 8 / secs / 1e6).toFixed(2) + ' Mbps';
    };
    cv.onmouseleave = function () { $('chartHint').textContent = ''; };
  }

  /* ---------- export ---------- */
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function exportMd() {
    var r = state.result, m = r.meta;
    var lines = [];
    lines.push('# 网络流量分析报告（NetLens）');
    lines.push('');
    lines.push('- 文件：`' + state.name + '`');
    lines.push('- 时长：' + fmtDur(m.duration) + '（' + fmtNum(m.packets) + ' 个唯一包）');
    lines.push('- 本机 IP：' + m.localIps.join(', '));
    lines.push('');
    lines.push('## 总量');
    lines.push('');
    lines.push('| 方向 | IP 字节 | 速率 |');
    lines.push('|---|---|---|');
    lines.push('| 上行 | ' + fmtBytes(m.bytesOut) + ' | ' + m.upMbps.toFixed(2) + ' Mbps |');
    lines.push('| 下行 | ' + fmtBytes(m.bytesIn) + ' | ' + m.downMbps.toFixed(2) + ' Mbps |');
    lines.push('| 应用层上行 | ' + fmtBytes(m.payloadOut) + ' | — |');
    lines.push('');
    lines.push('## 异常判定');
    lines.push('');
    lines.push('| 检查项 | 结果 | 实测 | 阈值 |');
    lines.push('|---|---|---|---|');
    r.checks.forEach(function (c) {
      lines.push('| ' + c.label + ' | ' + (c.pass ? '正常' : '需注意') + ' | ' + c.value + ' | ' + c.threshold + ' |');
    });
    lines.push('');
    lines.push('## 进程');
    lines.push('');
    lines.push('| 进程 | 上行 | 载荷 | 下行 | 连接 | 远端 |');
    lines.push('|---|---|---|---|---|---|');
    r.procs.slice(0, 20).forEach(function (p) {
      lines.push('| ' + p.proc + ' (' + p.pid + ') | ' + fmtBytes(p.up) + ' | ' + fmtBytes(p.payloadUp) + ' | ' +
        fmtBytes(p.down) + ' | ' + p.flows + ' | ' + p.remotes + ' |');
    });
    lines.push('');
    lines.push('## 上传最高的连接');
    lines.push('');
    lines.push('| 进程 | 远端 | 上行 | 下行 | 域名 |');
    lines.push('|---|---|---|---|---|');
    r.flows.slice().sort(function (a, b) { return b.up - a.up; }).slice(0, 15).forEach(function (f) {
      lines.push('| ' + f.proc + ' | ' + f.server + ' | ' + fmtBytes(f.up) + ' | ' + fmtBytes(f.down) + ' | ' + (f.domain || '-') + ' |');
    });
    lines.push('');
    lines.push('## 下载最高的远端');
    lines.push('');
    lines.push('| 远端 | 名称 | 下行 | 上行 |');
    lines.push('|---|---|---|---|');
    r.remotes.slice(0, 15).forEach(function (x) {
      lines.push('| ' + x.ip + ' | ' + (x.name || '-') + ' | ' + fmtBytes(x.down) + ' | ' + fmtBytes(x.up) + ' |');
    });
    lines.push('');
    lines.push('> 由 NetLens 离线分析生成；统计为 IP 包字节，不含以太网帧头。');
    download('netlens-report.md', lines.join('\n'), 'text/markdown;charset=utf-8');
  }

  function exportCsv() {
    var rows = [['proto', 'local', 'remote', 'up_bytes', 'down_bytes', 'payload_up', 'packets', 'pid', 'process', 'domain', 'first_s', 'last_s']];
    state.result.flows.forEach(function (f) {
      rows.push([f.proto, f.client, f.server, f.up, f.down, f.payloadUp, f.pkts, f.pid, f.proc, f.domain, f.first, f.last]);
    });
    download('netlens-flows.csv', '\ufeff' + rows.map(function (r) { return r.map(function (x) {
      var s = String(x === undefined ? '' : x);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(','); }).join('\n'), 'text/csv;charset=utf-8');
  }

  function exportJson() {
    download('netlens.json', JSON.stringify(state.result, null, 1), 'application/json');
  }

  /* ---------- demo ---------- */
  function demo() {
    var rnd = (function (seed) { return function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; })(42);
    var tl = [], out = 0, down = 0;
    for (var t = 0; t < 180; t += 5) {
      var d = (t > 140 ? 40e6 : 3e6) * (0.7 + rnd() * 0.6);
      var u = 0.2e6 * (0.5 + rnd());
      tl.push({ t: t, down: d, up: u }); out += u; down += d;
    }
    var mk = function (proc, pid, up, dn, rem) {
      return { proc: proc, pid: pid, up: up, down: dn, payloadUp: up * 0.4, flows: 30, remotes: rem, maxFlow: up * 0.6, domains: [] };
    };
    var res = {
      meta: {
        duration: 180, packets: 222665, dupPackets: 215000, bytesOut: out, bytesIn: down,
        payloadOut: out * 0.55, payloadIn: down * 0.96, upMbps: out * 8 / 180 / 1e6, downMbps: down * 8 / 180 / 1e6,
        peakUpMbps: 1.6, peakDownMbps: 46.4, distinctRemotes: 103, localIps: ['192.168.1.23'],
        warnings: ['这是内置示例数据，用「打开抓包文件」载入你自己的 pcapng。']
      },
      timeline: tl,
      procs: [mk('chrome', 4420, 2.2e6, 120e6, 18), mk('FlClashCore', 9808, 4.4e6, 188e6, 23), mk('DeepSeek Harness', 20660, 4.7e6, 2.6e6, 3), mk('svchost', 1200, 0.1e6, 3e6, 6)],
      remotes: [
        { ip: '61.241.139.193', up: 2.5e6, down: 113e6, name: '' },
        { ip: '27.44.143.2', up: 1.8e6, down: 74e6, name: 'zerohollow.org' },
        { ip: '123.125.246.121', up: 4.7e6, down: 2.7e6, name: 'api.deepseek.com' },
        { ip: '185.199.108.133', up: 0.03e6, down: 2e6, name: 'raw.githubusercontent.com' }
      ],
      domains: [
        { name: 'api.deepseek.com', up: 4.7e6, down: 2.7e6 },
        { name: 'zerohollow.org', up: 1.8e6, down: 74e6 },
        { name: 'raw.githubusercontent.com', up: 0.03e6, down: 2e6 }
      ],
      flows: [
        { proto: 'TCP', client: '192.168.1.23:59903', server: '61.241.139.193:8443', up: 2.5e6, down: 113e6, payloadUp: 0.4e6, pkts: 47000, pid: 9808, proc: 'FlClashCore', domain: '', first: 0.2, last: 179.9 },
        { proto: 'TCP', client: '192.168.1.23:53264', server: '27.44.143.2:12560', up: 1.8e6, down: 74e6, payloadUp: 0.3e6, pkts: 20000, pid: 9808, proc: 'FlClashCore', domain: 'zerohollow.org', first: 1, last: 179 },
        { proto: 'TCP', client: '192.168.1.23:51234', server: '123.125.246.121:443', up: 4.7e6, down: 2.6e6, payloadUp: 4.3e6, pkts: 6000, pid: 20660, proc: 'DeepSeek Harness', domain: 'api.deepseek.com', first: 0.5, last: 178 }
      ],
      flowCount: 349,
      checks: [
        { id: 'up_rate', label: '持续上行速率', value: '0.37 Mbps', threshold: '> 2 Mbps 且超过下行 20%', pass: true, detail: '平均上行 0.37 Mbps' },
        { id: 'max_flow_up', label: '单条连接最大上传', value: '1.89 MB', threshold: '> 20 MB 或 > 30% 总量', pass: true, detail: 'DeepSeek Harness → api.deepseek.com' },
        { id: 'fanout', label: '多对端上传（PCDN 特征）', value: '无', threshold: '单进程 >20 个远端且上行 >300 KB', pass: true, detail: '最大 fan-out 未超阈值' },
        { id: 'inbound', label: '公网主动连入', value: '0', threshold: '任何非内网 SYN', pass: true, detail: '没有公网主机主动连接本机' },
        { id: 'udp_fanout', label: 'UDP 对多 IP 发送', value: '0 个远端', threshold: '>10 个远端且每个 >20 KB', pass: true, detail: '' },
        { id: 'unknown_proc', label: '未归属进程的上行', value: '148.7 KB', threshold: '> 10% 上行', pass: true, detail: '' }
      ]
    };
    state.result = res; state.name = '示例数据（非真实抓包）'; state.elapsed = 0;
    render();
  }

  /* ---------- events ---------- */
  function init() {
    $('btnPick').onclick = function (e) { e.stopPropagation(); $('fileInput').click(); };
    $('btnOpen').onclick = function () { $('fileInput').click(); };
    $('fileInput').onchange = function (e) { loadFile(e.target.files[0]); e.target.value = ''; };
    $('btnDemo').onclick = function (e) { e.stopPropagation(); demo(); };

    var dz = $('dropZone');
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

    $('tabs').addEventListener('click', function (e) {
      var tab = e.target.closest('.tab'); if (!tab) return;
      var name = tab.dataset.tab;
      Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) { t.classList.toggle('active', t === tab); });
      ['overview', 'checks', 'procs', 'remotes', 'domains', 'flows', 'settings'].forEach(function (n) {
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
      if (!state.result) return toast('先载入抓包文件');
      if (b.dataset.export === 'md') exportMd();
      if (b.dataset.export === 'csv') exportCsv();
      if (b.dataset.export === 'json') exportJson();
    });

    $('flowFilter').addEventListener('input', function (e) { if (state.result) renderFlows(e.target.value); });

    $('btnReanalyze').onclick = function () {
      var ips = $('ipsInput').value.split(/[,;\s]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (!state.result) return;
      toast('仅对已载入的文件生效，请重新拖入文件以应用新 IP');
    };

    window.addEventListener('resize', function () { if (state.result) renderChart(); });

    var params = new URLSearchParams(location.search);
    state.initialTab = params.get('tab');
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      var rb = $('btnRecapture');
      rb.style.display = '';
      rb.onclick = function () {
        if (!confirm('将重新抓包（默认 180 秒，需要管理员权限），确定继续？')) return;
        fetch('/api/capture?seconds=180').then(function (r) { return r.json(); }).then(function (j) {
          if (!j.ok) { toast(j.message || '无法启动抓包'); return; }
          pollStatus();
        });
      };
    }
    if (params.get('demo') === '1') demo();
    else if (location.protocol === 'http:' || location.protocol === 'https:') loadFromServer();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
