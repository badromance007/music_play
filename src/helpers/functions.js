export function getDurationInMinutes(seconds) {
    const minutes = Math.floor(seconds / 60)
    const sec =  Math.floor(seconds - minutes * 60)
    return minutes + ":" + (sec < 10 ? '0' : '') + sec
}

export function shuffle(array) { // Fisher-Yates Shuffle
    let currentIndex = array.length,  randomIndex

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }

    return array
}

export function truncateString(str, num) {
    if (str.length > num) {
       return str.slice(0, num) + "...";
    } else {
       return str;
    }
}

export const clamp = (num, min, max) => {
    if (num >= max) return max
    if (num <= min) return min
    return num
}