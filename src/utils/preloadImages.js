export function preloadImages(imageSources) {
    imageSources
        .filter(Boolean)
        .forEach((source) => {
            const image = new Image();
            image.src = source;
        });
}
