function isValidLink(value) {
    return typeof value === 'string' && value.trim() !== '' && value !== '#';
}

function isExternalWebLink(value) {
    return isValidLink(value) && /^https?:\/\//i.test(value.trim());
}

export { isValidLink, isExternalWebLink };
