# Frugal Architect skill installer (Windows)
# Usage: irm https://raw.githubusercontent.com/rabbix07/frugal-architect/main/install.ps1 | iex
# Override target: $env:SKILL_DIR = "C:\custom\path"; irm ... | iex
$ErrorActionPreference = "Stop"

$SkillName = "frugal-architect"
$Repo      = "rabbix07/frugal-architect"
$Branch    = if ($env:BRANCH) { $env:BRANCH } else { "main" }
$SkillUrl  = "https://raw.githubusercontent.com/$Repo/$Branch/skills/$SkillName/SKILL.md"
$SkillDir  = if ($env:SKILL_DIR) { $env:SKILL_DIR } else { Join-Path $HOME ".agents\skills\$SkillName" }

New-Item -ItemType Directory -Force -Path $SkillDir | Out-Null
$Target = Join-Path $SkillDir "SKILL.md"
Invoke-WebRequest -Uri $SkillUrl -OutFile $Target -UseBasicParsing

if (-not (Test-Path $Target) -or (Get-Item $Target).Length -eq 0) {
    throw "download failed or produced an empty file"
}

Write-Host "Installed $SkillName -> $Target"
Write-Host "Restart your agent so it picks up the new skill."
