/*
 * NetLens core: offline pcap/pcapng analyzer for pktmon captures.
 * Pure JS, no dependencies. Runs in browser (worker or main thread) and Node.
 */
(function (root) {
  'use strict';

  /* ---------------- byte helpers ---------------- */
  function u16be(b, o) { return (b[o] << 8) | b[o + 1]; }
  function u32be(b, o) { return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0; }
  function u16le(b, o) { return b[o] | (b[o + 1] << 8); }
  function u32le(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0; }

  var IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

  function ipv4(b, o) { return b[o] + '.' + b[o + 1] + '.' + b[o + 2] + '.' + b[o + 3]; }

  function ipv6(b, o) {
    var w = new Array(8), i;
    for (i = 0; i < 8; i++) w[i] = (b[o + i * 2] << 8) | b[o + i * 2 + 1];
    var bestS = -1, bestL = 0;
    for (i = 0; i < 8;) {
      if (w[i] === 0) {
        var j = i;
        while (j < 8 && w[j] === 0) j++;
        var len = j - i;
        if (len >= 2 && len > bestL) { bestL = len; bestS = i; }
        i = j;
      } else i++;
    }
    var hex = [];
    for (i = 0; i < 8; i++) hex.push(w[i].toString(16));
    if (bestS < 0) return hex.join(':');
    return hex.slice(0, bestS).join(':') + '::' + hex.slice(bestS + bestL).join(':');
  }

  function isPrivate(ip) {
    if (ip.indexOf(':') >= 0) {
      var lo = ip.toLowerCase();
      if (lo === '::1') return true;
      if (/^fe[89ab]/.test(lo)) return true;
      if (/^f[cd]/.test(lo)) return true;
      return false;
    }
    var m = IPV4_RE.exec(ip);
    if (!m) return false;
    var a = +m[1], b2 = +m[2];
    if (a === 10) return true;
    if (a === 172 && b2 >= 16 && b2 <= 31) return true;
    if (a === 192 && b2 === 168) return true;
    if (a === 169 && b2 === 254) return true;
    if (a === 100 && b2 >= 64 && b2 <= 127) return true;
    if (a === 127) return true;
    return false;
  }

  /* ---------------- pcap / pcapng ---------------- */
  function detectFormat(b) {
    if (b.length >= 4) {
      if (b[0] === 0x0a && b[1] === 0x0d && b[2] === 0x0d && b[3] === 0x0a) return 'pcapng';
      var m = u32le(b, 0);
      if (m === 0xa1b2c3d4 || m === 0xa1b23c4d) return 'pcap-le';
      if (u32be(b, 0) === 0xa1b2c3d4 || u32be(b, 0) === 0xa1b23c4d) return 'pcap-be';
    }
    return 'unknown';
  }

  function forEachPcapng(b, cb) {
    var n = b.length, off = 0, le = true;
    var ifaces = [];
    while (off + 12 <= n) {
      var type = le ? u32le(b, off) : u32be(b, off);
      var blen = le ? u32le(b, off + 4) : u32be(b, off + 4);
      if (type === 0x0a0d0d0a) {
        if (b[off + 8] === 0x4d && b[off + 9] === 0x3c && b[off + 10] === 0x2b && b[off + 11] === 0x1a) le = true;
        else if (b[off + 8] === 0x1a && b[off + 9] === 0x2b && b[off + 10] === 0x3c && b[off + 11] === 0x4d) le = false;
        ifaces = [];
        if (blen < 12 || off + blen > n) break;
        off += blen;
        continue;
      }
      if (blen < 12 || off + blen > n) break;
      if (type === 1) {
        var lt = le ? u16le(b, off + 8) : u16be(b, off + 8);
        var tsresol = 6, p = off + 16, stop = off + blen - 4;
        while (p + 4 <= stop) {
          var code = le ? u16le(b, p) : u16be(b, p);
          var olen = le ? u16le(b, p + 2) : u16be(b, p + 2);
          if (code === 0) break;
          if (code === 9 && olen >= 1) tsresol = b[p + 4] & 0x7f;
          p += 4 + (((olen + 3) >> 2) << 2);
        }
        ifaces.push({ lt: lt, tsresol: tsresol });
      } else if (type === 6) {
        var iface = le ? u32le(b, off + 8) : u32be(b, off + 8);
        var tsh = le ? u32le(b, off + 12) : u32be(b, off + 12);
        var tsl = le ? u32le(b, off + 16) : u32be(b, off + 16);
        var cap = le ? u32le(b, off + 20) : u32be(b, off + 20);
        var orig = le ? u32le(b, off + 24) : u32be(b, off + 24);
        var it = ifaces[iface] || { lt: 1, tsresol: 6 };
        cb((tsh * 4294967296 + tsl) / Math.pow(10, it.tsresol), it.lt, off + 28, Math.min(cap, blen - 32), orig);
      } else if (type === 3) {
        var orig3 = le ? u32le(b, off + 8) : u32be(b, off + 8);
        cb(0, ifaces.length ? ifaces[0].lt : 1, off + 12, Math.min(orig3, blen - 16), orig3);
      }
      off += blen;
    }
  }

  function forEachPcap(b, cb, le) {
    var n = b.length, off = 24;
    var nano = (le ? u32le(b, 0) : u32be(b, 0)) === 0xa1b23c4d;
    var lt = le ? u32le(b, 20) : u32be(b, 20);
    while (off + 16 <= n) {
      var sec = le ? u32le(b, off) : u32be(b, off);
      var frac = le ? u32le(b, off + 4) : u32be(b, off + 4);
      var incl = le ? u32le(b, off + 8) : u32be(b, off + 8);
      if (off + 16 + incl > n) break;
      cb(sec + frac / (nano ? 1e9 : 1e6), lt, off + 16, incl);
      off += 16 + incl;
    }
  }

  /* ---------------- packet decoding ---------------- */
  var P = {
    ok: false, proto: 0, src: '', dst: '', sport: 0, dport: 0, seq: 0, ack: 0,
    flags: 0, ipLen: 0, payloadOff: 0, payloadLen: 0
  };

  function decode(b, off, cap, lt) {
    var p = off, end = off + cap;
    var ver = 4;
    if (lt === 1) {
      if (p + 14 > end) return false;
      var et = (b[p + 12] << 8) | b[p + 13];
      p += 14;
      while ((et === 0x8100 || et === 0x88a8 || et === 0x9100) && p + 4 <= end) {
        et = (b[p + 2] << 8) | b[p + 3];
        p += 4;
      }
      if (et === 0x0800) ver = 4;
      else if (et === 0x86dd) ver = 6;
      else return false;
    } else if (lt === 101 || lt === 12 || lt === 228) {
      if (p >= end) return false;
      ver = b[p] >> 4;
      if (ver !== 4 && ver !== 6) return false;
    } else return false;

    if (ver === 6) {
      if (p + 40 > end) return false;
      var proto6 = b[p + 6];
      var plen = (b[p + 4] << 8) | b[p + 5];
      P.src = ipv6(b, p + 8);
      P.dst = ipv6(b, p + 24);
      P.proto = proto6;
      P.ipLen = plen + 40;
      var l4 = p + 40;
      if (proto6 === 0 && l4 + 2 <= end) { P.proto = b[l4]; l4 += (b[l4 + 1] + 1) * 8; }
      return decodeL4(b, l4, Math.min(end, p + 40 + plen));
    }

    if (p + 20 > end) return false;
    var ihl = (b[p] & 0x0f) * 4;
    if (ihl < 20) return false;
    var proto = b[p + 9];
    var tot = (b[p + 2] << 8) | b[p + 3];
    if (tot < ihl) return false;
    P.src = ipv4(b, p + 12);
    P.dst = ipv4(b, p + 16);
    P.proto = proto;
    P.ipLen = tot;
    return decodeL4(b, p + ihl, Math.min(end, p + tot));
  }

  function decodeL4(b, p, end) {
    P.sport = 0; P.dport = 0; P.seq = 0; P.ack = 0; P.flags = 0;
    P.payloadOff = p; P.payloadLen = 0;
    if (P.proto === 6) {
      if (p + 20 > end) return false;
      P.sport = (b[p] << 8) | b[p + 1];
      P.dport = (b[p + 2] << 8) | b[p + 3];
      P.seq = ((b[p + 4] << 24) | (b[p + 5] << 16) | (b[p + 6] << 8) | b[p + 7]) >>> 0;
      P.ack = ((b[p + 8] << 24) | (b[p + 9] << 16) | (b[p + 10] << 8) | b[p + 11]) >>> 0;
      P.flags = b[p + 13];
      var doff = (b[p + 12] >> 4) * 4;
      if (doff < 20 || p + doff > end) return false;
      P.payloadOff = p + doff;
    } else if (P.proto === 17) {
      if (p + 8 > end) return false;
      P.sport = (b[p] << 8) | b[p + 1];
      P.dport = (b[p + 2] << 8) | b[p + 3];
      P.payloadOff = p + 8;
    } else {
      P.payloadOff = p;
    }
    P.payloadLen = Math.max(0, end - P.payloadOff);
    P.ok = true;
    return true;
  }

  /* ---------------- protocol parsers ---------------- */
  function dnsName(b, off, end) {
    var labels = [], jumped = false, guard = 0, next = off;
    while (off < end && guard++ < 128) {
      var l = b[off];
      if (l === 0) { if (!jumped) next = off + 1; return { name: labels.join('.'), next: next }; }
      if ((l & 0xc0) === 0xc0) {
        if (off + 1 >= end) break;
        if (!jumped) next = off + 2;
        off = ((l & 0x3f) << 8) | b[off + 1];
        jumped = true;
        continue;
      }
      if (off + 1 + l > end) break;
      var s = '';
      for (var i = 0; i < l; i++) s += String.fromCharCode(b[off + 1 + i]);
      labels.push(s);
      off += 1 + l;
      if (!jumped) next = off;
    }
    return { name: labels.join('.'), next: next };
  }

  function parseDns(b, start, len, out) {
    var end = start + len;
    if (len < 12) return;
    var qd = (b[start + 4] << 8) | b[start + 5];
    var an = (b[start + 6] << 8) | b[start + 7];
    var off = start + 12, qname = '', i;
    for (i = 0; i < qd; i++) {
      var r = dnsName(b, off, end);
      off = r.next;
      if (!qname) qname = r.name;
      if (off + 4 > end) return;
      off += 4;
    }
    for (i = 0; i < an; i++) {
      var r2 = dnsName(b, off, end);
      off = r2.next;
      if (off + 10 > end) return;
      var rtype = (b[off] << 8) | b[off + 1];
      var rdlen = (b[off + 8] << 8) | b[off + 9];
      off += 10;
      if (off + rdlen > end) return;
      if (rtype === 1 && rdlen === 4) {
        out.set(ipv4(b, off), qname || r2.name);
      } else if (rtype === 28 && rdlen === 16) {
        out.set(ipv6(b, off), qname || r2.name);
      }
      off += rdlen;
    }
  }

  function parseSni(b, start, len) {
    var end = start + len;
    if (len < 6 || b[start] !== 0x16 || b[start + 1] !== 0x03) return '';
    var p = start + 5;
    if (p >= end || b[p] !== 0x01) return '';
    p += 4;
    if (p + 34 > end) return '';
    p += 2 + 32;
    if (p + 1 > end) return '';
    var sid = b[p]; p += 1 + sid;
    if (p + 2 > end) return '';
    var cs = (b[p] << 8) | b[p + 1]; p += 2 + cs;
    if (p + 1 > end) return '';
    var cm = b[p]; p += 1 + cm;
    if (p + 2 > end) return '';
    var extTotal = (b[p] << 8) | b[p + 1]; p += 2;
    var extEnd = Math.min(end, p + extTotal);
    while (p + 4 <= extEnd) {
      var et = (b[p] << 8) | b[p + 1];
      var el = (b[p + 2] << 8) | b[p + 3];
      p += 4;
      if (et === 0 && el >= 5 && p + el <= end) {
        var q = p + 2;
        if (q + 3 <= end) {
          var nlen = (b[q + 1] << 8) | b[q + 2];
          if (nlen > 0 && q + 3 + nlen <= end) {
            var s = '';
            for (var i = 0; i < nlen; i++) s += String.fromCharCode(b[q + 3 + i]);
            return s;
          }
        }
      }
      p += el;
    }
    return '';
  }

  function parseHttpHost(b, start, len) {
    if (len < 5) return '';
    var head = '', lim = Math.min(len, 512);
    for (var i = 0; i < lim; i++) {
      var c = b[start + i];
      head += String.fromCharCode(c);
    }
    if (!/^(GET|POST|HEAD|PUT|CONNECT|OPTIONS) /.test(head)) return '';
    var lines = head.split('\r\n');
    for (var j = 1; j < lines.length && j < 20; j++) {
      if (/^host:/i.test(lines[j])) return lines[j].slice(5).trim();
    }
    return '';
  }

  function fnv(b, start, len) {
    var h = 0x811c9dc5;
    var end = Math.min(start + len, b.length);
    for (var i = start; i < end; i++) {
      h ^= b[i];
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h;
  }

  /* ---------------- local IP detection ---------------- */
  function detectLocalIps(b, fmt, limit) {
    var syn = new Map(), peers = new Map(), seen = 0;
    function visit(ts, lt, off, cap) {
      if (seen >= limit) return;
      seen++;
      if (!decode(b, off, cap, lt)) { dbg.fail++; return; }
      var src = P.src, dst = P.dst;
      if (P.proto === 6 && (P.flags & 0x02) && !(P.flags & 0x10)) {
        syn.set(src, (syn.get(src) || 0) + 1);
      }
      var pm = peers.get(src);
      if (!pm) { pm = new Set(); peers.set(src, pm); }
      pm.add(dst);
    }
    if (fmt === 'pcapng') forEachPcapng(b, visit);
    else if (fmt === 'pcap-le') forEachPcap(b, visit, true);
    else forEachPcap(b, visit, false);

    var cand = [];
    peers.forEach(function (set, ip) {
      var s = syn.get(ip) || 0;
      if (s === 0 && !isPrivate(ip)) return;
      if (set.size < 2 && s === 0) return;
      cand.push({ ip: ip, score: s * 3 + set.size, priv: isPrivate(ip), syn: s });
    });
    cand.sort(function (a, b2) { return b2.score - a.score; });
    var out = [];
    for (var i = 0; i < cand.length && out.length < 6; i++) {
      if (cand[i].priv || cand[i].syn >= 3) out.push(cand[i].ip);
    }
    return out;
  }

  /* ---------------- analysis ---------------- */
  function analyze(buffer, opts) {
    opts = opts || {};
    var b = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    var fmt = detectFormat(b);
    if (fmt === 'unknown') throw new Error('无法识别的文件格式：需要 pcap 或 pcapng 文件');

    var localIps = new Set(opts.localIps || []);
    var warnings = [];
    if (!localIps.size) {
      var det = detectLocalIps(b, fmt, opts.detectLimit || 40000);
      det.forEach(function (ip) { localIps.add(ip); });
      if (det.length) warnings.push('未提供本机 IP，已自动推断：' + det.join(', '));
      else warnings.push('未能推断本机 IP，请在设置里手动填写');
    }

    var flows = new Map();
    var procs = new Map();
    var remotes = new Map();
    var ports = new Map();
    var dns = new Map();
    var sni = new Map();
    var timeline = new Map();
    var inboundSyn = new Map();
    var udpRemote = new Map();
    var seen = new Map();
    var dup = 0, pkts = 0;
    var bytesOut = 0, bytesIn = 0, payloadOut = 0, payloadIn = 0;
    var t0 = 0, tEnd = 0;
    var bucketSize = opts.bucket || 1;
    var total = Math.max(1, Math.floor(b.length / 220));   // progress estimate only
    var portMap = opts.portMap || new Map();
    var progress = 0;
    var dbg = { frames: 0, fail: 0, nonlocal: 0, dup: 0 };

    function onPacket(ts, lt, off, cap) {
      if (!t0) t0 = ts;
      if (ts > tEnd) tEnd = ts;
      progress++;
      dbg.frames++;
      if (opts.onProgress && (progress & 8191) === 0) {
        opts.onProgress(Math.min(0.99, progress / total), 'parse');
      }
      if (!decode(b, off, cap, lt)) { dbg.fail++; return; }
      var src = P.src, dst = P.dst;
      var dir;
      if (localIps.has(src)) dir = 1;
      else if (localIps.has(dst)) dir = -1;
      else { dbg.nonlocal++; return; }

      var ipLen = P.ipLen;
      var plLen = P.payloadLen;
      var plh = (P.proto === 6 || P.proto === 17) && plLen > 0 ? fnv(b, P.payloadOff, 64) : 0;
      var key = P.proto + '|' + src + '|' + P.sport + '|' + dst + '|' + P.dport + '|' + ipLen + '|' + P.seq + '|' + P.ack + '|' + plh;
      var prev = seen.get(key);
      var win = opts.dedupeWindow === undefined ? 0.003 : opts.dedupeWindow;
      if (prev !== undefined && ts - prev < win) { dup++; dbg.dup++; return; }
      seen.set(key, ts);
      if (seen.size > 60000) {
        var cutoff = ts - 0.08;
        seen.forEach(function (v, k2) { if (v < cutoff) seen.delete(k2); });
      }

      pkts++;
      var lip, lp, rip, rp;
      if (dir === 1) { lip = src; lp = P.sport; rip = dst; rp = P.dport; }
      else { lip = dst; lp = P.dport; rip = src; rp = P.sport; }

      if (P.proto === 6 && (P.flags & 0x02) && !(P.flags & 0x10) && dir === -1) {
        var sk = lp + '|' + rip;
        inboundSyn.set(sk, (inboundSyn.get(sk) || 0) + 1);
      }

      var fk = P.proto + '|' + lip + '|' + lp + '|' + rip + '|' + rp;
      var f = flows.get(fk);
      if (!f) {
        f = { proto: P.proto, lip: lip, lp: lp, rip: rip, rp: rp, up: 0, down: 0, pup: 0, pkts: 0, pid: 0, proc: '', domain: '', first: ts, last: ts };
        flows.set(fk, f);
        var pm0 = portMap.get(lip + ':' + lp);
        if (pm0) { f.pid = pm0.pid; f.proc = pm0.proc; }
      }
      f.last = ts;
      f.pkts++;

      var bkt = Math.floor((ts - t0) / bucketSize) * bucketSize;
      var tl = timeline.get(bkt);
      if (!tl) { tl = { up: 0, down: 0 }; timeline.set(bkt, tl); }
      if (dir === 1) {
        f.up += ipLen; f.pup += plLen; bytesOut += ipLen; payloadOut += plLen; tl.up += ipLen;
        if (P.proto === 17) udpRemote.set(rip, (udpRemote.get(rip) || 0) + ipLen);
      } else {
        f.down += ipLen; bytesIn += ipLen; payloadIn += plLen; tl.down += ipLen;
      }

      var rem = remotes.get(rip);
      if (!rem) { rem = { ip: rip, up: 0, down: 0 }; remotes.set(rip, rem); }
      if (dir === 1) rem.up += ipLen; else rem.down += ipLen;

      var pr = ports.get(rp);
      if (!pr) { pr = { port: rp, up: 0, down: 0 }; ports.set(rp, pr); }
      if (dir === 1) pr.up += ipLen; else pr.down += ipLen;

      if (plLen > 0) {
        if (P.proto === 17 && (P.sport === 53 || P.dport === 53)) {
          try { parseDns(b, P.payloadOff, plLen, dns); } catch (e) { }
        } else if (P.proto === 6 && dir === 1 && !f.domain) {
          var nm = '';
          if (b[P.payloadOff] === 0x16 && b[P.payloadOff + 1] === 0x03) {
            nm = parseSni(b, P.payloadOff, plLen);
          }
          if (!nm) nm = parseHttpHost(b, P.payloadOff, plLen);
          if (nm) {
            nm = nm.toLowerCase();
            f.domain = nm;
            if (!sni.has(rip)) sni.set(rip, nm);
          }
        }
      }
    }

    if (fmt === 'pcapng') forEachPcapng(b, onPacket);
    else if (fmt === 'pcap-le') forEachPcap(b, onPacket, true);
    else forEachPcap(b, onPacket, false);

    if (!t0) throw new Error('没有解析到任何数据包，或没有匹配到本机 IP');
    var dur = Math.max(0.001, tEnd - t0);

    flows.forEach(function (f) {
      if (!f.proc) {
        var pm = portMap.get(f.lip + ':' + f.lp);
        if (pm) { f.pid = pm.pid; f.proc = pm.proc; }
        else f.proc = '未识别';
      }
      var pkey = f.proc + '(' + f.pid + ')';
      var p = procs.get(pkey);
      if (!p) {
        p = { key: pkey, proc: f.proc, pid: f.pid, up: 0, down: 0, pup: 0, flows: 0, remotes: new Set(), domains: new Set(), maxFlow: 0 };
        procs.set(pkey, p);
      }
      p.up += f.up; p.down += f.down; p.pup += f.pup; p.flows++;
      p.remotes.add(f.rip);
      if (f.domain) p.domains.add(f.domain);
      if (f.up > p.maxFlow) p.maxFlow = f.up;
    });

    var domAgg = new Map();
    flows.forEach(function (f) {
      var nm = f.domain || dns.get(f.rip) || sni.get(f.rip);
      if (!nm) return;
      var d = domAgg.get(nm);
      if (!d) { d = { name: nm, up: 0, down: 0 }; domAgg.set(nm, d); }
      d.up += f.up; d.down += f.down;
    });

    remotes.forEach(function (r) { r.name = dns.get(r.ip) || sni.get(r.ip) || ''; });

    var procArr = [];
    procs.forEach(function (p) {
      procArr.push({
        key: p.key, proc: p.proc, pid: p.pid, up: p.up, down: p.down, payloadUp: p.pup,
        flows: p.flows, remotes: p.remotes.size, maxFlow: p.maxFlow, domains: Array.from(p.domains).slice(0, 12)
      });
    });
    procArr.sort(function (a, b2) { return (b2.up + b2.down) - (a.up + a.down); });

    var flowArr = [];
    flows.forEach(function (f) {
      flowArr.push({
        proto: f.proto === 6 ? 'TCP' : f.proto === 17 ? 'UDP' : 'IP' + f.proto,
        client: f.lip + ':' + f.lp, server: f.rip + ':' + f.rp,
        up: f.up, down: f.down, payloadUp: f.pup, pkts: f.pkts,
        pid: f.pid, proc: f.proc,
        domain: f.domain || dns.get(f.rip) || sni.get(f.rip) || '',
        first: +(f.first - t0).toFixed(3), last: +(f.last - t0).toFixed(3)
      });
    });
    flowArr.sort(function (a, b2) { return (b2.up + b2.down) - (a.up + a.down); });

    var tlArr = [];
    timeline.forEach(function (v, k) { tlArr.push({ t: k, up: v.up, down: v.down }); });
    tlArr.sort(function (a, b2) { return a.t - b2.t; });

    var remArr = [];
    remotes.forEach(function (r) { remArr.push(r); });
    remArr.sort(function (a, b2) { return (b2.up + b2.down) - (a.up + a.down); });

    var portArr = [];
    ports.forEach(function (p) { portArr.push(p); });
    portArr.sort(function (a, b2) { return (b2.up + b2.down) - (a.up + a.down); });

    var domArr = [];
    domAgg.forEach(function (d) { domArr.push(d); });
    domArr.sort(function (a, b2) { return (b2.up + b2.down) - (a.up + a.down); });

    var synArr = [];
    inboundSyn.forEach(function (c, k) {
      var i = k.indexOf('|');
      synArr.push({ port: +k.slice(0, i), src: k.slice(i + 1), count: c });
    });
    synArr.sort(function (a, b2) { return b2.count - a.count; });

    var udpArr = [];
    udpRemote.forEach(function (v, k) { udpArr.push({ ip: k, up: v }); });
    udpArr.sort(function (a, b2) { return b2.up - a.up; });

    var upMbps = bytesOut * 8 / dur / 1e6;
    var downMbps = bytesIn * 8 / dur / 1e6;
    var peakUp = 0, peakDown = 0;
    tlArr.forEach(function (x) {
      if (x.up > peakUp) peakUp = x.up;
      if (x.down > peakDown) peakDown = x.down;
    });

    var checks = buildChecks({
      dur: dur, upMbps: upMbps, downMbps: downMbps,
      bytesOut: bytesOut, bytesIn: bytesIn,
      flows: flowArr, procs: procArr, remotes: remArr,
      syns: synArr, udp: udpArr,
      peakUpBytesPerBucket: peakUp, bucketSize: bucketSize
    });

    var meta = {
      format: fmt,
      duration: +dur.toFixed(2),
      firstTs: t0,
      lastTs: tEnd,
      packets: pkts,
      dupPackets: dup,
      bytesOut: bytesOut,
      bytesIn: bytesIn,
      payloadOut: payloadOut,
      payloadIn: payloadIn,
      upMbps: +upMbps.toFixed(3),
      downMbps: +downMbps.toFixed(3),
      peakUpMbps: +(peakUp * 8 / bucketSize / 1e6).toFixed(2),
      peakDownMbps: +(peakDown * 8 / bucketSize / 1e6).toFixed(2),
      localIps: Array.from(localIps),
      warnings: warnings,
      distinctRemotes: remArr.length,
      dbg: dbg
    };

    if (opts.onProgress) opts.onProgress(1, 'done');
    return {
      meta: meta,
      timeline: tlArr,
      procs: procArr,
      flows: flowArr.slice(0, 3000),
      flowCount: flowArr.length,
      remotes: remArr.slice(0, 300),
      ports: portArr.slice(0, 60),
      domains: domArr,
      syns: synArr.slice(0, 100),
      udp: udpArr.slice(0, 100),
      checks: checks
    };
  }

  function buildChecks(ctx) {
    var out = [];
    var upMbps = ctx.upMbps, downMbps = ctx.downMbps;

    out.push({
      id: 'up_rate',
      label: '持续上行速率',
      value: upMbps.toFixed(2) + ' Mbps',
      threshold: '> 2 Mbps 且超过下行 20%',
      pass: !(upMbps > 2 && upMbps > downMbps * 0.2),
      detail: '平均上行 ' + upMbps.toFixed(2) + ' Mbps，下行 ' + downMbps.toFixed(2) + ' Mbps'
    });

    var bigUp = null;
    for (var i = 0; i < ctx.flows.length; i++) {
      if (!bigUp || ctx.flows[i].up > bigUp.up) bigUp = ctx.flows[i];
    }
    out.push({
      id: 'max_flow_up',
      label: '单条连接最大上传',
      value: bigUp ? fmtMB(bigUp.up) : '-',
      threshold: '> 20 MB 或 > 30% 总量',
      pass: !bigUp || !(bigUp.up > 20e6 || (bigUp.up > 2e6 && bigUp.up > ctx.bytesOut * 0.3)),
      detail: bigUp ? (bigUp.proc + ' → ' + bigUp.server + (bigUp.domain ? ' (' + bigUp.domain + ')' : '')) : ''
    });

    var fan = null;
    ctx.procs.forEach(function (p) {
      if (p.up > 300 * 1024 && p.remotes >= 20) {
        if (!fan || p.up > fan.up) fan = p;
      }
    });
    out.push({
      id: 'fanout',
      label: '多对端上传（PCDN 特征）',
      value: fan ? fan.proc + ' → ' + fan.remotes + ' 个远端' : '无',
      threshold: '单进程 >20 个远端且上行 >300 KB',
      pass: !fan,
      detail: fan ? fmtMB(fan.up) + ' 上传' : '最大 fan-out 未超阈值'
    });

    var pubSyn = ctx.syns.filter(function (s) { return !isPrivate(s.src); });
    out.push({
      id: 'inbound',
      label: '公网主动连入',
      value: pubSyn.length ? pubSyn.length + ' 个来源' : '0',
      threshold: '任何非内网 SYN',
      pass: pubSyn.length === 0,
      detail: pubSyn.length ? pubSyn.slice(0, 3).map(function (s) { return s.src + ':' + s.port; }).join(', ') : '没有公网主机主动连接本机'
    });

    var udpPeers = ctx.udp.filter(function (u) { return u.up > 20000 && !isPrivate(u.ip); });
    out.push({
      id: 'udp_fanout',
      label: 'UDP 对多 IP 发送',
      value: udpPeers.length + ' 个远端',
      threshold: '>10 个远端且每个 >20 KB',
      pass: udpPeers.length <= 10,
      detail: udpPeers.length ? udpPeers.slice(0, 3).map(function (u) { return u.ip; }).join(', ') : 'UDP 流量很小'
    });

    var unknown = 0;
    ctx.flows.forEach(function (f) { if (!f.proc || f.proc === '未识别') unknown += f.up; });
    out.push({
      id: 'unknown_proc',
      label: '未归属进程的上行',
      value: fmtMB(unknown),
      threshold: '> 10% 上行',
      pass: unknown <= 1e6 || unknown <= ctx.bytesOut * 0.1,
      detail: '未能匹配到进程的上行字节数'
    });

    out.push({
      id: 'peak_up',
      label: '上行峰值（1 秒粒度）',
      value: (ctx.peakUpBytesPerBucket * 8 / ctx.bucketSize / 1e6).toFixed(2) + ' Mbps',
      threshold: '> 10 Mbps 视为突发上传',
      pass: ctx.peakUpBytesPerBucket * 8 / ctx.bucketSize / 1e6 <= 10,
      detail: ''
    });

    return out;
  }

  function fmtMB(v) {
    if (v >= 1e9) return (v / 1e9).toFixed(2) + ' GB';
    if (v >= 1e6) return (v / 1e6).toFixed(2) + ' MB';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + ' KB';
    return v + ' B';
  }

  var api = { analyze: analyze, detectFormat: detectFormat, isPrivate: isPrivate, fmtMB: fmtMB };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NetLensCore = api;
})(typeof self !== 'undefined' ? self : this);
