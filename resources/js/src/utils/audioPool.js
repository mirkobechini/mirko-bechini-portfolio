/**
 * Pool di elementi Audio riutilizzabili.
 * Evita di creare decine di new Audio() a ogni hover/click.
 * Limite: 4 istanze simultanee, poi riutilizza le più vecchie.
 */
const POOL_SIZE = 4;
const audioPool = [];

for (let i = 0; i < POOL_SIZE; i++) {
    audioPool.push(new Audio());
}

let nextIndex = 0;

/**
 * Suona un effetto audio usando il pool.
 * @param {string} src - Percorso del file audio
 * @param {object} [options]
 * @param {number} [options.volume=0.3]
 * @param {number} [options.maxDuration=0] - Se >0, ferma dopo N ms
 * @returns {HTMLAudioElement|undefined} L'elemento Audio usato, o undefined se silenziato
 */
export function playPooled(src, { volume = 0.3, maxDuration = 0 } = {}) {
    if (!src) return;

    const audio = audioPool[nextIndex];
    nextIndex = (nextIndex + 1) % POOL_SIZE;

    // Ferma l'audio precedente se ancora in riproduzione
    audio.pause();
    audio.currentTime = 0;

    audio.src = src;
    audio.volume = volume;
    audio.play().catch(() => {
        // Ignora errori di autoplay policy (es. primo click richiesto)
    });

    if (maxDuration > 0) {
        const timer = setTimeout(() => {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        }, maxDuration);
        // Cleanup del timer se l'audio finisce prima
        audio.addEventListener('ended', () => clearTimeout(timer), { once: true });
    }

    return audio;
}