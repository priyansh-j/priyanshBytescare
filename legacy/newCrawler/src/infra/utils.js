function randomDelay(max, min) {
    let delay = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise((resolve) => setTimeout(resolve, delay));
}


export { randomDelay };
