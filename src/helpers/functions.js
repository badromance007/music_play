export function getDurationInMinutes(seconds) {
    const minutes = Math.floor(seconds / 60)
    const sec =  Math.floor(seconds - minutes * 60)
    return minutes + ":" + (sec < 10 ? '0' : '') + sec
}