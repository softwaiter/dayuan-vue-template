export function isNullOrWhiteSpace(str) {
    if (str == null || typeof str == "undefined") {
        return true;
    }
    return str.replace(/(^s*)|(s*$)/g, "").length == 0
}
