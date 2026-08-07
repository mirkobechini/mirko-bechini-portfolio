#!/usr/bin/env bash
# ============================================================
# Predeploy Check — Mirko Bechini Portfolio
# ============================================================
# Esegue in sequenza:
#   1. vitest run (JS tests)        → STOP se fallisce
#   2. php artisan test (PHP tests) → STOP se fallisce
#   3. npm audit + auto-fix         → chiede se high/critical non fixabili
#   4. composer audit + auto-fix    → chiede se high/critical non fixabili
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASS=0
FAIL=1
WARN=2

overall_status=$PASS

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════╗"
    echo "║        PREDEPLOY CHECK — Portfolio           ║"
    echo "╚══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo ""
    echo -e "${YELLOW}━━━ [$1/$2] $3 ━━━${NC}"
}

print_result() {
    local status=$1
    local msg=$2
    if [ "$status" -eq $PASS ]; then
        echo -e "  ${GREEN}✅ $msg${NC}"
    elif [ "$status" -eq $FAIL ]; then
        echo -e "  ${RED}❌ $msg${NC}"
    else
        echo -e "  ${YELLOW}⚠️  $msg${NC}"
    fi
}

prompt_continue() {
    local severity=$1
    local tool=$2
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  🚨 Vulnerabilità ${severity} in ${tool} non fixabile  ║${NC}"
    echo -e "${RED}║  automaticamente!                                 ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Vuoi comunque procedere con il deploy?${NC}"
    echo -e "  ${CYAN}[y]${NC} Si, procedi comunque"
    echo -e "  ${CYAN}[n]${NC} No, ferma tutto (default)"
    echo -e "  ${CYAN}[v]${NC} Mostra dettagli vulnerabilità"
    read -r -p "➜ " response
    case "$response" in
        [yY])
            return 0
            ;;
        [vV])
            return 2
            ;;
        *)
            return 1
            ;;
    esac
}

# ============================================================
# STEP 1: JS Tests (vitest)
# ============================================================
step=1
total_steps=4
print_step $step $total_steps "Test JavaScript (vitest)"

if npx vitest run 2>&1; then
    print_result $PASS "Tutti i test JS superati"
else
    print_result $FAIL "Test JS falliti — blocca il deploy"
    overall_status=$FAIL
    exit 1
fi

# ============================================================
# STEP 2: PHP Tests (phpunit)
# ============================================================
step=2
print_step $step $total_steps "Test PHP (phpunit)"

if ./vendor/bin/phpunit 2>&1; then
    print_result $PASS "Tutti i test PHP superati"
else
    print_result $FAIL "Test PHP falliti — blocca il deploy"
    overall_status=$FAIL
    exit 1
fi

# ============================================================
# STEP 3: npm audit
# ============================================================
step=3
print_step $step $total_steps "npm audit — controllo vulnerabilità JS"

if npm audit 2>&1; then
    print_result $PASS "Nessuna vulnerabilità npm trovata"
else
    echo -e "${YELLOW}🔍 Vulnerabilità npm trovate. Provo a fixare...${NC}"
    
    # Prova auto-fix
    if npm audit fix 2>&1; then
        print_result $PASS "npm audit fix completato con successo"
    else
        # Estrai severità massima non fixabile
        npm_audit_output=$(npm audit 2>&1 || true)
        
        if echo "$npm_audit_output" | grep -qi "high\|critical"; then
            print_result $WARN "Vulnerabilità HIGH/CRITICAL in npm non fixabili automaticamente"
            
            while true; do
                prompt_continue "HIGH/CRITICAL" "npm"
                rc=$?
                if [ $rc -eq 0 ]; then
                    print_result $WARN "Deploy proseguirà con vulnerabilità npm note"
                    break
                elif [ $rc -eq 2 ]; then
                    echo ""
                    echo "$npm_audit_output" | head -50
                    echo ""
                    echo -e "${YELLOW}(mostrate prime 50 righe)${NC}"
                else
                    print_result $FAIL "Deploy bloccato dall'utente per vulnerabilità npm"
                    overall_status=$FAIL
                    exit 1
                fi
            done
        else
            print_result $WARN "Vulnerabilità npm moderate/basse — non bloccanti"
        fi
    fi
fi

# ============================================================
# STEP 4: composer audit
# ============================================================
step=4
print_step $step $total_steps "composer audit — controllo vulnerabilità PHP"

if composer audit 2>&1; then
    print_result $PASS "Nessuna vulnerabilità composer trovata"
else
    echo -e "${YELLOW}🔍 Vulnerabilità composer trovate. Provo a fixare...${NC}"
    
    # Prova auto-fix con composer update
    if composer update --no-dev 2>&1; then
        print_result $PASS "composer update completato — verifica ricorrendo audit..."
        if composer audit 2>&1; then
            print_result $PASS "Vulnerabilità composer risolte con update"
        else
            composer_audit_output=$(composer audit 2>&1 || true)
            if echo "$composer_audit_output" | grep -qi "high\|critical"; then
                print_result $WARN "Vulnerabilità HIGH/CRITICAL in composer non fixabili"
                
                while true; do
                    prompt_continue "HIGH/CRITICAL" "composer"
                    rc=$?
                    if [ $rc -eq 0 ]; then
                        print_result $WARN "Deploy proseguirà con vulnerabilità composer note"
                        break
                    elif [ $rc -eq 2 ]; then
                        echo ""
                        echo "$composer_audit_output" | head -50
                        echo ""
                        echo -e "${YELLOW}(mostrate prime 50 righe)${NC}"
                    else
                        print_result $FAIL "Deploy bloccato dall'utente per vulnerabilità composer"
                        overall_status=$FAIL
                        exit 1
                    fi
                done
            else
                print_result $WARN "Vulnerabilità composer moderate/basse — non bloccanti"
            fi
        fi
    else
        print_result $WARN "composer update fallito — verifico severità..."
        composer_audit_output=$(composer audit 2>&1 || true)
        if echo "$composer_audit_output" | grep -qi "high\|critical"; then
            print_result $WARN "Vulnerabilità HIGH/CRITICAL in composer"
            while true; do
                prompt_continue "HIGH/CRITICAL" "composer"
                rc=$?
                if [ $rc -eq 0 ]; then
                    print_result $WARN "Deploy proseguirà con vulnerabilità composer note"
                    break
                elif [ $rc -eq 2 ]; then
                    echo ""
                    echo "$composer_audit_output" | head -50
                    echo ""
                    echo -e "${YELLOW}(mostrate prime 50 righe)${NC}"
                else
                    print_result $FAIL "Deploy bloccato dall'utente per vulnerabilità composer"
                    overall_status=$FAIL
                    exit 1
                fi
            done
        else
            print_result $WARN "Vulnerabilità composer moderate/basse — non bloccanti"
        fi
    fi
fi

# ============================================================
# RIEPILOGO FINALE
# ============================================================
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           PREDEPLOY CHECK COMPLETATO         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""
if [ "$overall_status" -eq $PASS ]; then
    echo -e "${GREEN}✅ Tutti i controlli superati — puoi procedere con il deploy!${NC}"
else
    echo -e "${YELLOW}⚠️  Deploy completato con warning — verifica i messaggi sopra.${NC}"
fi
echo ""