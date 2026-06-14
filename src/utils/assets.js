const ASSETS_PATH = import.meta.env.VITE_ASSETS_PATH || '';

function getAssetPath(path) {
    return `${ASSETS_PATH}${path}`;
}

export { ASSETS_PATH, getAssetPath };
