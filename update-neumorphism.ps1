$dirs = @(
    "src/app/contratos/components",
    "src/app/contratos/movil/_components"
)

$filesUpdated = @()
$filesSkipped = @()

function Update-File($path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    $original = $content

    $oldPatterns = @(
        'bg-gradient-to-br from-slate-50 to-slate-100',
        'bg-gradient-to-br from-white to-slate-50',
        'bg-gradient-to-br from-slate-100 to-slate-50',
        '#d1d5db',
        'text-slate-800',
        'text-slate-700',
        'text-slate-600',
        'text-slate-500',
        'text-slate-400',
        'text-slate-300',
        'border-slate-200',
        'border-slate-100',
        'bg-slate-50',
        'bg-slate-100',
        'bg-slate-200',
        'bg-slate-300',
        'bg-white',
        'from-indigo-500 to-purple-600',
        'ring-indigo-400',
        'bg-indigo-50',
        'text-indigo-500',
        'text-indigo-600',
        'backdrop-blur',
        'hover:bg-slate-50',
        'hover:bg-slate-100',
        'hover:bg-indigo-50',
        'divide-slate-50',
        'divide-slate-100',
        'focus:ring-indigo-400',
        'focus:ring-violet-400',
        'focus:ring-emerald-400',
        'bg-indigo-100',
        'text-indigo-700',
        'text-violet-500',
        'text-violet-600',
        'text-violet-700',
        'hover:text-indigo-600',
        'hover:text-slate-600',
        'hover:bg-violet-50',
        'border-indigo-100',
        'bg-gradient-to-r from-indigo-50 to-white',
        'bg-gradient-to-r from-cyan-50 to-blue-50',
        'bg-gradient-to-r from-blue-50 to-indigo-50',
        'bg-gradient-to-r from-violet-50 to-fuchsia-50',
        'bg-gradient-to-r from-amber-50 to-orange-50',
        'bg-gradient-to-br from-cyan-50 to-blue-50',
        'bg-gradient-to-br from-blue-50 to-indigo-50',
        'bg-gradient-to-br from-violet-50 to-fuchsia-50',
        'bg-gradient-to-br from-amber-50 to-orange-50',
        'bg-gradient-to-br from-indigo-50 to-purple-50',
        'bg-gradient-to-r from-indigo-600 to-purple-700',
        'bg-gradient-to-r from-violet-600 to-fuchsia-600',
        'bg-gradient-to-r from-emerald-500 to-green-600',
        'bg-gradient-to-r from-indigo-600 to-blue-600',
        'bg-gradient-to-br from-emerald-500 to-green-600',
        'bg-gradient-to-br from-indigo-500 to-blue-600',
        'bg-gradient-to-br from-violet-500 to-purple-600',
        'bg-gradient-to-br from-green-500 to-emerald-600',
        'bg-gradient-to-br from-blue-500 to-indigo-600',
        'bg-gradient-to-br from-red-100 to-red-50',
        'bg-gradient-to-br from-blue-100 to-blue-50',
        'bg-gradient-to-br from-green-100 to-green-50',
        'ring-indigo-300',
        'border-l-2 border-indigo-200',
        'text-slate-200'
    )

    $hasOld = $false
    foreach ($p in $oldPatterns) {
        if ($content.Contains($p)) { $hasOld = $true; break }
    }

    if (-not $hasOld) {
        return @{ updated = $false; path = $path }
    }

    # === EXACT REPLACEMENTS (gradients, shadows, etc.) ===
    $content = $content.Replace('bg-gradient-to-br from-slate-50 to-slate-100', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-white to-slate-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-slate-100 to-slate-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-indigo-50 to-purple-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-indigo-50 to-fuchsia-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-cyan-50 to-blue-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-blue-50 to-indigo-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-violet-50 to-fuchsia-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-amber-50 to-orange-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-r from-indigo-50 to-white', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-r from-cyan-50 to-blue-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-r from-blue-50 to-indigo-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-r from-violet-50 to-fuchsia-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-r from-amber-50 to-orange-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-red-100 to-red-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-blue-100 to-blue-50', 'bg-[#dfeaff]')
    $content = $content.Replace('bg-gradient-to-br from-green-100 to-green-50', 'bg-[#dfeaff]')

    # Accent gradients
    $content = $content.Replace('bg-gradient-to-r from-indigo-600 to-purple-700', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-r from-violet-600 to-fuchsia-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-r from-emerald-500 to-green-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-r from-indigo-600 to-blue-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-br from-emerald-500 to-green-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-br from-indigo-500 to-purple-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-br from-indigo-500 to-blue-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-br from-violet-500 to-purple-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-br from-green-500 to-emerald-600', 'bg-[#6888ff]')
    $content = $content.Replace('bg-gradient-to-br from-blue-500 to-indigo-600', 'bg-[#6888ff]')

    # Shadow colors
    $content = $content.Replace('#d1d5db', '#bec8de')

    # Borders - use Tailwind arbitrary values instead of style={{})
    $content = $content.Replace('border border-slate-200/50', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-slate-200/30', 'border border-[#bec8de30]')
    $content = $content.Replace('border-b border-slate-200/50', 'border-b border-[#bec8de30]')
    $content = $content.Replace('border-t border-slate-200/50', 'border-t border-[#bec8de30]')
    $content = $content.Replace('border-b border-slate-200', 'border-b border-[#bec8de30]')
    $content = $content.Replace('border-t border-slate-200', 'border-t border-[#bec8de30]')
    $content = $content.Replace('border border-slate-200', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-slate-100', 'border border-[#bec8de30]')
    $content = $content.Replace('border-b border-slate-100', 'border-b border-[#bec8de30]')
    $content = $content.Replace('border-t border-slate-100', 'border-t border-[#bec8de30]')
    $content = $content.Replace('border-l border-slate-200', 'border-l border-[#bec8de30]')
    $content = $content.Replace('border-l-2 border-indigo-200', 'border-l-2 border-[#6888ff30]')
    $content = $content.Replace('border-b border-blue-100', 'border-b border-[#bec8de30]')
    $content = $content.Replace('border-t border-blue-100', 'border-t border-[#bec8de30]')
    $content = $content.Replace('border-b border-indigo-100', 'border-b border-[#bec8de30]')
    $content = $content.Replace('border border-indigo-100', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-violet-100', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-amber-100', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-emerald-100', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-red-200', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-amber-200', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-emerald-200', 'border border-[#bec8de30]')
    $content = $content.Replace('border border-purple-200', 'border border-[#bec8de30]')

    # Focus rings
    $content = $content.Replace('focus:ring-2 focus:ring-indigo-400/50', 'focus:ring-2 focus:ring-[#6888ff]/50')
    $content = $content.Replace('focus:ring-2 focus:ring-violet-400', 'focus:ring-2 focus:ring-[#6888ff]/50')
    $content = $content.Replace('focus:ring-2 focus:ring-emerald-400', 'focus:ring-2 focus:ring-[#6888ff]/50')
    $content = $content.Replace('focus:ring-2 focus:ring-red-400', 'focus:ring-2 focus:ring-[#6888ff]/50')
    $content = $content.Replace('focus:ring-2 focus:ring-indigo-400', 'focus:ring-2 focus:ring-[#6888ff]/50')
    $content = $content.Replace('ring-2 ring-indigo-300', 'ring-2 ring-[#6888ff]')
    $content = $content.Replace('ring-2 ring-indigo-400', 'ring-2 ring-[#6888ff]')

    # Backgrounds - safer regex with non-word-char boundaries
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-slate-50(?=[^a-zA-Z0-9-])', 'bg-[#dfeaff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-slate-100(?=[^a-zA-Z0-9-])', 'bg-[#dfeaff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-slate-200(?=[^a-zA-Z0-9-])', 'bg-[#dfeaff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-slate-300(?=[^a-zA-Z0-9-])', 'bg-[#bec8de]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-white(?=[^a-zA-Z0-9-])', 'bg-[#dfeaff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-indigo-50(?=[^a-zA-Z0-9-])', 'bg-[#dfeaff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-indigo-100(?=[^a-zA-Z0-9-])', 'bg-[#dfeaff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])bg-violet-50(?=[^a-zA-Z0-9-])', 'bg-[#dfeaff]'

    # Text colors
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-slate-800(?=[^a-zA-Z0-9-])', 'text-[#69738c]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-slate-700(?=[^a-zA-Z0-9-])', 'text-[#69738c]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-slate-600(?=[^a-zA-Z0-9-])', 'text-[#69738c]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-slate-500(?=[^a-zA-Z0-9-])', 'text-[#9aa3b8]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-slate-400(?=[^a-zA-Z0-9-])', 'text-[#9aa3b8]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-slate-300(?=[^a-zA-Z0-9-])', 'text-[#9aa3b8]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-slate-200(?=[^a-zA-Z0-9-])', 'text-[#9aa3b8]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-indigo-500(?=[^a-zA-Z0-9-])', 'text-[#6888ff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-indigo-600(?=[^a-zA-Z0-9-])', 'text-[#6888ff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-indigo-700(?=[^a-zA-Z0-9-])', 'text-[#6888ff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-indigo-800(?=[^a-zA-Z0-9-])', 'text-[#6888ff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-violet-500(?=[^a-zA-Z0-9-])', 'text-[#6888ff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-violet-600(?=[^a-zA-Z0-9-])', 'text-[#6888ff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])text-violet-700(?=[^a-zA-Z0-9-])', 'text-[#6888ff]'

    # Hover states
    $content = $content -replace '(?<=[^a-zA-Z0-9-])hover:bg-slate-50(?=[^a-zA-Z0-9-])', 'hover:bg-[#6888ff]/10'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])hover:bg-slate-100(?=[^a-zA-Z0-9-])', 'hover:bg-[#6888ff]/10'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])hover:bg-indigo-50(?=[^a-zA-Z0-9-])', 'hover:bg-[#6888ff]/10'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])hover:bg-violet-50(?=[^a-zA-Z0-9-])', 'hover:bg-[#6888ff]/10'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])hover:text-indigo-600(?=[^a-zA-Z0-9-])', 'hover:text-[#6888ff]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])hover:text-slate-600(?=[^a-zA-Z0-9-])', 'hover:text-[#69738c]'

    # Dividers
    $content = $content.Replace('divide-y divide-slate-50', 'divide-y divide-[#bec8de30]')
    $content = $content.Replace('divide-y divide-slate-100', 'divide-y divide-[#bec8de30]')
    $content = $content.Replace('divide-slate-50', 'divide-[#bec8de30]')

    # Backdrop blur (prohibited)
    $content = $content -replace '(?<=[^a-zA-Z0-9-])backdrop-blur-sm(?=[^a-zA-Z0-9-])', ''
    $content = $content -replace '(?<=[^a-zA-Z0-9-])backdrop-blur(?=[^a-zA-Z0-9-])', ''

    # hr borders in class strings - already handled by border-slate replacements above
    # But standalone border-slate classes in non-class contexts might remain
    $content = $content -replace '(?<=[^a-zA-Z0-9-])border-slate-200(?=[^a-zA-Z0-9-])', 'border-[#bec8de30]'
    $content = $content -replace '(?<=[^a-zA-Z0-9-])border-slate-100(?=[^a-zA-Z0-9-])', 'border-[#bec8de30]'

    if ($content -ne $original) {
        Set-Content $path -Value $content -Encoding UTF8 -NoNewline
        return @{ updated = $true; path = $path }
    }

    return @{ updated = $false; path = $path }
}

foreach ($dir in $dirs) {
    $files = Get-ChildItem -Path $dir -Filter "*.tsx" -Recurse
    foreach ($file in $files) {
        $result = Update-File $file.FullName
        if ($result.updated) {
            $filesUpdated += $result.path
        } else {
            $filesSkipped += $result.path
        }
    }
}

Write-Host "UPDATED: $($filesUpdated.Count)"
foreach ($f in $filesUpdated) { Write-Host "  $f" }
Write-Host "SKIPPED: $($filesSkipped.Count)"
foreach ($f in $filesSkipped) { Write-Host "  $f" }
