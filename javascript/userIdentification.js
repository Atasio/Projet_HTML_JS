function generateUniqueId() {
    // Generate a random unique identifier
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function() {
        return Math.floor(Math.random() * 16).toString(16);
    });
}

function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = generateUniqueId();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

export { getUserId };