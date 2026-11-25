# SignPath Foundation 申请材料（草稿）

> 这是给 https://signpath.org/apply 表单用的答案草稿，直接复制粘贴即可。
> 提交需要你本人的邮箱 / GitHub 账号登录，我没法替你完成这一步。

## 表单答案

**Project name**

```
NetLens
```

**Project repository (GitHub URL)**

```
https://github.com/JesseBa1/NetLens
```

**Project website / download page**

```
https://github.com/JesseBa1/NetLens/releases
```

**License**

```
MIT (OSI-approved), no dual licensing
```

**Short description**

```
NetLens is a Windows desktop tool that captures local network traffic with the built-in pktmon
driver and analyzes it in an offline web UI. It shows per-process upload/download volume and runs
seven checks for abnormal uploads: PCDN seeding, hidden background uploads, public inbound
connections, UDP fan-out and unattributed traffic. Everything is parsed locally in the browser;
the tool sends no telemetry and makes no external network requests.
```

**Why do you need code signing?**

```
NetLens ships a small WinForms launcher (NetLens.exe) that starts the capture service and opens
the local UI. The launcher requires administrator rights (pktmon), so it is exactly the kind of
binary users are told to be careful about. Without a signature, SmartScreen shows "Unknown
publisher" and non-technical users are likely to abandon the download or, worse, learn to click
through warnings. A SignPath Foundation signature would show a verified publisher and make the
UAC prompt meaningful.
```

**Build system / how are artifacts produced?**

```
GitHub Actions, windows-latest (.github/workflows/build.yml). The workflow runs build-exe.ps1,
which invokes the system csc.exe (.NET Framework 4.x) on src/NetLensLauncher.cs with
src/app.manifest and assets/netlens.ico, and uploads the resulting NetLens.exe as a build
artifact. No prebuilt binaries are checked in as release inputs; the exe is rebuilt from source
for every release.
```

**Release process**

```
1. Maintainer tags vX.Y.Z.
2. GitHub Actions rebuilds NetLens.exe from source and uploads it as an artifact.
3. The artifact is submitted to SignPath for signing and approved manually.
4. The signed exe is packed into NetLens-vX.Y.Z.zip together with the PowerShell scripts and the
   static web UI, then attached to the GitHub release.
```

**Project maintainer**

```
JesseBa1 (sole maintainer) — https://github.com/JesseBa1
MFA is enabled on the GitHub account.
```

**Code signing policy URL**

```
https://github.com/JesseBa1/NetLens/blob/main/CODE_SIGNING.md
```

**Privacy policy**

```
The program does not transfer any information to other networked systems unless specifically
requested by the user or the person installing or operating it. Capture files are written to a
local folder and never uploaded; analysis runs in the local browser; the only listener is a
local HTTP server bound to 127.0.0.1.
```

## 提交前 checklist

- [x] 公开仓库，MIT 许可，无商业双许可
- [x] 已有正式 release（v1.5.1）
- [x] README 有功能说明、下载方式、截图
- [x] `CODE_SIGNING.md` 含政策、角色、隐私说明
- [x] GitHub Actions 可从源码构建 exe（可追溯）
- [x] exe 有 ProductName / FileVersion / CompanyName 元数据
- [x] 维护者开启 GitHub 2FA（请在 GitHub 设置里确认）
- [ ] 提交申请（需要你登录 signpath.org）

## 可能被拒的点

SignPath 明确说会对**项目声誉**做初步审核，新建、几乎没人用的仓库有较大概率被拒。如果被拒，
可以：

1. 过一段时间、有真实用户和下载量后再申请
2. 用自签名证书 + 发布 SHA-256（本仓库可以以后加 `sign-exe.ps1`）
3. 购买 OV/EV 证书
