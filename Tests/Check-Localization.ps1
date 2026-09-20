<#
.SYNOPSIS
    Checks that every player-facing text of this mod resolves in English and French,
    and that the hidden MainButtons shortcut is declared the way MOD_SETTINGS.md asks.

.DESCRIPTION
    Nothing here starts RimWorld. The checks read the source and the shipped XML:

      - every "TailorMadeWaistlines.*" key the source translates exists in
        Languages/English/Keyed and Languages/French/Keyed, non-empty;
      - neither language holds a key the source never uses, or a duplicate;
      - both languages carry the same {0} placeholders, and the slider labels
        that receive a value do carry {0};
      - no sentence-like string literal is left in the settings code outside
        the keys (the mod's own name, "TailorMade Waistlines", is a proper
        noun and is the one allowed exception);
      - the MainButtonDef exists, is hidden by default (buttonVisible false),
        names a worker class that exists in the shipped assembly, and every
        French DefInjected key resolves to a field of that def.

    The DefInjected path check itself is scripts\Check-DefInjected.ps1, run
    beside this one.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File Tests\Check-Localization.ps1
#>

[CmdletBinding()]
param(
    [string]$Root,
    # The game's assemblies, so the worker class's base type resolves when the assembly is inspected.
    [string]$Managed = 'C:\Program Files (x86)\Steam\steamapps\common\RimWorld\RimWorldWin64_Data\Managed'
)

$ErrorActionPreference = 'Stop'
if (-not $Root) { $Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path) }
$script:failures = @()
$script:checks = 0

function Assert-That {
    param([string]$What, [bool]$Ok, [string]$Detail)
    $script:checks++
    if ($Ok) { Write-Host ("  ok    " + $What) }
    else {
        $script:failures += $What + $(if ($Detail) { " - " + $Detail } else { "" })
        Write-Host ("  FAIL  " + $What + $(if ($Detail) { " - " + $Detail } else { "" }))
    }
}

function Read-Keyed {
    param([string]$Path)
    $keys = [ordered]@{}
    $dupes = @()
    [xml]$xml = Get-Content -Raw -Encoding UTF8 $Path
    foreach ($node in $xml.LanguageData.ChildNodes) {
        if ($node.NodeType -ne 'Element') { continue }
        if ($keys.Contains($node.Name)) { $dupes += $node.Name }
        $keys[$node.Name] = $node.InnerText
    }
    return @{ Keys = $keys; Dupes = $dupes }
}

$mod = Join-Path $Root 'Mod'
$src = Join-Path $Root 'Source\TailorMadeWaistlines'

# --- keys used by the source --------------------------------------------------
Write-Host ""
Write-Host "keys used by the source"
$used = @{}
foreach ($file in Get-ChildItem $src -Filter *.cs) {
    $text = Get-Content -Raw -Encoding UTF8 $file.FullName
    foreach ($m in [regex]::Matches($text, '"(TailorMadeWaistlines\.[A-Za-z0-9_.]+)"')) { $used[$m.Groups[1].Value] = $true }
}
Assert-That ("the source uses " + $used.Count + " keys") ($used.Count -gt 0)

$en = Read-Keyed (Join-Path $mod 'Languages\English\Keyed\TailorMadeWaistlines.xml')
$fr = Read-Keyed (Join-Path $mod 'Languages\French\Keyed\TailorMadeWaistlines.xml')

Write-Host ""
Write-Host "coverage"
foreach ($lang in @(@('English', $en), @('French', $fr))) {
    $name = $lang[0]; $data = $lang[1]
    Assert-That ("$name has no duplicate key") ($data.Dupes.Count -eq 0) ($data.Dupes -join ', ')
    $missing = @($used.Keys | Where-Object { -not $data.Keys.Contains($_) })
    Assert-That ("$name defines every key the source uses") ($missing.Count -eq 0) ($missing -join ', ')
    $empty = @($data.Keys.Keys | Where-Object { [string]::IsNullOrWhiteSpace($data.Keys[$_]) })
    Assert-That ("$name has no empty text") ($empty.Count -eq 0) ($empty -join ', ')
    $extra = @($data.Keys.Keys | Where-Object { -not $used.ContainsKey($_) })
    Assert-That ("$name holds no key the source never uses") ($extra.Count -eq 0) ($extra -join ', ')
}
$same = @($en.Keys.Keys | Where-Object { $fr.Keys.Contains($_) -and $fr.Keys[$_] -ceq $en.Keys[$_] })
Assert-That "no French text is left identical to its English source" ($same.Count -eq 0) ($same -join ', ')

# --- placeholders -------------------------------------------------------------
Write-Host ""
Write-Host "placeholders"
function Get-Placeholders([string]$s) { @([regex]::Matches($s, '\{[0-9A-Za-z_]+\}') | ForEach-Object { $_.Value } | Sort-Object -Unique) }
foreach ($key in $en.Keys.Keys) {
    if (-not $fr.Keys.Contains($key)) { continue }
    $a = (Get-Placeholders $en.Keys[$key]) -join ','
    $b = (Get-Placeholders $fr.Keys[$key]) -join ','
    Assert-That ("$key has the same placeholders in both languages") ($a -eq $b) "en [$a] fr [$b]"
}
foreach ($key in @('PantsTop', 'BootsTop', 'ChestBottom')) {
    $full = "TailorMadeWaistlines.Settings.$key"
    Assert-That ("$full receives the slider value ({0})") ($en.Keys[$full] -match '\{0\}' -and $fr.Keys[$full] -match '\{0\}')
}

# --- no sentence left in code -------------------------------------------------
Write-Host ""
Write-Host "no hardcoded sentence in the settings code"
$allowed = @('TailorMade Waistlines')
foreach ($name in @('TailorMadeWaistlinesMod.cs', 'MainButtonWorker_TailorMadeWaistlines.cs')) {
    $text = Get-Content -Raw -Encoding UTF8 (Join-Path $src $name)
    $text = [regex]::Replace($text, '(?m)^\s*//.*$', '')
    $text = [regex]::Replace($text, '/\*[\s\S]*?\*/', '')
    $sentences = @([regex]::Matches($text, '"([^"\\]*)"') | ForEach-Object { $_.Groups[1].Value } |
        Where-Object { $_ -match '\s' -and $allowed -notcontains $_ })
    Assert-That ("$name holds no string literal that reads as text") ($sentences.Count -eq 0) ($sentences -join ' | ')
}

# --- the hidden shortcut ------------------------------------------------------
Write-Host ""
Write-Host "the MainButtons shortcut"
$defPath = Join-Path $mod 'Defs\MainButtonDefs\MainButtons.xml'
Assert-That 'the MainButtonDef file exists' (Test-Path $defPath)
if (Test-Path $defPath) {
    [xml]$defs = Get-Content -Raw -Encoding UTF8 $defPath
    $def = $defs.Defs.MainButtonDef
    Assert-That 'one MainButtonDef is declared' (@($def).Count -eq 1)
    Assert-That '  it is hidden by default (buttonVisible false)' ($def.buttonVisible -eq 'false')
    Assert-That '  it is valid without a map' ($def.validWithoutMap -eq 'true')
    $resolver = [System.ResolveEventHandler] {
        param($sender, $e)
        $n = (New-Object System.Reflection.AssemblyName($e.Name)).Name
        foreach ($dir in @($Managed, (Join-Path $mod 'Assemblies'))) {
            $c = Join-Path $dir ($n + '.dll')
            if (Test-Path $c) { return [System.Reflection.Assembly]::LoadFrom($c) }
        }
        return $null
    }
    [System.AppDomain]::CurrentDomain.add_AssemblyResolve($resolver)
    $asm = [System.Reflection.Assembly]::LoadFrom((Join-Path $mod 'Assemblies\TailorMadeWaistlines.dll'))
    $worker = $asm.GetType($def.workerClass, $false)
    Assert-That ('  its worker class exists in the assembly: ' + $def.workerClass) ($null -ne $worker)
    [System.AppDomain]::CurrentDomain.remove_AssemblyResolve($resolver)

    $inj = Join-Path $mod 'Languages\French\DefInjected\MainButtonDef\MainButtons.xml'
    Assert-That 'the French DefInjected file exists' (Test-Path $inj)
    if (Test-Path $inj) {
        [xml]$fx = Get-Content -Raw -Encoding UTF8 $inj
        foreach ($node in $fx.LanguageData.ChildNodes) {
            if ($node.NodeType -ne 'Element') { continue }
            $parts = $node.Name.Split('.', 2)
            $ok = ($parts[0] -eq $def.defName) -and ($parts[1] -in @('label', 'description')) -and -not [string]::IsNullOrWhiteSpace($node.InnerText)
            Assert-That ("French key " + $node.Name + " targets the def") $ok
        }
    }
}

Write-Host ""
if ($script:failures.Count -eq 0) {
    Write-Host ("$($script:checks) checks, all passed.") -ForegroundColor Green
    exit 0
}
Write-Host ("$($script:checks) checks, $($script:failures.Count) failed:") -ForegroundColor Red
$script:failures | ForEach-Object { Write-Host ("  - " + $_) -ForegroundColor Red }
exit 1
