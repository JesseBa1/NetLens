# Code signing policy

Free code signing provided by [SignPath.io](https://about.signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).

## Status

**Paused.** The `NetLens.exe` launcher is not part of the current release (v1.5.2 and later), so
code signing is on hold. The source of the launcher is kept in `src/` for a possible future release.

Until signing is enabled, releases are unsigned; verify downloads with the SHA-256 digest shown on the
GitHub release page (`gh release view vX.Y.Z --json assets`).

## Team roles

Solo maintainer project:

- **Authors / Committers**: [JesseBa1](https://github.com/JesseBa1)
- **Reviewers**: [JesseBa1](https://github.com/JesseBa1)
- **Approvers** (code signing): [JesseBa1](https://github.com/JesseBa1)

All accounts use multi-factor authentication.

## Release process

1. Source lives at <https://github.com/JesseBa1/NetLens>.
2. Every build is produced by GitHub Actions (`.github/workflows/build.yml`, `windows-latest`),
   which runs `build-exe.ps1` (system `csc.exe`) and uploads `NetLens.exe` as a workflow artifact.
3. On release, the CI-built `NetLens.exe` is submitted to SignPath for signing and approved manually
   by the maintainer.
4. The signed binary is packed into `NetLens-vX.Y.Z.zip` together with the PowerShell scripts and the
   static web UI.

## Privacy policy

This program does not transfer any information to other networked systems unless specifically requested
by the user or the person installing or operating it.

- Capture files are written to the local `captures\` folder and never uploaded.
- Analysis runs entirely in the local browser (no external requests, no telemetry).
- The only network listener is a local HTTP server bound to `127.0.0.1`, used to show the UI.

## Scope of signing

Only `NetLens.exe` (the launcher built from `src/NetLensLauncher.cs`) is submitted for signing.
The PowerShell scripts and the web UI are shipped as plain text files in the same archive.
