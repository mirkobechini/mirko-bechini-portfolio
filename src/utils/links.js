function isValidLink(value) {
    return typeof value === 'string' && value.trim() !== '' && value !== '#';
}

export { isValidLink };
