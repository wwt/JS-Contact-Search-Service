// NOTE: Pretend as though you do not have permission to edit this file.
const pendingRes = [];

function handler(res) { 
    pendingRes.push(res);
}

export default function() { return new Promise(handler) }

export async function flush() {
    pendingRes.map(res => res());
    await Promise.all(pendingRes);
    pendingRes.length = 0;
}
