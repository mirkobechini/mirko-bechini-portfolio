const ASSETS_PATH = import.meta.env.VITE_ASSETS_PATH || '/assets';

function getAssetPath(path) {
    return `${ASSETS_PATH}${path}`;
}

export { ASSETS_PATH, getAssetPath };
