const transferStore = new Map();

function makeIntentId(prefix = "tr") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

module.exports = {
    transferStore,
    makeIntentId,
};
