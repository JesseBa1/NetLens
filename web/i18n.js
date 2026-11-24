/* NetLens i18n: zh / en / ja / ko / pt */
(function (root) {
  'use strict';

  var zh = {
    'app.title': 'NetLens · 本地流量分析',
    'app.tagline': '本地流量分析',
    'btn.recapture': '重新抓包',
    'btn.open': '打开抓包文件',
    'btn.export': '导出 ▾',
    'export.md': 'Markdown 报告',
    'export.csv': '连接明细 CSV',
    'export.json': 'JSON 数据',

    'hero.title': '看看你的电脑，正在偷偷上传什么',
    'hero.sub1': '抓 3 分钟网络流量，逐条列出每个程序连了谁、传了多少，',
    'hero.sub2': '并自动检查 PCDN 偷跑、后台偷偷上传、被公网扫描等异常。',
    'w1.tag': '方式一', 'w1.title': '直接抓包（推荐）',
    'w1.desc': '自动抓 3 分钟，抓完跳到结果页。需要管理员权限，会弹一次 UAC。', 'w1.btn': '开始抓包',
    'w2.tag': '方式二', 'w2.title': '打开已有文件',
    'w2.desc': '用 Wireshark / tcpdump 抓的 pcapng、pcap 也能分析。', 'w2.btn': '选择文件',
    'w3.tag': '方式三', 'w3.title': '先看示例报告',
    'w3.desc': '不想抓包？点开一份示例，先看看这个工具能给出什么结论。', 'w3.btn': '查看示例',
    'drop.hint': '也可以把抓包文件直接拖到这里 · 全程在本机分析，不上传任何数据',
    'drop.captureHint': '当前是「直接打开网页」模式，无法抓包。要抓包请双击 NetLens.cmd 启动。',

    'card.up': '上行', 'card.up.sub': '发出去的数据 · {mbps} Mbps',
    'card.up.tip': '本机发出的全部 IP 包，等于「上传总量」。',
    'card.down': '下行', 'card.down.sub': '收到的数据 · {mbps} Mbps',
    'card.down.tip': '本机收到的全部 IP 包，等于「下载总量」。',
    'card.ratio': '上行 / 下行', 'card.ratio.sub': '1 : {n}',
    'card.ratio.tip': '正常上网通常小于 10%。长期超过 50% 说明你在持续上传。',
    'card.payload': '应用层上行', 'card.payload.sub': '去掉 ACK 与协议头的「真上传」',
    'card.payload.tip': '上传大文件、直播推流才会显著变大；纯 TCP 确认包不算。',
    'card.peak': '上行峰值（1s）', 'card.peak.sub': '1 秒最高，下行 {down} Mbps',
    'card.peak.tip': '任意 1 秒内的最高上传速度。',
    'card.remotes': '远端 IP', 'card.remotes.sub': '去重后 {packets} 个包',
    'card.remotes.tip': '这段时间里连过多少个不同的服务器地址。',
    'card.duration': '时长', 'card.duration.sub': '已合并重复包 {dup}',
    'card.duration.tip': '抓包覆盖的时间范围；重复包是抓包机制导致的，已自动去重。',

    'verdict.ok.title': '没发现异常上传行为',
    'verdict.ok.desc': '上下行比例、单条连接上传量、对端数量、入站连接都在正常范围内。想核对细节可以点「异常判定」。',
    'verdict.warn.title': '发现 1 项值得注意：{label}',
    'verdict.warn.desc': '{value} —— 点「异常判定」看它在说什么。如果你本来就装了远程控制/串流软件，这项可能是正常现象。',
    'verdict.bad.title': '发现 {n} 项值得注意',
    'verdict.bad.desc': '{list}。点「异常判定」逐项查看。',

    'tab.overview': '总览', 'tab.checks': '异常判定', 'tab.procs': '进程',
    'tab.remotes': '远端 IP', 'tab.domains': '域名', 'tab.flows': '连接明细',
    'tab.help': '使用说明', 'tab.settings': '设置',

    'ov.chart': '流量时间线', 'ov.chartHint': '横轴是抓包内的秒数；把鼠标移到曲线上，数值会跟着指针走。',
    'ov.topUp': '上传最多的连接', 'ov.topDown': '下载最多的远端',
    'legend.down': '下行（左轴）', 'legend.up': '上行（右轴）',
    'legend.downShort': '下行', 'legend.upShort': '上行',

    'checks.intro': '下面 7 项是常见「不正常流量」的特征。绿色 = 没有触发；黄色 = 出现了该类特征，需要你自己判断是不是正常业务（例如你本来就装了远程串流软件，出现「公网主动连入」就可能是正常的）。',
    'checks.footer': '判定阈值：上行 >2 Mbps 且超过下行 20%；单连接上传 >20 MB；单进程 ≥20 个远端且上传 >300 KB；任何公网主动连入；UDP >10 个远端且各 >20 KB。阈值可在 web/core.js 里修改。',

    'check.up_rate.label': '持续上行速率',
    'check.up_rate.plain': '你整体上传得有多快。正常刷网页/看视频时，上传通常只有下载的几十分之一。',
    'check.up_rate.thr': '> 2 Mbps 且超过下行 20%',
    'check.up_rate.detail': '平均上行 {up} Mbps，下行 {down} Mbps',

    'check.max_flow_up.label': '单条连接最大上传',
    'check.max_flow_up.plain': '有没有哪一条连接传了特别多东西，比如在后台传大文件、备份照片。',
    'check.max_flow_up.thr': '> 20 MB 或（> 2 MB 且占上行 30%）',
    'check.max_flow.detail': '{proc} → {server}{domain}',

    'check.fanout.label': '多对端上传（PCDN 特征）',
    'check.fanout.plain': '有没有同时向很多陌生 IP 发数据 —— 这是 PCDN 最典型的特征。',
    'check.fanout.thr': '单进程 >20 个远端且上行 >300 KB',
    'check.fanout.value': '{proc} → {n} 个远端',
    'check.fanout.detail': '{proc} 上传 {up}，连了 {n} 个远端',

    'check.inbound.label': '公网主动连入',
    'check.inbound.plain': '有没有公网上的机器主动连进来。有的话说明你有端口暴露在公网，或者正在被扫描。',
    'check.inbound.thr': '任何非内网来源的 SYN',
    'check.inbound.value': '{n} 个来源',
    'check.inbound.detailEmpty': '没有公网主机主动连接本机',

    'check.udp_fanout.label': 'UDP 对多 IP 发送',
    'check.udp_fanout.plain': 'UDP 是否在向很多 IP 发包。P2P、PCDN 常用这种方式绕开限制。',
    'check.udp_fanout.thr': '>10 个远端且每个 >20 KB',
    'check.udp_fanout.value': '{n} 个远端',
    'check.udp_fanout.detailEmpty': 'UDP 流量很小',

    'check.unknown_proc.label': '未归属进程的上行',
    'check.unknown_proc.plain': '有多少上传流量没能对应到具体程序（越少越好）。',
    'check.unknown_proc.thr': '> 1 MB 且占上行 10%',
    'check.unknown_proc.value': '{size}',
    'check.unknown_proc.detail': '占上行 {pct}%',

    'check.peak_up.label': '上行峰值（1 秒）',
    'check.peak_up.plain': '瞬间最高上传速度，突发传大文件时会冲高。',
    'check.peak_up.thr': '> 10 Mbps 视为突发上传',
    'check.peak_up.value': '{mbps} Mbps',
    'check.none': '无',

    'th.process': '进程', 'th.remote': '远端', 'th.up': '上行', 'th.down': '下行',
    'th.total': '合计', 'th.payload': '其中载荷', 'th.flows': '连接数', 'th.remotes': '远端数',
    'th.domains': '域名', 'th.proto': '协议', 'th.local': '本机', 'th.packets': '包数',
    'th.domain': '域名', 'th.name': '名称（DNS/SNI）',

    'procs.intro': '按程序汇总：谁传了多少、连了几个远端。',
    'remotes.intro': '按远端 IP 汇总：你的流量都发到了哪些服务器。',
    'domains.intro': '从 TLS SNI / DNS / HTTP Host 还原出的域名（HTTPS 正文加密，仅供参考）。',
    'flows.filter': '过滤：进程 / IP / 端口 / 域名',
    'flows.count': '显示 {shown} / {total} 条连接（按流量排序，最多 3000 条）',
    'flows.empty': '没有数据',

    'settings.ips.title': '本机 IP',
    'settings.ips.desc': '用于区分上下行。留空则自动推断；可填多个，逗号分隔。',
    'settings.ips.btn': '用这些 IP 重新分析',
    'settings.ips.note': '（需要重新拖入文件才生效）',
    'settings.about.title': '关于',
    'settings.about.body': 'NetLens 离线版：所有解析都在本机浏览器完成，不联网、不上传数据。<br>去重说明：pktmon 会在多个驱动组件重复记录同一个包，NetLens 按「五元组 + 序号 + 载荷指纹 + 3ms 窗口」去重。<br>统计单位为 IP 包字节（不含以太网帧头）；「载荷」为去掉 TCP/IP 头与纯 ACK 后的应用层字节。',

    'file.info': '{name} · {size} · {packets} 个包 · 解析 {sec}s',
    'file.localIps': '本机 IP：{ips}',
    'file.localIpsMore': '{ips} 等 {n} 个',
    'file.localIpsNone': '未识别',

    'toast.noFile': '先载入抓包文件',
    'toast.parseFail': '解析失败：{msg}',
    'toast.captureDone': '抓包完成',
    'toast.captureFail': '抓包失败：{msg}',
    'toast.serverFail': '无法连接本地服务，请用 NetLens.cmd 启动',
    'toast.needCmd': '直接打开网页时无法抓包，请双击 NetLens.cmd 启动',
    'toast.loadFail': '无法读取本地服务：{msg}（可直接拖入文件）',
    'toast.captureEmpty': '还没有抓包文件，点上面的「开始抓包」',
    'toast.reanalyze': '请重新拖入文件以应用新的 IP 设置',
    'confirm.capture': '将抓取 180 秒网络流量（需要管理员权限）。\n\n抓包期间请正常使用电脑，不要关闭黑色窗口。\n\n开始吗？',
    'overlay.reading': '读取文件 {pct}%（{loaded} / {total} MB）',
    'overlay.downloading': '下载抓包 {pct}%（{loaded} / {total} MB）',
    'overlay.analyzing': '解析中 {pct}%',
    'overlay.connecting': '正在连接本地采集服务…',
    'overlay.parse': '正在解析 {name} …',
    'overlay.capture': '抓包中 {pct}% · {msg}',

    'time.min': '{m} 分 {s} 秒',
    'time.sec': '{s} 秒',
    'demo.name': '示例数据（非真实抓包）',
    'demo.warn': '这是内置示例数据，用「打开抓包文件」载入你自己的 pcapng。',

    'export.reportTitle': '网络流量分析报告（NetLens）',
    'export.file': '文件',
    'export.duration': '时长',
    'export.localIps': '本机 IP',
    'export.total': '总量',
    'export.checks': '异常判定',
    'export.procs': '进程',
    'export.flows': '上传最高的连接',
    'export.remotes': '下载最高的远端',
    'export.dir': '方向', 'export.mbps': '速率', 'export.result': '结果', 'export.value': '实测',
    'export.threshold': '阈值', 'export.ok': '正常', 'export.warn': '需注意',

    'help.html':
      '<h2>三步用起来</h2><div class="steps">' +
      '<div class="step"><div class="num">1</div><div class="txt"><b>抓包</b> —— 双击 <code>NetLens.cmd</code>，UAC 点「是」，等 3 分钟。' +
      '<small>不用装 Wireshark，用的是 Windows 自带的 pktmon。</small></div></div>' +
      '<div class="step"><div class="num">2</div><div class="txt"><b>看结论</b> —— 顶部横幅直接告诉你有没有异常上传。' +
      '<small>绿色 = 没发现；黄色 = 出现了值得注意的特征，点「异常判定」看详情。</small></div></div>' +
      '<div class="step"><div class="num">3</div><div class="txt"><b>看细节</b> —— 「进程」页看谁传得多，「连接明细」页看每一条连接。' +
      '<small>可以导出成 Markdown / CSV 存档。</small></div></div></div>' +
      '<h2>这些数字是什么意思</h2><ul>' +
      '<li><b>上行 / 下行</b>：这台电脑发出 / 收到的数据量。家庭宽带通常下行远大于上行。</li>' +
      '<li><b>应用层上行</b>：去掉 TCP 确认包和协议头之后，真正的「内容上传」。判断偷传要看这个。</li>' +
      '<li><b>远端 IP</b>：连过去的服务器地址；「域名」列是它的名字（能解析出来才有）。</li>' +
      '<li><b>上行峰值</b>：1 秒内最高上传速度，PCDN 偷跑往往长时间维持在几 Mbps 以上。</li></ul>' +
      '<h2>什么情况算「不正常」</h2><ul>' +
      '<li>没在传文件、没开直播，但上行长期 &gt; 2 Mbps；</li>' +
      '<li>某个陌生进程向几十个陌生 IP 同时上传（PCDN 的典型特征）；</li>' +
      '<li>有公网 IP 主动连进来（说明有服务暴露在公网，或被扫描）；</li>' +
      '<li>上行远大于下行，且持续存在。</li></ul>' +
      '<h2>常见问题</h2><ul>' +
      '<li><b>提示「拒绝访问」</b>：没有管理员权限。请从 <code>NetLens.cmd</code> 启动；只分析文件则不需要。</li>' +
      '<li><b>抓到的流量很小</b>：这 3 分钟电脑基本空闲，正常。可以在怀疑的场景下再抓一次。</li>' +
      '<li><b>看不到具体网站</b>：HTTPS 是加密的，走代理（如 Clash）就更看不到，只能看到代理节点 IP。</li>' +
      '<li><b>能不能抓别人的电脑</b>：不能，只抓本机。</li>' +
      '<li><b>数据会不会被上传</b>：不会，解析全在本机浏览器完成，工具不联网。</li></ul>'
  };

  var en = {
    'app.title': 'NetLens · Local Traffic Analyzer',
    'app.tagline': 'local traffic analyzer',
    'btn.recapture': 'Capture again',
    'btn.open': 'Open capture',
    'btn.export': 'Export ▾',
    'export.md': 'Markdown report',
    'export.csv': 'Connections CSV',
    'export.json': 'JSON data',

    'hero.title': 'See what your PC is secretly uploading',
    'hero.sub1': 'Capture 3 minutes of traffic and see which program connected where and how much it sent,',
    'hero.sub2': 'with automatic checks for PCDN seeding, hidden uploads and inbound scans.',
    'w1.tag': 'OPTION 1', 'w1.title': 'Capture now (recommended)',
    'w1.desc': 'Runs a 3-minute capture and opens the result. Needs admin rights (one UAC prompt).', 'w1.btn': 'Start capture',
    'w2.tag': 'OPTION 2', 'w2.title': 'Open an existing file',
    'w2.desc': 'Analyze .pcapng / .pcap captured by Wireshark or tcpdump.', 'w2.btn': 'Choose file',
    'w3.tag': 'OPTION 3', 'w3.title': 'See a sample report',
    'w3.desc': 'No capture needed — open a sample and see what the tool reports.', 'w3.btn': 'View sample',
    'drop.hint': 'You can also drag a capture file here · everything is analyzed locally, nothing is uploaded',
    'drop.captureHint': 'This page was opened as a file, so capturing is unavailable. Launch NetLens.cmd to capture.',

    'card.up': 'Upload', 'card.up.sub': 'data sent · {mbps} Mbps',
    'card.up.tip': 'All IP packets sent by this PC — the total upload.',
    'card.down': 'Download', 'card.down.sub': 'data received · {mbps} Mbps',
    'card.down.tip': 'All IP packets received — the total download.',
    'card.ratio': 'Upload / download', 'card.ratio.sub': '1 : {n}',
    'card.ratio.tip': 'Normal browsing is usually below 10%. Sustained >50% means you are uploading a lot.',
    'card.payload': 'Payload upload', 'card.payload.sub': 'real content, excluding ACKs and headers',
    'card.payload.tip': 'Only large file uploads or live streaming push this up; TCP ACKs do not count.',
    'card.peak': 'Peak upload (1s)', 'card.peak.sub': '1-second peak · download {down} Mbps',
    'card.peak.tip': 'Highest upload speed in any 1-second window.',
    'card.remotes': 'Remote IPs', 'card.remotes.sub': '{packets} packets after de-duplication',
    'card.remotes.tip': 'How many distinct servers this PC talked to.',
    'card.duration': 'Duration', 'card.duration.sub': '{dup} duplicate packets merged',
    'card.duration.tip': 'Time span of the capture; duplicates come from the capture driver and were merged.',

    'verdict.ok.title': 'No abnormal upload detected',
    'verdict.ok.desc': 'Upload ratio, per-connection upload, peer count and inbound connections are all within normal range. Open "Checks" for details.',
    'verdict.warn.title': '1 item worth a look: {label}',
    'verdict.warn.desc': '{value} — open "Checks" to see what it means. If you run remote-desktop or streaming software, it may be expected.',
    'verdict.bad.title': '{n} items worth a look',
    'verdict.bad.desc': '{list}. Open "Checks" to review them one by one.',

    'tab.overview': 'Overview', 'tab.checks': 'Checks', 'tab.procs': 'Processes',
    'tab.remotes': 'Remote IPs', 'tab.domains': 'Domains', 'tab.flows': 'Connections',
    'tab.help': 'Help', 'tab.settings': 'Settings',

    'ov.chart': 'Traffic timeline', 'ov.chartHint': 'X axis is seconds into the capture; move the mouse over the curve and the values follow the pointer.',
    'ov.topUp': 'Top uploads', 'ov.topDown': 'Top downloads',
    'legend.down': 'Download (left)', 'legend.up': 'Upload (right)',
    'legend.downShort': 'Down', 'legend.upShort': 'Up',

    'checks.intro': 'These 7 checks cover common "abnormal traffic" patterns. Green = not triggered; amber = the pattern appeared — decide yourself whether it is legitimate (e.g. you do run remote streaming software, so "inbound connections" may be fine).',
    'checks.footer': 'Thresholds: upload >2 Mbps and >20% of download; single connection >20 MB; one process ≥20 remotes and >300 KB upload; any public inbound SYN; UDP >10 remotes with >20 KB each. Edit them in web/core.js.',

    'check.up_rate.label': 'Sustained upload rate',
    'check.up_rate.plain': 'How fast you upload overall. Normal browsing uploads a tiny fraction of what it downloads.',
    'check.up_rate.thr': '> 2 Mbps and >20% of download',
    'check.up_rate.detail': 'Average up {up} Mbps, down {down} Mbps',

    'check.max_flow_up.label': 'Largest single-connection upload',
    'check.max_flow_up.plain': 'Whether one connection sent a lot — e.g. a background file upload or photo backup.',
    'check.max_flow_up.thr': '> 20 MB, or >2 MB and >30% of upload',
    'check.max_flow.detail': '{proc} → {server}{domain}',

    'check.fanout.label': 'Multi-peer upload (PCDN pattern)',
    'check.fanout.plain': 'Whether something is sending to many unfamiliar IPs at once — the classic PCDN signature.',
    'check.fanout.thr': 'one process >20 remotes and >300 KB upload',
    'check.fanout.value': '{proc} → {n} remotes',
    'check.fanout.detail': '{proc} uploaded {up} to {n} remotes',

    'check.inbound.label': 'Inbound from the internet',
    'check.inbound.plain': 'Whether hosts on the public internet connected in. That means an exposed port, or you are being scanned.',
    'check.inbound.thr': 'any SYN from a public address',
    'check.inbound.value': '{n} sources',
    'check.inbound.detailEmpty': 'No public host connected in',

    'check.udp_fanout.label': 'UDP to many IPs',
    'check.udp_fanout.plain': 'Whether UDP is being sent to many IPs — a common P2P/PCDN technique.',
    'check.udp_fanout.thr': '>10 remotes with >20 KB each',
    'check.udp_fanout.value': '{n} remotes',
    'check.udp_fanout.detailEmpty': 'Very little UDP traffic',

    'check.unknown_proc.label': 'Upload not attributed to a process',
    'check.unknown_proc.plain': 'How much upload could not be mapped to a program (lower is better).',
    'check.unknown_proc.thr': '> 1 MB and >10% of upload',
    'check.unknown_proc.value': '{size}',
    'check.unknown_proc.detail': '{pct}% of upload',

    'check.peak_up.label': 'Peak upload (1 second)',
    'check.peak_up.plain': 'Highest instantaneous upload speed; spikes when a big file is sent.',
    'check.peak_up.thr': '> 10 Mbps counts as a burst',
    'check.peak_up.value': '{mbps} Mbps',
    'check.none': 'none',

    'th.process': 'Process', 'th.remote': 'Remote', 'th.up': 'Up', 'th.down': 'Down',
    'th.total': 'Total', 'th.payload': 'Payload', 'th.flows': 'Connections', 'th.remotes': 'Remotes',
    'th.domains': 'Domains', 'th.proto': 'Proto', 'th.local': 'Local', 'th.packets': 'Packets',
    'th.domain': 'Domain', 'th.name': 'Name (DNS/SNI)',

    'procs.intro': 'Per program: how much it sent and how many remotes it talked to.',
    'remotes.intro': 'Per remote IP: where your traffic actually went.',
    'domains.intro': 'Domains recovered from TLS SNI / DNS / HTTP Host (HTTPS payload is encrypted).',
    'flows.filter': 'Filter: process / IP / port / domain',
    'flows.count': 'Showing {shown} / {total} connections (sorted by traffic, up to 3000)',
    'flows.empty': 'No data',

    'settings.ips.title': 'Local IPs',
    'settings.ips.desc': 'Used to tell upload from download. Leave empty to auto-detect; separate multiple with commas.',
    'settings.ips.btn': 'Re-analyze with these IPs',
    'settings.ips.note': '(drop the file again to apply)',
    'settings.about.title': 'About',
    'settings.about.body': 'NetLens is fully offline: parsing happens in your browser, nothing is uploaded.<br>De-duplication: pktmon records the same frame at several driver layers; NetLens merges them by 5-tuple + sequence + payload fingerprint + 3 ms window.<br>Bytes are IP packet bytes (Ethernet headers excluded); "payload" excludes TCP/IP headers and pure ACKs.',

    'file.info': '{name} · {size} · {packets} packets · parsed in {sec}s',
    'file.localIps': 'Local IPs: {ips}',
    'file.localIpsMore': '{ips} and {n} more',
    'file.localIpsNone': 'not detected',

    'toast.noFile': 'Load a capture first',
    'toast.parseFail': 'Parse failed: {msg}',
    'toast.captureDone': 'Capture finished',
    'toast.captureFail': 'Capture failed: {msg}',
    'toast.serverFail': 'Cannot reach the local service — start with NetLens.cmd',
    'toast.needCmd': 'Capturing needs NetLens.cmd; this page was opened as a file',
    'toast.loadFail': 'Cannot read the local service: {msg} (you can drop a file instead)',
    'toast.captureEmpty': 'No capture yet — click "Start capture" above',
    'toast.reanalyze': 'Drop the file again to apply the new IP list',
    'confirm.capture': 'Capture 180 seconds of traffic (administrator rights required).\n\nKeep using the PC normally and do not close the console window.\n\nStart?',
    'overlay.reading': 'Reading file {pct}% ({loaded} / {total} MB)',
    'overlay.downloading': 'Downloading capture {pct}% ({loaded} / {total} MB)',
    'overlay.analyzing': 'Analyzing {pct}%',
    'overlay.connecting': 'Connecting to local service…',
    'overlay.parse': 'Parsing {name} …',
    'overlay.capture': 'Capturing {pct}% · {msg}',

    'time.min': '{m}m {s}s',
    'time.sec': '{s}s',
    'demo.name': 'Sample data (not a real capture)',
    'demo.warn': 'This is built-in sample data. Use "Open capture" to load your own pcapng.',

    'export.reportTitle': 'Network traffic report (NetLens)',
    'export.file': 'File',
    'export.duration': 'Duration',
    'export.localIps': 'Local IPs',
    'export.total': 'Totals',
    'export.checks': 'Checks',
    'export.procs': 'Processes',
    'export.flows': 'Top uploads',
    'export.remotes': 'Top downloads',
    'export.dir': 'Direction', 'export.mbps': 'Rate', 'export.result': 'Result', 'export.value': 'Value',
    'export.threshold': 'Threshold', 'export.ok': 'OK', 'export.warn': 'Check',

    'help.html':
      '<h2>Three steps</h2><div class="steps">' +
      '<div class="step"><div class="num">1</div><div class="txt"><b>Capture</b> — double-click <code>NetLens.cmd</code>, accept the UAC prompt, wait 3 minutes.' +
      '<small>No Wireshark needed — it uses the built-in Windows pktmon.</small></div></div>' +
      '<div class="step"><div class="num">2</div><div class="txt"><b>Read the verdict</b> — the banner at the top tells you whether anything looked wrong.' +
      '<small>Green = nothing found; amber = a pattern appeared, open "Checks" for details.</small></div></div>' +
      '<div class="step"><div class="num">3</div><div class="txt"><b>Drill down</b> — "Processes" shows who sent the most; "Connections" lists every flow.' +
      '<small>Export as Markdown / CSV / JSON.</small></div></div></div>' +
      '<h2>What the numbers mean</h2><ul>' +
      '<li><b>Upload / download</b>: total data sent and received. Home connections download far more than they upload.</li>' +
      '<li><b>Payload upload</b>: real content after removing TCP ACKs and headers. This is what matters for hidden uploads.</li>' +
      '<li><b>Remote IPs</b>: servers you talked to; the domain column shows their name when resolvable.</li>' +
      '<li><b>Peak upload</b>: highest 1-second speed. PCDN seeding usually stays at several Mbps for a long time.</li></ul>' +
      '<h2>What counts as abnormal</h2><ul>' +
      '<li>Nothing is being sent, yet upload stays above 2 Mbps;</li>' +
      '<li>An unknown process uploads to dozens of unknown IPs (classic PCDN);</li>' +
      '<li>Public IPs connect inbound (an exposed service or a scan);</li>' +
      '<li>Upload is much larger than download and stays that way.</li></ul>' +
      '<h2>FAQ</h2><ul>' +
      '<li><b>"Access denied"</b>: no admin rights. Start from <code>NetLens.cmd</code>; file analysis needs no admin.</li>' +
      '<li><b>Very little traffic captured</b>: the PC was idle for those 3 minutes — normal. Capture again while the suspicious app runs.</li>' +
      '<li><b>No website names</b>: HTTPS is encrypted, and a proxy (Clash etc.) hides destinations entirely; only the proxy IP is visible.</li>' +
      '<li><b>Can it capture another PC?</b> No, local machine only.</li>' +
      '<li><b>Is my data uploaded?</b> No. Everything is parsed in your browser; the tool makes no network requests.</li></ul>'
  };

  var ja = {
    'app.title': 'NetLens · ローカル通信アナライザー',
    'app.tagline': 'ローカル通信分析',
    'btn.recapture': '再キャプチャ',
    'btn.open': 'キャプチャを開く',
    'btn.export': 'エクスポート ▾',
    'export.md': 'Markdown レポート',
    'export.csv': '接続一覧 CSV',
    'export.json': 'JSON データ',

    'hero.title': 'PC が裏で何を送っているか、見てみましょう',
    'hero.sub1': '3 分間の通信をキャプチャし、どのプログラムがどこへ何を送ったかを一覧にします。',
    'hero.sub2': 'PCDN の不正送信、隠れたアップロード、外部からのスキャンを自動チェックします。',
    'w1.tag': '方法 1', 'w1.title': 'その場でキャプチャ（推奨）',
    'w1.desc': '3 分間キャプチャして結果を表示します。管理者権限が必要（UAC が 1 回出ます）。', 'w1.btn': 'キャプチャ開始',
    'w2.tag': '方法 2', 'w2.title': '既存ファイルを開く',
    'w2.desc': 'Wireshark / tcpdump の .pcapng / .pcap も解析できます。', 'w2.btn': 'ファイルを選択',
    'w3.tag': '方法 3', 'w3.title': 'サンプルを見る',
    'w3.desc': 'キャプチャせずに、サンプルデータで結果を確認できます。', 'w3.btn': 'サンプルを見る',
    'drop.hint': 'キャプチャファイルをここにドラッグしても OK · 解析はすべて本体内で完結します',
    'drop.captureHint': 'このページはファイルとして開かれているためキャプチャできません。NetLens.cmd から起動してください。',

    'card.up': 'アップロード', 'card.up.sub': '送信データ · {mbps} Mbps',
    'card.up.tip': 'この PC が送信した全 IP パケット（= アップロード総量）。',
    'card.down': 'ダウンロード', 'card.down.sub': '受信データ · {mbps} Mbps',
    'card.down.tip': 'この PC が受信した全 IP パケット（= ダウンロード総量）。',
    'card.ratio': '上り / 下り', 'card.ratio.sub': '1 : {n}',
    'card.ratio.tip': '通常の閲覧では 10% 未満。50% を超える状態が続くなら送信過多です。',
    'card.payload': 'アプリ層の上り', 'card.payload.sub': 'ACK とヘッダーを除いた「実データ」',
    'card.payload.tip': '大きなファイル送信や配信でのみ増えます。TCP ACK は含みません。',
    'card.peak': '上りピーク（1 秒）', 'card.peak.sub': '1 秒最高 · 下り {down} Mbps',
    'card.peak.tip': '任意の 1 秒間での最大アップロード速度。',
    'card.remotes': 'リモート IP', 'card.remotes.sub': '重複除去後 {packets} パケット',
    'card.remotes.tip': '接続した異なるサーバーの数。',
    'card.duration': '時間', 'card.duration.sub': '重複パケット {dup} 件を統合',
    'card.duration.tip': 'キャプチャの対象時間。重複はキャプチャ機構によるもので自動統合済み。',

    'verdict.ok.title': '異常なアップロードは見つかりませんでした',
    'verdict.ok.desc': '上り下りの比率、単一接続の送信量、接続先数、受信接続のいずれも正常範囲です。詳細は「チェック」へ。',
    'verdict.warn.title': '注意すべき項目が 1 件：{label}',
    'verdict.warn.desc': '{value} — 「チェック」で意味を確認してください。リモート/配信ソフトを入れている場合は正常なこともあります。',
    'verdict.bad.title': '注意すべき項目が {n} 件',
    'verdict.bad.desc': '{list}。「チェック」で 1 つずつ確認してください。',

    'tab.overview': '概要', 'tab.checks': 'チェック', 'tab.procs': 'プロセス',
    'tab.remotes': 'リモート IP', 'tab.domains': 'ドメイン', 'tab.flows': '接続一覧',
    'tab.help': '使い方', 'tab.settings': '設定',

    'ov.chart': '通信タイムライン', 'ov.chartHint': '横軸はキャプチャ開始からの秒数。曲線にマウスを合わせると値が追従します。',
    'ov.topUp': '送信の多い接続', 'ov.topDown': '受信の多い接続先',
    'legend.down': '下り（左軸）', 'legend.up': '上り（右軸）',
    'legend.downShort': '下り', 'legend.upShort': '上り',

    'checks.intro': '以下 7 項目は「異常な通信」の典型的な特徴です。緑 = 未検出、黄 = 特徴あり（業務上正常な場合もあります）。',
    'checks.footer': 'しきい値：上り >2 Mbps かつ下りの 20% 超／単一接続 >20 MB／1 プロセスが 20 以上の接続先かつ 300 KB 超／公衆からの SYN／UDP が 10 以上の接続先かつ各 20 KB 超。web/core.js で変更できます。',

    'check.up_rate.label': '持続的な上り速度',
    'check.up_rate.plain': '全体の送信速度。通常の閲覧では下りの数十分の一程度です。',
    'check.up_rate.thr': '> 2 Mbps かつ下りの 20% 超',
    'check.up_rate.detail': '平均 上り {up} Mbps / 下り {down} Mbps',

    'check.max_flow_up.label': '単一接続の最大送信量',
    'check.max_flow_up.plain': '1 本の接続で大量に送っていないか（バックアップや大容量送信など）。',
    'check.max_flow_up.thr': '> 20 MB、または >2 MB かつ上りの 30% 超',
    'check.max_flow.detail': '{proc} → {server}{domain}',

    'check.fanout.label': '多数の接続先への送信（PCDN の特徴）',
    'check.fanout.plain': '多数の見知らぬ IP へ同時に送信していないか。PCDN の最も典型的な特徴です。',
    'check.fanout.thr': '1 プロセスが 20 以上の接続先かつ 300 KB 超',
    'check.fanout.value': '{proc} → {n} 台',
    'check.fanout.detail': '{proc} が {up} を {n} 台へ送信',

    'check.inbound.label': '公衆からの受信接続',
    'check.inbound.plain': '外部から接続してきていないか。ポート公開やスキャンの可能性があります。',
    'check.inbound.thr': '公衆アドレスからの SYN',
    'check.inbound.value': '{n} 件',
    'check.inbound.detailEmpty': '公衆からの接続なし',

    'check.udp_fanout.label': '多数 IP への UDP 送信',
    'check.udp_fanout.plain': 'UDP を多数の IP へ送っていないか。P2P/PCDN でよく使われます。',
    'check.udp_fanout.thr': '10 以上かつ各 20 KB 超',
    'check.udp_fanout.value': '{n} 台',
    'check.udp_fanout.detailEmpty': 'UDP 通信はごく僅か',

    'check.unknown_proc.label': 'プロセス不明の上り',
    'check.unknown_proc.plain': 'プログラムに紐づかない送信量（少ないほど良い）。',
    'check.unknown_proc.thr': '> 1 MB かつ上りの 10% 超',
    'check.unknown_proc.value': '{size}',
    'check.unknown_proc.detail': '上りの {pct}%',

    'check.peak_up.label': '上りピーク（1 秒）',
    'check.peak_up.plain': '瞬間的な最大送信速度。大容量送信時に跳ね上がります。',
    'check.peak_up.thr': '> 10 Mbps を突発送信とみなす',
    'check.peak_up.value': '{mbps} Mbps',
    'check.none': 'なし',

    'th.process': 'プロセス', 'th.remote': '接続先', 'th.up': '上り', 'th.down': '下り',
    'th.total': '合計', 'th.payload': '実データ', 'th.flows': '接続数', 'th.remotes': '接続先数',
    'th.domains': 'ドメイン', 'th.proto': 'プロトコル', 'th.local': 'ローカル', 'th.packets': 'パケット',
    'th.domain': 'ドメイン', 'th.name': '名前（DNS/SNI）',

    'procs.intro': 'プログラム別：送信量と接続先数。',
    'remotes.intro': '接続先 IP 別：どこへ通信したか。',
    'domains.intro': 'TLS SNI / DNS / HTTP Host から復元したドメイン（HTTPS 本文は暗号化）。',
    'flows.filter': '絞り込み：プロセス / IP / ポート / ドメイン',
    'flows.count': '{shown} / {total} 件を表示（通信量順、最大 3000 件）',
    'flows.empty': 'データなし',

    'settings.ips.title': 'ローカル IP',
    'settings.ips.desc': '上り/下りの判定に使用。空欄なら自動推定。複数はカンマ区切り。',
    'settings.ips.btn': 'この IP で再解析',
    'settings.ips.note': '（ファイルを再ドロップすると反映）',
    'settings.about.title': 'このツールについて',
    'settings.about.body': 'NetLens は完全オフラインです。解析はブラウザ内で行われ、どこにも送信しません。<br>重複除去：pktmon は同じパケットを複数のドライバ層で記録するため、5 タプル + シーケンス + ペイロード指紋 + 3ms で統合します。<br>バイト数は IP パケット長（Ethernet ヘッダー除く）。「実データ」は TCP/IP ヘッダーと純粋な ACK を除いた値です。',

    'file.info': '{name} · {size} · {packets} パケット · 解析 {sec} 秒',
    'file.localIps': 'ローカル IP：{ips}',
    'file.localIpsMore': '{ips} ほか {n} 件',
    'file.localIpsNone': '未検出',

    'toast.noFile': '先にキャプチャを読み込んでください',
    'toast.parseFail': '解析に失敗：{msg}',
    'toast.captureDone': 'キャプチャ完了',
    'toast.captureFail': 'キャプチャ失敗：{msg}',
    'toast.serverFail': 'ローカルサービスに接続できません。NetLens.cmd から起動してください',
    'toast.needCmd': 'ファイルとして開いた場合はキャプチャできません。NetLens.cmd から起動してください',
    'toast.loadFail': 'ローカルサービスを読めません：{msg}（ファイルをドロップしても可）',
    'toast.captureEmpty': 'キャプチャがありません。上の「キャプチャ開始」を押してください',
    'toast.reanalyze': '新しい IP 設定を反映するにはファイルを再ドロップしてください',
    'confirm.capture': '180 秒間キャプチャします（管理者権限が必要）。\n\nキャプチャ中は通常どおり PC を使い、黒いウィンドウを閉じないでください。\n\n開始しますか？',
    'overlay.reading': 'ファイル読み込み {pct}%（{loaded} / {total} MB）',
    'overlay.downloading': 'キャプチャ取得 {pct}%（{loaded} / {total} MB）',
    'overlay.analyzing': '解析中 {pct}%',
    'overlay.connecting': 'ローカルサービスに接続中…',
    'overlay.parse': '{name} を解析中 …',
    'overlay.capture': 'キャプチャ中 {pct}% · {msg}',

    'time.min': '{m} 分 {s} 秒',
    'time.sec': '{s} 秒',
    'demo.name': 'サンプルデータ（実キャプチャではありません）',
    'demo.warn': 'これは内蔵サンプルです。「キャプチャを開く」からご自身の pcapng を読み込んでください。',

    'export.reportTitle': '通信解析レポート（NetLens）',
    'export.file': 'ファイル',
    'export.duration': '時間',
    'export.localIps': 'ローカル IP',
    'export.total': '合計',
    'export.checks': 'チェック',
    'export.procs': 'プロセス',
    'export.flows': '送信の多い接続',
    'export.remotes': '受信の多い接続先',
    'export.dir': '方向', 'export.mbps': '速度', 'export.result': '結果', 'export.value': '実測',
    'export.threshold': 'しきい値', 'export.ok': '正常', 'export.warn': '注意',

    'help.html':
      '<h2>3 ステップ</h2><div class="steps">' +
      '<div class="step"><div class="num">1</div><div class="txt"><b>キャプチャ</b> — <code>NetLens.cmd</code> をダブルクリックし、UAC を許可して 3 分待ちます。' +
      '<small>Wireshark は不要。Windows 標準の pktmon を使います。</small></div></div>' +
      '<div class="step"><div class="num">2</div><div class="txt"><b>結論を見る</b> — 上部のバナーが異常の有無を教えてくれます。' +
      '<small>緑 = 問題なし、黄 = 特徴あり。「チェック」で詳細を確認。</small></div></div>' +
      '<div class="step"><div class="num">3</div><div class="txt"><b>詳細を見る</b> — 「プロセス」で送信量の多いアプリ、「接続一覧」で個別の通信。' +
      '<small>Markdown / CSV / JSON で保存できます。</small></div></div></div>' +
      '<h2>数字の意味</h2><ul>' +
      '<li><b>上り / 下り</b>：送受信したデータ量。通常の回線は下りが圧倒的に多いです。</li>' +
      '<li><b>アプリ層の上り</b>：TCP ACK とヘッダーを除いた実際の送信内容。不正送信の判断はこれで。</li>' +
      '<li><b>リモート IP</b>：接続したサーバー。「ドメイン」列は判明した場合の名前。</li>' +
      '<li><b>上りピーク</b>：1 秒間の最大速度。PCDN は数 Mbps を長時間維持する傾向があります。</li></ul>' +
      '<h2>異常とみなす目安</h2><ul>' +
      '<li>送信していないのに上りが 2 Mbps を超え続ける。</li>' +
      '<li>不明なプロセスが多数の見知らぬ IP へ送信している（PCDN の典型）。</li>' +
      '<li>公衆 IP から接続が来ている（ポート公開・スキャン）。</li>' +
      '<li>上りが下りより大きく、それが続く。</li></ul>' +
      '<h2>よくある質問</h2><ul>' +
      '<li><b>「アクセス拒否」</b>：管理者権限がありません。<code>NetLens.cmd</code> から起動してください。</li>' +
      '<li><b>通信量が少ない</b>：3 分間 PC がほぼアイドルだっただけです。気になる操作中に再取得を。</li>' +
      '<li><b>サイト名が出ない</b>：HTTPS は暗号化され、プロキシ（Clash 等）経由なら接続先も隠れます。</li>' +
      '<li><b>他の PC をキャプチャできる？</b> できません。この PC のみです。</li>' +
      '<li><b>データは送信される？</b> いいえ。解析はブラウザ内で完結します。</li></ul>'
  };

  var ko = {
    'app.title': 'NetLens · 로컬 트래픽 분석',
    'app.tagline': '로컬 트래픽 분석',
    'btn.recapture': '다시 캡처',
    'btn.open': '캡처 열기',
    'btn.export': '내보내기 ▾',
    'export.md': 'Markdown 보고서',
    'export.csv': '연결 목록 CSV',
    'export.json': 'JSON 데이터',

    'hero.title': '내 PC가 몰래 무엇을 올리는지 확인하세요',
    'hero.sub1': '3분간 트래픽을 캡처해 어떤 프로그램이 어디로 얼마나 보냈는지 보여줍니다.',
    'hero.sub2': 'PCDN 몰래 업로드, 백그라운드 업로드, 외부 스캔을 자동으로 점검합니다.',
    'w1.tag': '방법 1', 'w1.title': '바로 캡처 (권장)',
    'w1.desc': '3분간 캡처하고 결과를 보여줍니다. 관리자 권한이 필요하며 UAC 창이 한 번 뜹니다.', 'w1.btn': '캡처 시작',
    'w2.tag': '방법 2', 'w2.title': '기존 파일 열기',
    'w2.desc': 'Wireshark / tcpdump로 만든 .pcapng / .pcap도 분석합니다.', 'w2.btn': '파일 선택',
    'w3.tag': '방법 3', 'w3.title': '예시 먼저 보기',
    'w3.desc': '캡처 없이 예시 데이터로 결과를 미리 볼 수 있습니다.', 'w3.btn': '예시 보기',
    'drop.hint': '캡처 파일을 여기로 끌어다 놓아도 됩니다 · 분석은 전부 이 PC에서 수행됩니다',
    'drop.captureHint': '이 페이지는 파일로 열려 캡처할 수 없습니다. NetLens.cmd로 실행하세요.',

    'card.up': '업로드', 'card.up.sub': '보낸 데이터 · {mbps} Mbps',
    'card.up.tip': '이 PC가 보낸 모든 IP 패킷 = 업로드 총량.',
    'card.down': '다운로드', 'card.down.sub': '받은 데이터 · {mbps} Mbps',
    'card.down.tip': '이 PC가 받은 모든 IP 패킷 = 다운로드 총량.',
    'card.ratio': '업로드 / 다운로드', 'card.ratio.sub': '1 : {n}',
    'card.ratio.tip': '일반 사용은 보통 10% 미만입니다. 50% 이상이 지속되면 업로드가 많은 상태입니다.',
    'card.payload': '애플리케이션 업로드', 'card.payload.sub': 'ACK와 헤더를 제외한 실제 데이터',
    'card.payload.tip': '대용량 전송이나 라이브 방송에서만 커집니다. TCP ACK는 제외됩니다.',
    'card.peak': '업로드 최고치 (1초)', 'card.peak.sub': '1초 최고 · 다운로드 {down} Mbps',
    'card.peak.tip': '1초 구간 최대 업로드 속도.',
    'card.remotes': '원격 IP', 'card.remotes.sub': '중복 제거 후 {packets} 패킷',
    'card.remotes.tip': '연결한 서버의 수.',
    'card.duration': '시간', 'card.duration.sub': '중복 패킷 {dup}개 병합',
    'card.duration.tip': '캡처 구간. 중복은 캡처 방식 때문이며 자동 병합됩니다.',

    'verdict.ok.title': '비정상 업로드가 발견되지 않았습니다',
    'verdict.ok.desc': '업로드 비율, 단일 연결 전송량, 연결 대상 수, 인바운드 연결이 모두 정상 범위입니다. 자세한 내용은 "점검" 탭에서.',
    'verdict.warn.title': '주의할 항목 1개: {label}',
    'verdict.warn.desc': '{value} — "점검"에서 의미를 확인하세요. 원격/스트리밍 프로그램이 있으면 정상일 수 있습니다.',
    'verdict.bad.title': '주의할 항목 {n}개',
    'verdict.bad.desc': '{list}. "점검" 탭에서 하나씩 확인하세요.',

    'tab.overview': '개요', 'tab.checks': '점검', 'tab.procs': '프로세스',
    'tab.remotes': '원격 IP', 'tab.domains': '도메인', 'tab.flows': '연결 목록',
    'tab.help': '사용법', 'tab.settings': '설정',

    'ov.chart': '트래픽 타임라인', 'ov.chartHint': '가로축은 캡처 시작 후 초. 곡선 위에 마우스를 올리면 값이 따라옵니다.',
    'ov.topUp': '업로드가 많은 연결', 'ov.topDown': '다운로드가 많은 대상',
    'legend.down': '다운로드(왼쪽)', 'legend.up': '업로드(오른쪽)',
    'legend.downShort': '다운로드', 'legend.upShort': '업로드',

    'checks.intro': '아래 7개 항목은 흔한 "비정상 트래픽" 특징입니다. 초록 = 미검출, 노랑 = 특징 발견(정상일 수도 있음).',
    'checks.footer': '기준: 업로드 >2 Mbps 이고 다운로드의 20% 초과 / 단일 연결 >20 MB / 한 프로세스가 20개 이상 대상에 300 KB 초과 / 공인 IP의 SYN / UDP 10개 이상 대상 각 20 KB 초과. web/core.js에서 수정 가능.',

    'check.up_rate.label': '지속 업로드 속도',
    'check.up_rate.plain': '전체 업로드 속도. 일반 사용에서는 다운로드의 수십 분의 1 수준입니다.',
    'check.up_rate.thr': '> 2 Mbps 이고 다운로드의 20% 초과',
    'check.up_rate.detail': '평균 업로드 {up} Mbps, 다운로드 {down} Mbps',

    'check.max_flow_up.label': '단일 연결 최대 업로드',
    'check.max_flow_up.plain': '한 연결이 유난히 많이 보내는지(백그라운드 전송, 사진 백업 등).',
    'check.max_flow_up.thr': '> 20 MB 또는 >2 MB 이고 업로드의 30% 초과',
    'check.max_flow.detail': '{proc} → {server}{domain}',

    'check.fanout.label': '다수 대상 업로드 (PCDN 특징)',
    'check.fanout.plain': '여러 낯선 IP로 동시에 보내는지. PCDN의 가장 대표적인 특징입니다.',
    'check.fanout.thr': '한 프로세스 >20개 대상 그리고 >300 KB',
    'check.fanout.value': '{proc} → {n}개 대상',
    'check.fanout.detail': '{proc}가 {up}를 {n}개 대상에 전송',

    'check.inbound.label': '공인망에서 들어온 연결',
    'check.inbound.plain': '외부에서 먼저 접속해 오는지. 포트 노출이나 스캔을 의미합니다.',
    'check.inbound.thr': '공인 주소의 SYN',
    'check.inbound.value': '{n}개',
    'check.inbound.detailEmpty': '공인 호스트의 접속 없음',

    'check.udp_fanout.label': '다수 IP로의 UDP',
    'check.udp_fanout.plain': 'UDP를 여러 IP로 보내는지. P2P/PCDN에서 흔합니다.',
    'check.udp_fanout.thr': '>10개 대상 각 >20 KB',
    'check.udp_fanout.value': '{n}개 대상',
    'check.udp_fanout.detailEmpty': 'UDP 트래픽이 거의 없음',

    'check.unknown_proc.label': '프로세스 미확인 업로드',
    'check.unknown_proc.plain': '프로그램에 매핑되지 않은 업로드량(적을수록 좋음).',
    'check.unknown_proc.thr': '> 1 MB 이고 업로드의 10% 초과',
    'check.unknown_proc.value': '{size}',
    'check.unknown_proc.detail': '업로드의 {pct}%',

    'check.peak_up.label': '업로드 최고치 (1초)',
    'check.peak_up.plain': '순간 최대 업로드 속도. 대용량 전송 시 치솟습니다.',
    'check.peak_up.thr': '> 10 Mbps는 순간 폭주로 간주',
    'check.peak_up.value': '{mbps} Mbps',
    'check.none': '없음',

    'th.process': '프로세스', 'th.remote': '원격', 'th.up': '업로드', 'th.down': '다운로드',
    'th.total': '합계', 'th.payload': '실데이터', 'th.flows': '연결 수', 'th.remotes': '대상 수',
    'th.domains': '도메인', 'th.proto': '프로토콜', 'th.local': '로컬', 'th.packets': '패킷',
    'th.domain': '도메인', 'th.name': '이름(DNS/SNI)',

    'procs.intro': '프로그램별: 얼마나 보냈고 몇 개 대상과 통신했는지.',
    'remotes.intro': '원격 IP별: 트래픽이 어디로 갔는지.',
    'domains.intro': 'TLS SNI / DNS / HTTP Host에서 복원한 도메인(HTTPS 본문은 암호화됨).',
    'flows.filter': '필터: 프로세스 / IP / 포트 / 도메인',
    'flows.count': '{shown} / {total}개 표시(트래픽 순, 최대 3000개)',
    'flows.empty': '데이터 없음',

    'settings.ips.title': '로컬 IP',
    'settings.ips.desc': '업로드/다운로드 판별에 사용. 비우면 자동 추정, 여러 개는 쉼표로 구분.',
    'settings.ips.btn': '이 IP로 다시 분석',
    'settings.ips.note': '(파일을 다시 끌어다 놓아야 적용)',
    'settings.about.title': '정보',
    'settings.about.body': 'NetLens는 완전 오프라인입니다. 분석은 브라우저에서 수행되며 아무것도 전송하지 않습니다.<br>중복 제거: pktmon은 같은 패킷을 여러 드라이버 계층에서 기록하므로 5-튜플 + 시퀀스 + 페이로드 지문 + 3ms로 병합합니다.<br>바이트는 IP 패킷 길이(이더넷 헤더 제외), "실데이터"는 TCP/IP 헤더와 순수 ACK를 제외한 값입니다.',

    'file.info': '{name} · {size} · {packets}개 패킷 · 분석 {sec}초',
    'file.localIps': '로컬 IP: {ips}',
    'file.localIpsMore': '{ips} 외 {n}개',
    'file.localIpsNone': '미검출',

    'toast.noFile': '먼저 캡처를 불러오세요',
    'toast.parseFail': '분석 실패: {msg}',
    'toast.captureDone': '캡처 완료',
    'toast.captureFail': '캡처 실패: {msg}',
    'toast.serverFail': '로컬 서비스에 연결할 수 없습니다. NetLens.cmd로 실행하세요',
    'toast.needCmd': '파일로 열면 캡처할 수 없습니다. NetLens.cmd로 실행하세요',
    'toast.loadFail': '로컬 서비스를 읽을 수 없습니다: {msg} (파일을 끌어다 놓아도 됩니다)',
    'toast.captureEmpty': '캡처가 없습니다. 위의 "캡처 시작"을 누르세요',
    'toast.reanalyze': '새 IP 설정을 적용하려면 파일을 다시 끌어다 놓으세요',
    'confirm.capture': '180초간 캡처합니다(관리자 권한 필요).\n\n캡처 중에는 평소처럼 사용하고 검은 창을 닫지 마세요.\n\n시작할까요?',
    'overlay.reading': '파일 읽는 중 {pct}% ({loaded} / {total} MB)',
    'overlay.downloading': '캡처 내려받는 중 {pct}% ({loaded} / {total} MB)',
    'overlay.analyzing': '분석 중 {pct}%',
    'overlay.connecting': '로컬 서비스 연결 중…',
    'overlay.parse': '{name} 분석 중 …',
    'overlay.capture': '캡처 중 {pct}% · {msg}',

    'time.min': '{m}분 {s}초',
    'time.sec': '{s}초',
    'demo.name': '예시 데이터(실제 캡처 아님)',
    'demo.warn': '내장 예시 데이터입니다. "캡처 열기"로 본인의 pcapng를 불러오세요.',

    'export.reportTitle': '네트워크 트래픽 보고서 (NetLens)',
    'export.file': '파일',
    'export.duration': '시간',
    'export.localIps': '로컬 IP',
    'export.total': '합계',
    'export.checks': '점검',
    'export.procs': '프로세스',
    'export.flows': '업로드 상위 연결',
    'export.remotes': '다운로드 상위 대상',
    'export.dir': '방향', 'export.mbps': '속도', 'export.result': '결과', 'export.value': '측정값',
    'export.threshold': '기준', 'export.ok': '정상', 'export.warn': '주의',

    'help.html':
      '<h2>3단계 사용법</h2><div class="steps">' +
      '<div class="step"><div class="num">1</div><div class="txt"><b>캡처</b> — <code>NetLens.cmd</code>를 더블클릭하고 UAC를 허용한 뒤 3분 기다립니다.' +
      '<small>Wireshark가 필요 없습니다. Windows 기본 pktmon을 사용합니다.</small></div></div>' +
      '<div class="step"><div class="num">2</div><div class="txt"><b>결론 확인</b> — 상단 배너가 이상 여부를 알려줍니다.' +
      '<small>초록 = 문제 없음, 노랑 = 주의. "점검"에서 자세히 확인하세요.</small></div></div>' +
      '<div class="step"><div class="num">3</div><div class="txt"><b>상세 보기</b> — "프로세스"에서 많이 보낸 앱, "연결 목록"에서 개별 연결.' +
      '<small>Markdown / CSV / JSON으로 저장할 수 있습니다.</small></div></div></div>' +
      '<h2>숫자의 의미</h2><ul>' +
      '<li><b>업로드 / 다운로드</b>: 보내고 받은 데이터량. 일반 회선은 다운로드가 훨씬 큽니다.</li>' +
      '<li><b>애플리케이션 업로드</b>: TCP ACK와 헤더를 제외한 실제 전송량. 몰래 업로드 판단에 사용합니다.</li>' +
      '<li><b>원격 IP</b>: 연결한 서버. "도메인" 열은 확인된 경우의 이름입니다.</li>' +
      '<li><b>업로드 최고치</b>: 1초 최대 속도. PCDN은 수 Mbps를 오래 유지하는 경향이 있습니다.</li></ul>' +
      '<h2>비정상 기준</h2><ul>' +
      '<li>보내는 것이 없는데 업로드가 계속 2 Mbps 이상;</li>' +
      '<li>모르는 프로세스가 수십 개의 낯선 IP로 전송(PCDN의 전형);</li>' +
      '<li>공인 IP가 먼저 접속(포트 노출 또는 스캔);</li>' +
      '<li>업로드가 다운로드보다 크고 지속됨.</li></ul>' +
      '<h2>자주 묻는 질문</h2><ul>' +
      '<li><b>"액세스 거부"</b>: 관리자 권한이 없습니다. <code>NetLens.cmd</code>로 실행하세요.</li>' +
      '<li><b>트래픽이 적음</b>: 3분간 PC가 거의 유휴 상태였습니다. 의심되는 상황에서 다시 캡처하세요.</li>' +
      '<li><b>사이트 이름이 안 보임</b>: HTTPS는 암호화되고 프록시(Clash 등)를 쓰면 대상도 숨겨집니다.</li>' +
      '<li><b>다른 PC도 캡처되나요?</b> 아니요, 이 PC만 됩니다.</li>' +
      '<li><b>데이터가 전송되나요?</b> 아니요. 분석은 브라우저에서 끝납니다.</li></ul>'
  };

  var pt = {
    'app.title': 'NetLens · Analisador de tráfego local',
    'app.tagline': 'análise de tráfego local',
    'btn.recapture': 'Capturar novamente',
    'btn.open': 'Abrir captura',
    'btn.export': 'Exportar ▾',
    'export.md': 'Relatório Markdown',
    'export.csv': 'Conexões em CSV',
    'export.json': 'Dados JSON',

    'hero.title': 'Veja o que o seu PC está enviando sem você saber',
    'hero.sub1': 'Capture 3 minutos de tráfego e veja qual programa conectou aonde e quanto enviou,',
    'hero.sub2': 'com verificação automática de PCDN, uploads escondidos e varreduras externas.',
    'w1.tag': 'OPÇÃO 1', 'w1.title': 'Capturar agora (recomendado)',
    'w1.desc': 'Captura 3 minutos e abre o resultado. Precisa de administrador (um aviso do UAC).', 'w1.btn': 'Iniciar captura',
    'w2.tag': 'OPÇÃO 2', 'w2.title': 'Abrir um arquivo existente',
    'w2.desc': 'Analisa .pcapng / .pcap gerados pelo Wireshark ou tcpdump.', 'w2.btn': 'Escolher arquivo',
    'w3.tag': 'OPÇÃO 3', 'w3.title': 'Ver um exemplo',
    'w3.desc': 'Sem capturar: abra um exemplo e veja o tipo de conclusão que a ferramenta dá.', 'w3.btn': 'Ver exemplo',
    'drop.hint': 'Você também pode arrastar um arquivo de captura para cá · tudo é analisado localmente',
    'drop.captureHint': 'Esta página foi aberta como arquivo, então não é possível capturar. Use o NetLens.cmd.',

    'card.up': 'Upload', 'card.up.sub': 'dados enviados · {mbps} Mbps',
    'card.up.tip': 'Todos os pacotes IP enviados por este PC — o total de upload.',
    'card.down': 'Download', 'card.down.sub': 'dados recebidos · {mbps} Mbps',
    'card.down.tip': 'Todos os pacotes IP recebidos — o total de download.',
    'card.ratio': 'Upload / download', 'card.ratio.sub': '1 : {n}',
    'card.ratio.tip': 'Navegação normal fica abaixo de 10%. Acima de 50% por muito tempo indica envio constante.',
    'card.payload': 'Upload de aplicação', 'card.payload.sub': 'conteúdo real, sem ACKs e cabeçalhos',
    'card.payload.tip': 'Só cresce com envio de arquivos grandes ou transmissão ao vivo; ACKs não contam.',
    'card.peak': 'Pico de upload (1s)', 'card.peak.sub': 'pico de 1s · download {down} Mbps',
    'card.peak.tip': 'Maior velocidade de upload em qualquer janela de 1 segundo.',
    'card.remotes': 'IPs remotos', 'card.remotes.sub': '{packets} pacotes após remover duplicados',
    'card.remotes.tip': 'Quantos servidores diferentes este PC acessou.',
    'card.duration': 'Duração', 'card.duration.sub': '{dup} pacotes duplicados mesclados',
    'card.duration.tip': 'Período da captura; duplicados vêm do driver e foram mesclados.',

    'verdict.ok.title': 'Nenhum upload anormal encontrado',
    'verdict.ok.desc': 'Proporção de upload, maior conexão, número de destinos e conexões de entrada estão normais. Veja "Verificações" para detalhes.',
    'verdict.warn.title': '1 item para observar: {label}',
    'verdict.warn.desc': '{value} — abra "Verificações" para entender. Se você usa acesso remoto/streaming, pode ser normal.',
    'verdict.bad.title': '{n} itens para observar',
    'verdict.bad.desc': '{list}. Abra "Verificações" para revisar um por um.',

    'tab.overview': 'Visão geral', 'tab.checks': 'Verificações', 'tab.procs': 'Processos',
    'tab.remotes': 'IPs remotos', 'tab.domains': 'Domínios', 'tab.flows': 'Conexões',
    'tab.help': 'Ajuda', 'tab.settings': 'Configurações',

    'ov.chart': 'Linha do tempo do tráfego', 'ov.chartHint': 'O eixo X é o tempo em segundos; passe o mouse sobre a curva e os valores seguem o ponteiro.',
    'ov.topUp': 'Maiores uploads', 'ov.topDown': 'Maiores downloads',
    'legend.down': 'Download (esquerda)', 'legend.up': 'Upload (direita)',
    'legend.downShort': 'Download', 'legend.upShort': 'Upload',

    'checks.intro': 'As 7 verificações cobrem padrões comuns de "tráfego anormal". Verde = não disparou; âmbar = o padrão apareceu e você decide se é legítimo.',
    'checks.footer': 'Limites: upload >2 Mbps e >20% do download; conexão única >20 MB; um processo com ≥20 destinos e >300 KB; qualquer SYN público; UDP >10 destinos com >20 KB cada. Edite em web/core.js.',

    'check.up_rate.label': 'Taxa de upload sustentada',
    'check.up_rate.plain': 'Quão rápido você envia no total. Navegar normalmente envia uma fração pequena do download.',
    'check.up_rate.thr': '> 2 Mbps e >20% do download',
    'check.up_rate.detail': 'Média upload {up} Mbps, download {down} Mbps',

    'check.max_flow_up.label': 'Maior upload de uma conexão',
    'check.max_flow_up.plain': 'Se alguma conexão enviou muito — backup de fotos ou envio de arquivo em segundo plano.',
    'check.max_flow_up.thr': '> 20 MB, ou >2 MB e >30% do upload',
    'check.max_flow.detail': '{proc} → {server}{domain}',

    'check.fanout.label': 'Upload para muitos destinos (PCDN)',
    'check.fanout.plain': 'Se algo envia para muitos IPs desconhecidos ao mesmo tempo — a assinatura clássica de PCDN.',
    'check.fanout.thr': 'um processo com >20 destinos e >300 KB',
    'check.fanout.value': '{proc} → {n} destinos',
    'check.fanout.detail': '{proc} enviou {up} para {n} destinos',

    'check.inbound.label': 'Conexões vindas da internet',
    'check.inbound.plain': 'Se hosts públicos se conectaram a você. Indica porta exposta ou varredura.',
    'check.inbound.thr': 'qualquer SYN de endereço público',
    'check.inbound.value': '{n} origens',
    'check.inbound.detailEmpty': 'Nenhum host público conectou',

    'check.udp_fanout.label': 'UDP para muitos IPs',
    'check.udp_fanout.plain': 'Se UDP é enviado para muitos IPs — técnica comum de P2P/PCDN.',
    'check.udp_fanout.thr': '>10 destinos com >20 KB cada',
    'check.udp_fanout.value': '{n} destinos',
    'check.udp_fanout.detailEmpty': 'Muito pouco tráfego UDP',

    'check.unknown_proc.label': 'Upload sem processo identificado',
    'check.unknown_proc.plain': 'Quanto do upload não pôde ser associado a um programa (quanto menor, melhor).',
    'check.unknown_proc.thr': '> 1 MB e >10% do upload',
    'check.unknown_proc.value': '{size}',
    'check.unknown_proc.detail': '{pct}% do upload',

    'check.peak_up.label': 'Pico de upload (1 segundo)',
    'check.peak_up.plain': 'Maior velocidade instantânea; sobe ao enviar arquivos grandes.',
    'check.peak_up.thr': '> 10 Mbps é considerado rajada',
    'check.peak_up.value': '{mbps} Mbps',
    'check.none': 'nenhum',

    'th.process': 'Processo', 'th.remote': 'Remoto', 'th.up': 'Upload', 'th.down': 'Download',
    'th.total': 'Total', 'th.payload': 'Payload', 'th.flows': 'Conexões', 'th.remotes': 'Destinos',
    'th.domains': 'Domínios', 'th.proto': 'Proto', 'th.local': 'Local', 'th.packets': 'Pacotes',
    'th.domain': 'Domínio', 'th.name': 'Nome (DNS/SNI)',

    'procs.intro': 'Por programa: quanto enviou e quantos destinos acessou.',
    'remotes.intro': 'Por IP remoto: para onde o tráfego foi.',
    'domains.intro': 'Domínios recuperados de TLS SNI / DNS / HTTP Host (HTTPS é criptografado).',
    'flows.filter': 'Filtrar: processo / IP / porta / domínio',
    'flows.count': 'Mostrando {shown} / {total} conexões (por tráfego, até 3000)',
    'flows.empty': 'Sem dados',

    'settings.ips.title': 'IPs locais',
    'settings.ips.desc': 'Usados para separar upload e download. Vazio = detecção automática; separe por vírgulas.',
    'settings.ips.btn': 'Reanalisar com estes IPs',
    'settings.ips.note': '(arraste o arquivo novamente para aplicar)',
    'settings.about.title': 'Sobre',
    'settings.about.body': 'O NetLens é totalmente offline: a análise ocorre no navegador, nada é enviado.<br>Deduplicação: o pktmon registra o mesmo quadro em várias camadas; o NetLens mescla por 5-tupla + sequência + impressão do payload + janela de 3 ms.<br>Os bytes são do pacote IP (sem cabeçalho Ethernet); "payload" exclui cabeçalhos TCP/IP e ACKs puros.',

    'file.info': '{name} · {size} · {packets} pacotes · analisado em {sec}s',
    'file.localIps': 'IPs locais: {ips}',
    'file.localIpsMore': '{ips} e mais {n}',
    'file.localIpsNone': 'não detectado',

    'toast.noFile': 'Carregue uma captura primeiro',
    'toast.parseFail': 'Falha ao analisar: {msg}',
    'toast.captureDone': 'Captura concluída',
    'toast.captureFail': 'Falha na captura: {msg}',
    'toast.serverFail': 'Não foi possível falar com o serviço local — inicie pelo NetLens.cmd',
    'toast.needCmd': 'A captura exige o NetLens.cmd; esta página foi aberta como arquivo',
    'toast.loadFail': 'Não foi possível ler o serviço local: {msg} (arraste um arquivo)',
    'toast.captureEmpty': 'Ainda não há captura — clique em "Iniciar captura"',
    'toast.reanalyze': 'Arraste o arquivo novamente para aplicar os IPs',
    'confirm.capture': 'Capturar 180 segundos de tráfego (requer administrador).\n\nUse o PC normalmente e não feche a janela preta.\n\nComeçar?',
    'overlay.reading': 'Lendo arquivo {pct}% ({loaded} / {total} MB)',
    'overlay.downloading': 'Baixando captura {pct}% ({loaded} / {total} MB)',
    'overlay.analyzing': 'Analisando {pct}%',
    'overlay.connecting': 'Conectando ao serviço local…',
    'overlay.parse': 'Analisando {name} …',
    'overlay.capture': 'Capturando {pct}% · {msg}',

    'time.min': '{m}m {s}s',
    'time.sec': '{s}s',
    'demo.name': 'Dados de exemplo (não é uma captura real)',
    'demo.warn': 'Estes são dados de exemplo. Use "Abrir captura" para carregar seu pcapng.',

    'export.reportTitle': 'Relatório de tráfego de rede (NetLens)',
    'export.file': 'Arquivo',
    'export.duration': 'Duração',
    'export.localIps': 'IPs locais',
    'export.total': 'Totais',
    'export.checks': 'Verificações',
    'export.procs': 'Processos',
    'export.flows': 'Maiores uploads',
    'export.remotes': 'Maiores downloads',
    'export.dir': 'Direção', 'export.mbps': 'Taxa', 'export.result': 'Resultado', 'export.value': 'Valor',
    'export.threshold': 'Limite', 'export.ok': 'OK', 'export.warn': 'Atenção',

    'help.html':
      '<h2>Três passos</h2><div class="steps">' +
      '<div class="step"><div class="num">1</div><div class="txt"><b>Capturar</b> — clique duas vezes em <code>NetLens.cmd</code>, aceite o UAC e espere 3 minutos.' +
      '<small>Não precisa de Wireshark: usa o pktmon nativo do Windows.</small></div></div>' +
      '<div class="step"><div class="num">2</div><div class="txt"><b>Ler o veredito</b> — o banner no topo diz se algo pareceu errado.' +
      '<small>Verde = nada encontrado; âmbar = um padrão apareceu, abra "Verificações".</small></div></div>' +
      '<div class="step"><div class="num">3</div><div class="txt"><b>Detalhar</b> — "Processos" mostra quem enviou mais; "Conexões" lista cada fluxo.' +
      '<small>Exporte em Markdown / CSV / JSON.</small></div></div></div>' +
      '<h2>O que os números significam</h2><ul>' +
      '<li><b>Upload / download</b>: total enviado e recebido. Conexões domésticas baixam muito mais.</li>' +
      '<li><b>Upload de aplicação</b>: conteúdo real sem ACKs e cabeçalhos. É o que importa para upload escondido.</li>' +
      '<li><b>IPs remotos</b>: servidores acessados; a coluna domínio mostra o nome quando possível.</li>' +
      '<li><b>Pico de upload</b>: maior velocidade em 1s. PCDN costuma ficar em vários Mbps por muito tempo.</li></ul>' +
      '<h2>O que é anormal</h2><ul>' +
      '<li>Nada sendo enviado, mas upload acima de 2 Mbps;</li>' +
      '<li>Um processo desconhecido enviando para dezenas de IPs desconhecidos (PCDN clássico);</li>' +
      '<li>IPs públicos conectando para dentro (serviço exposto ou varredura);</li>' +
      '<li>Upload muito maior que download, de forma contínua.</li></ul>' +
      '<h2>Perguntas frequentes</h2><ul>' +
      '<li><b>"Acesso negado"</b>: sem administrador. Inicie pelo <code>NetLens.cmd</code>; analisar arquivo não exige.</li>' +
      '<li><b>Pouco tráfego capturado</b>: o PC ficou ocioso nesses 3 minutos — normal. Capture novamente com o app suspeito aberto.</li>' +
      '<li><b>Não vejo nomes de sites</b>: HTTPS é criptografado e um proxy (Clash etc.) esconde o destino; só o IP do proxy aparece.</li>' +
      '<li><b>Dá para capturar outro PC?</b> Não, apenas esta máquina.</li>' +
      '<li><b>Meus dados são enviados?</b> Não. Tudo é analisado no navegador; a ferramenta não faz requisições externas.</li></ul>'
  };

  var dict = { zh: zh, en: en, ja: ja, ko: ko, pt: pt };

  var extra = {
    zh: { 'file.packets': '{n} 个包', 'file.parsed': '解析 {sec}s', 'toast.badFile': '请选择 .pcapng / .pcap 文件' },
    en: { 'file.packets': '{n} packets', 'file.parsed': 'parsed in {sec}s', 'toast.badFile': 'Choose a .pcapng / .pcap file' },
    ja: { 'file.packets': '{n} パケット', 'file.parsed': '解析 {sec} 秒', 'toast.badFile': '.pcapng / .pcap を選択してください' },
    ko: { 'file.packets': '{n}개 패킷', 'file.parsed': '분석 {sec}초', 'toast.badFile': '.pcapng / .pcap 파일을 선택하세요' },
    pt: { 'file.packets': '{n} pacotes', 'file.parsed': 'analisado em {sec}s', 'toast.badFile': 'Escolha um arquivo .pcapng / .pcap' }
  };
  Object.keys(extra).forEach(function (l) {
    Object.keys(extra[l]).forEach(function (k) { dict[l][k] = extra[l][k]; });
  });

  var extra2 = {
    zh: {
      'btn.cancel': '取消', 'btn.start': '开始',
      'cap.title': '选择抓包方式', 'cap.sub': '抓包时长越长，越容易发现"偶尔才跑"的后台上传',
      'cap.single': '单次抓包', 'cap.series': '定时抽采',
      'cap.duration': '抓多久',
      'cap.custom': '自定义', 'cap.minutes': '分钟',
      'cap.singleHint': '单次抓包适合快速体检。建议抓包时别同时下载大文件，否则背景上传会被淹没。',
      'cap.seriesHint': '每隔一段时间抓一小段，连续多次。适合找"不是一直在传"的软件：出现次数越多越可疑。',
      'cap.estimate': '预计总时长约 {n} 分钟',
      'cap.startBtn': '开始抓包', 'cap.startSeries': '开始抽采',
      'cap.times': '{n} 次', 'cap.timesHint': '次', 'cap.each': '每次 {s}s · 每 {i} 分钟',
      'card.samples': '采样次数', 'card.samples.sub': '共 {sec} 秒有效采样',
      'file.samples': '{n} 次采样 · 共 {size}',
      'th.appear': '出现次数',
      'series.title': '每次采样的结果',
      'series.col.no': '#', 'series.col.time': '时间', 'series.col.up': '上行', 'series.col.down': '下行',
      'series.col.top': '上传最多的程序', 'series.col.topUp': '上传量',
      'series.note': '同一个程序出现次数越多、单次上传越大，越值得怀疑。',
      'verdict.series.ok.title': '{n} 次采样均未发现异常上传',
      'verdict.series.ok.desc': '所有采样里，上行速率、对端数量、入站连接都在正常范围。',
      'verdict.series.warn.title': '{n} 次采样中发现问题：{label}',
      'verdict.series.warn.desc': '{value} —— 点「异常判定」看说明；也可对照下方每次采样的结果。',
      'overlay.sample': '分析样本 {i}/{n} …',
      'toast.captureRunning': '正在抓包，请稍候'
    },
    en: {
      'btn.cancel': 'Cancel', 'btn.start': 'Start',
      'cap.title': 'Choose a capture mode', 'cap.sub': 'Longer captures catch background uploads that only run occasionally',
      'cap.single': 'Single capture', 'cap.series': 'Scheduled samples',
      'cap.duration': 'Duration',
      'cap.custom': 'Custom', 'cap.minutes': 'min',
      'cap.singleHint': 'A single capture is a quick check. Avoid large downloads while capturing, or background uploads get drowned out.',
      'cap.seriesHint': 'Capture a short sample every few minutes. Best for software that only uploads occasionally: the more samples it appears in, the more suspicious.',
      'cap.estimate': 'about {n} minutes in total',
      'cap.startBtn': 'Start capture', 'cap.startSeries': 'Start sampling',
      'cap.times': '{n} samples', 'cap.timesHint': 'samples', 'cap.each': '{s}s each · every {i} min',
      'card.samples': 'Samples', 'card.samples.sub': '{sec}s of captured traffic in total',
      'file.samples': '{n} samples · {size} in total',
      'th.appear': 'Appears in',
      'series.title': 'Per-sample results',
      'series.col.no': '#', 'series.col.time': 'Time', 'series.col.up': 'Up', 'series.col.down': 'Down',
      'series.col.top': 'Top uploader', 'series.col.topUp': 'Uploaded',
      'series.note': 'The more samples a program appears in and the more it uploads each time, the more it deserves a look.',
      'verdict.series.ok.title': 'No abnormal upload in {n} samples',
      'verdict.series.ok.desc': 'Upload rate, peer count and inbound connections stayed normal across every sample.',
      'verdict.series.warn.title': 'Issue found in {n} samples: {label}',
      'verdict.series.warn.desc': '{value} — open "Checks" for details, or compare the per-sample table below.',
      'overlay.sample': 'Analyzing sample {i}/{n} …',
      'toast.captureRunning': 'A capture is already running'
    },
    ja: {
      'btn.cancel': 'キャンセル', 'btn.start': '開始',
      'cap.title': 'キャプチャ方法を選択', 'cap.sub': '長く取るほど「たまに動く」バックグラウンド送信を見つけやすくなります',
      'cap.single': '1 回だけ', 'cap.series': '定期サンプリング',
      'cap.duration': '長さ',
      'cap.custom': 'カスタム', 'cap.minutes': '分',
      'cap.singleHint': '手軽なチェック向け。大きなダウンロードと同時だと、背景の送信が埋もれます。',
      'cap.seriesHint': '数分おきに短く取り、複数回繰り返します。「たまに送る」ソフトの特定に向いています。',
      'cap.estimate': '合計 約 {n} 分',
      'cap.startBtn': 'キャプチャ開始', 'cap.startSeries': 'サンプリング開始',
      'cap.times': '{n} 回', 'cap.timesHint': '回', 'cap.each': '各 {s} 秒 · {i} 分おき',
      'card.samples': 'サンプル数', 'card.samples.sub': '合計 {sec} 秒分',
      'file.samples': '{n} 回のサンプル · 合計 {size}',
      'th.appear': '出現回数',
      'series.title': '各サンプルの結果',
      'series.col.no': '#', 'series.col.time': '時刻', 'series.col.up': '上り', 'series.col.down': '下り',
      'series.col.top': '最多送信', 'series.col.topUp': '送信量',
      'series.note': '出現回数が多く、1 回の送信量が大きいほど疑わしいです。',
      'verdict.series.ok.title': '{n} 回のサンプルで異常なし',
      'verdict.series.ok.desc': 'すべてのサンプルで上り速度・接続先数・受信接続が正常範囲でした。',
      'verdict.series.warn.title': '{n} 回のサンプルで問題：{label}',
      'verdict.series.warn.desc': '{value} — 「チェック」で詳細を、下の表で各サンプルを確認できます。',
      'overlay.sample': 'サンプル {i}/{n} を解析中 …',
      'toast.captureRunning': 'キャプチャ実行中です'
    },
    ko: {
      'btn.cancel': '취소', 'btn.start': '시작',
      'cap.title': '캡처 방식 선택', 'cap.sub': '길게 잡을수록 "가끔만 도는" 백그라운드 업로드를 찾기 쉽습니다',
      'cap.single': '한 번 캡처', 'cap.series': '정기 샘플링',
      'cap.duration': '길이',
      'cap.custom': '직접 입력', 'cap.minutes': '분',
      'cap.singleHint': '간단 점검용. 캡처 중 대용량 다운로드를 하면 백그라운드 업로드가 묻힙니다.',
      'cap.seriesHint': '몇 분마다 짧게 여러 번 캡처합니다. "가끔만 보내는" 프로그램을 찾는 데 적합합니다.',
      'cap.estimate': '총 약 {n}분',
      'cap.startBtn': '캡처 시작', 'cap.startSeries': '샘플링 시작',
      'cap.times': '{n}회', 'cap.timesHint': '회', 'cap.each': '각 {s}초 · {i}분 간격',
      'card.samples': '샘플 수', 'card.samples.sub': '총 {sec}초 분량',
      'file.samples': '{n}회 샘플 · 총 {size}',
      'th.appear': '나타난 횟수',
      'series.title': '샘플별 결과',
      'series.col.no': '#', 'series.col.time': '시간', 'series.col.up': '업로드', 'series.col.down': '다운로드',
      'series.col.top': '최다 업로드', 'series.col.topUp': '업로드량',
      'series.note': '나타난 횟수가 많고 1회 업로드량이 클수록 의심스럽습니다.',
      'verdict.series.ok.title': '{n}회 샘플 모두 이상 없음',
      'verdict.series.ok.desc': '모든 샘플에서 업로드 속도, 대상 수, 인바운드 연결이 정상 범위였습니다.',
      'verdict.series.warn.title': '{n}회 샘플에서 문제: {label}',
      'verdict.series.warn.desc': '{value} — "점검"에서 설명을, 아래 표에서 샘플별 결과를 확인하세요.',
      'overlay.sample': '샘플 {i}/{n} 분석 중 …',
      'toast.captureRunning': '이미 캡처 중입니다'
    },
    pt: {
      'btn.cancel': 'Cancelar', 'btn.start': 'Iniciar',
      'cap.title': 'Escolha o modo de captura', 'cap.sub': 'Capturas mais longas encontram uploads que só rodam de vez em quando',
      'cap.single': 'Captura única', 'cap.series': 'Amostragem agendada',
      'cap.duration': 'Duração',
      'cap.custom': 'Personalizado', 'cap.minutes': 'min',
      'cap.singleHint': 'Uma captura é uma verificação rápida. Evite grandes downloads durante ela, ou o upload de fundo fica mascarado.',
      'cap.seriesHint': 'Captura curta a cada poucos minutos, várias vezes. Ideal para achar programas que só enviam de vez em quando.',
      'cap.estimate': 'cerca de {n} minutos no total',
      'cap.startBtn': 'Iniciar captura', 'cap.startSeries': 'Iniciar amostragem',
      'cap.times': '{n} amostras', 'cap.timesHint': 'amostras', 'cap.each': '{s}s cada · a cada {i} min',
      'card.samples': 'Amostras', 'card.samples.sub': '{sec}s de tráfego no total',
      'file.samples': '{n} amostras · {size} no total',
      'th.appear': 'Aparece em',
      'series.title': 'Resultado por amostra',
      'series.col.no': '#', 'series.col.time': 'Hora', 'series.col.up': 'Upload', 'series.col.down': 'Download',
      'series.col.top': 'Maior upload', 'series.col.topUp': 'Enviado',
      'series.note': 'Quanto mais amostras um programa aparece e maior o envio por amostra, mais suspeito.',
      'verdict.series.ok.title': 'Nenhum upload anormal em {n} amostras',
      'verdict.series.ok.desc': 'Em todas as amostras, taxa de upload, destinos e conexões de entrada ficaram normais.',
      'verdict.series.warn.title': 'Problema em {n} amostras: {label}',
      'verdict.series.warn.desc': '{value} — abra "Verificações" ou compare a tabela por amostra abaixo.',
      'overlay.sample': 'Analisando amostra {i}/{n} …',
      'toast.captureRunning': 'Já existe uma captura em andamento'
    }
  };
  Object.keys(extra2).forEach(function (l) {
    Object.keys(extra2[l]).forEach(function (k) { dict[l][k] = extra2[l][k]; });
  });

  function t(lang, key, vars) {
    var d = dict[lang] || dict.en;
    var s = d[key];
    if (s === undefined) s = dict.en[key];
    if (s === undefined) s = dict.zh[key];
    if (s === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(String(vars[k]));
      });
    }
    return s;
  }

  function detect() {
    var nav = (navigator.language || 'en').toLowerCase();
    if (nav.indexOf('zh') === 0) return 'zh';
    if (nav.indexOf('ja') === 0) return 'ja';
    if (nav.indexOf('ko') === 0) return 'ko';
    if (nav.indexOf('pt') === 0) return 'pt';
    return 'en';
  }

  root.NetLensI18n = { t: t, dict: dict, detect: detect, langs: ['zh', 'en', 'ja', 'ko', 'pt'] };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.NetLensI18n;
})(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this));
