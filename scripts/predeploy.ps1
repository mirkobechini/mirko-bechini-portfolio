# ============================================================
# Predeploy Check — Mirko Bechini Portfolio (PowerShell)
# ============================================================
# Esegue in sequenza:
#   1. vitest run (JS tests)        → STOP se fallisce
#   2. php artisan test (PHP tests) → STOP se fallisce
#   3. npm audit + auto-fix         → chiede se high/critical non fixabili
#   4. composer audit + auto-fix    → chiede se high/critical non fixabili
#   5. Controllo configurazione produzione (.env.production)
# ============================================================

# Continue: i comandi nativi (es. composer) scrivono messaggi normali su stderr, con "Stop" PowerShell 5.1 li tratterebbe
# come errori. Gli esiti vengono controllati esplicitamente con $LASTEXITCODE.
$ErrorActionPreference = "Continue"
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
$totalSteps = 5
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
    $output = php vendor/bin/phpunit 2>&1
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

$npmOutput = npm audit --omit=dev 2>&1
if ($LASTEXITCODE -eq 0) {
    Print-Result "PASS" "Nessuna vulnerabilità npm trovata"
}
else {
    Write-Host "🔍 Vulnerabilità npm trovate. Provo a fixare..." -ForegroundColor Yellow
    
    $npmFixOutput = npm audit fix --omit=dev 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-Result "PASS" "npm audit fix completato con successo"
    }
    else {
        $npmAuditText = npm audit --omit=dev 2>&1 | Out-String
        
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
# STEP 5: Controllo configurazione produzione
# ============================================================
$step = 5
Print-Step $step $totalSteps "Configurazione produzione (.env.production)"

$prodEnvFile = Join-Path (Split-Path -Parent $PSScriptRoot) ".env.production"

if (-not (Test-Path $prodEnvFile)) {
    Print-Result "WARN" ".env.production non trovato — controlla a mano le variabili su Laravel Cloud"
}
else {
    $envOk = $true

    if (Select-String -Path $prodEnvFile -Pattern '^APP_DEBUG=true' -Quiet) {
        Print-Result "FAIL" "APP_DEBUG=true in .env.production"
        $envOk = $false
    }

    if (-not (Select-String -Path $prodEnvFile -Pattern '^APP_ENV=production' -Quiet)) {
        Print-Result "FAIL" "APP_ENV non è 'production' in .env.production"
        $envOk = $false
    }

    if (-not (Select-String -Path $prodEnvFile -Pattern '^APP_URL=https://' -Quiet)) {
        Print-Result "FAIL" "APP_URL non inizia con https:// in .env.production"
        $envOk = $false
    }

    # Le immagini caricate dal pannello devono andare su un disco persistente (il filesystem di Cloud si azzera a ogni deploy)
    if (-not (Select-String -Path $prodEnvFile -Pattern '^UPLOADS_DISK=\S' -Quiet) -or (Select-String -Path $prodEnvFile -Pattern '^UPLOADS_DISK=(public|local)\s*$' -Quiet)) {
        Print-Result "FAIL" "UPLOADS_DISK mancante o 'public'/'local' in .env.production: le immagini caricate andrebbero perse a ogni deploy"
        $envOk = $false
    }

    # I segreti stanno solo su Laravel Cloud, mai in un file locale
    foreach ($secret in @('GITHUB_TOKEN', 'AWS_SECRET_ACCESS_KEY', 'DB_PASSWORD')) {
        if (Select-String -Path $prodEnvFile -Pattern "^$secret=\S" -Quiet) {
            Print-Result "FAIL" "$secret con un valore in .env.production: i segreti vanno solo su Laravel Cloud"
            $envOk = $false
        }
    }

    if ($envOk) {
        Print-Result "PASS" "Configurazione produzione corretta"
    }
    else {
        exit 1
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