# ============================================================
# Predeploy Check — Mirko Bechini Portfolio (PowerShell)
# ============================================================
# Esegue in sequenza:
#   1. vitest run (JS tests)        → STOP se fallisce
#   2. php artisan test (PHP tests) → STOP se fallisce
#   3. npm audit + auto-fix         → chiede se high/critical non fixabili
#   4. composer audit + auto-fix    → chiede se high/critical non fixabili
# ============================================================

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $rootDir

$global:overallStatus = "PASS"

function Print-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║        PREDEPLOY CHECK — Portfolio           ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Step {
    param([int]$step, [int]$total, [string]$title)
    Write-Host ""
    Write-Host "━━━ [$step/$total] $title ━━━" -ForegroundColor Yellow
}

function Print-Result {
    param([string]$status, [string]$msg)
    if ($status -eq "PASS") {
        Write-Host "  ✅ $msg" -ForegroundColor Green
    }
    elseif ($status -eq "FAIL") {
        Write-Host "  ❌ $msg" -ForegroundColor Red
    }
    else {
        Write-Host "  ⚠️  $msg" -ForegroundColor Yellow
    }
}

function Prompt-Continue {
    param([string]$severity, [string]$tool)
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  🚨 Vulnerabilità $severity in $tool non fixabile  ║" -ForegroundColor Red
    Write-Host "║  automaticamente!                                 ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vuoi comunque procedere con il deploy?" -ForegroundColor Yellow
    Write-Host "  [y] Si, procedi comunque" -ForegroundColor Cyan
    Write-Host "  [n] No, ferma tutto (default)" -ForegroundColor Cyan
    Write-Host "  [v] Mostra dettagli vulnerabilità" -ForegroundColor Cyan
    $response = Read-Host "➜ "
    switch -Wildcard ($response) {
        "y" { return 0 }
        "v" { return 2 }
        default { return 1 }
    }
}

# ============================================================
Print-Banner

# ============================================================
# STEP 1: JS Tests (vitest)
# ============================================================
$step = 1
$totalSteps = 4
Print-Step $step $totalSteps "Test JavaScript (vitest)"

try {
    $output = npx vitest run 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Result "PASS" "Tutti i test JS superati"
    }
    else {
        Print-Result "FAIL" "Test JS falliti — blocca il deploy"
        Write-Host $output
        exit 1
    }
}
catch {
    Print-Result "FAIL" "Test JS falliti — blocca il deploy"
    Write-Host $_.Exception.Message
    exit 1
}

# ============================================================
# STEP 2: PHP Tests (phpunit)
# ============================================================
$step = 2
Print-Step $step $totalSteps "Test PHP (phpunit)"

try {
    $output = .\vendor\bin\phpunit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Result "PASS" "Tutti i test PHP superati"
    }
    else {
        Print-Result "FAIL" "Test PHP falliti — blocca il deploy"
        Write-Host $output
        exit 1
    }
}
catch {
    Print-Result "FAIL" "Test PHP falliti — blocca il deploy"
    Write-Host $_.Exception.Message
    exit 1
}

# ============================================================
# STEP 3: npm audit
# ============================================================
$step = 3
Print-Step $step $totalSteps "npm audit — controllo vulnerabilità JS"

$npmOutput = npm audit 2>&1
if ($LASTEXITCODE -eq 0) {
    Print-Result "PASS" "Nessuna vulnerabilità npm trovata"
}
else {
    Write-Host "🔍 Vulnerabilità npm trovate. Provo a fixare..." -ForegroundColor Yellow
    
    $npmFixOutput = npm audit fix 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Result "PASS" "npm audit fix completato con successo"
    }
    else {
        $npmAuditText = npm audit 2>&1 | Out-String
        
        if ($npmAuditText -match "high|critical") {
            Print-Result "WARN" "Vulnerabilità HIGH/CRITICAL in npm non fixabili automaticamente"
            
            do {
                $rc = Prompt-Continue "HIGH/CRITICAL" "npm"
                if ($rc -eq 0) {
                    Print-Result "WARN" "Deploy proseguirà con vulnerabilità npm note"
                    break
                }
                elseif ($rc -eq 2) {
                    Write-Host ""
                    $npmAuditText -split "`n" | Select-Object -First 50
                    Write-Host ""
                    Write-Host "(mostrate prime 50 righe)" -ForegroundColor Yellow
                }
                else {
                    Print-Result "FAIL" "Deploy bloccato dall'utente per vulnerabilità npm"
                    exit 1
                }
            } while ($true)
        }
        else {
            Print-Result "WARN" "Vulnerabilità npm moderate/basse — non bloccanti"
        }
    }
}

# ============================================================
# STEP 4: composer audit
# ============================================================
$step = 4
Print-Step $step $totalSteps "composer audit — controllo vulnerabilità PHP"

$composerOutput = composer audit 2>&1
if ($LASTEXITCODE -eq 0) {
    Print-Result "PASS" "Nessuna vulnerabilità composer trovata"
}
else {
    Write-Host "🔍 Vulnerabilità composer trovate. Provo a fixare..." -ForegroundColor Yellow
    
    $composerUpdateOutput = composer update --no-dev 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Result "PASS" "composer update completato — verifica ricorrendo audit..."
        
        $composerReAudit = composer audit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Print-Result "PASS" "Vulnerabilità composer risolte con update"
        }
        else {
            $composerAuditText = composer audit 2>&1 | Out-String
            if ($composerAuditText -match "high|critical") {
                Print-Result "WARN" "Vulnerabilità HIGH/CRITICAL in composer non fixabili"
                
                do {
                    $rc = Prompt-Continue "HIGH/CRITICAL" "composer"
                    if ($rc -eq 0) {
                        Print-Result "WARN" "Deploy proseguirà con vulnerabilità composer note"
                        break
                    }
                    elseif ($rc -eq 2) {
                        Write-Host ""
                        $composerAuditText -split "`n" | Select-Object -First 50
                        Write-Host ""
                        Write-Host "(mostrate prime 50 righe)" -ForegroundColor Yellow
                    }
                    else {
                        Print-Result "FAIL" "Deploy bloccato dall'utente per vulnerabilità composer"
                        exit 1
                    }
                } while ($true)
            }
            else {
                Print-Result "WARN" "Vulnerabilità composer moderate/basse — non bloccanti"
            }
        }
    }
    else {
        Print-Result "WARN" "composer update fallito — verifico severità..."
        $composerAuditText = composer audit 2>&1 | Out-String
        if ($composerAuditText -match "high|critical") {
            Print-Result "WARN" "Vulnerabilità HIGH/CRITICAL in composer"
            do {
                $rc = Prompt-Continue "HIGH/CRITICAL" "composer"
                if ($rc -eq 0) {
                    Print-Result "WARN" "Deploy proseguirà con vulnerabilità composer note"
                    break
                }
                elseif ($rc -eq 2) {
                    Write-Host ""
                    $composerAuditText -split "`n" | Select-Object -First 50
                    Write-Host ""
                    Write-Host "(mostrate prime 50 righe)" -ForegroundColor Yellow
                }
                else {
                    Print-Result "FAIL" "Deploy bloccato dall'utente per vulnerabilità composer"
                    exit 1
                }
            } while ($true)
        }
        else {
            Print-Result "WARN" "Vulnerabilità composer moderate/basse — non bloccanti"
        }
    }
}

# ============================================================
# RIEPILOGO FINALE
# ============================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           PREDEPLOY CHECK COMPLETATO         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
if ($global:overallStatus -eq "PASS") {
    Write-Host "✅ Tutti i controlli superati — puoi procedere con il deploy!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Deploy completato con warning — verifica i messaggi sopra." -ForegroundColor Yellow
}
Write-Host ""