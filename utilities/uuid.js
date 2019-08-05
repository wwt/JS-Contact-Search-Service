export default function() {
    return ('0'.repeat(12) + Math.floor(Math.random() * Math.pow(2, 48)).toString(16)).slice(-12)
}
