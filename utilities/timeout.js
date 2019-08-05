
const pendingRes = [];

function handler(res) { 
    pendingRes.push(res);
}

export default function() { return new Promise(handler) }

export async function flush() {
    pendingRes.map(res => res());
    pendingRes.length = 0;
}
