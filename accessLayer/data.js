// NOTE: Pretend as though you do not have permission to edit this file.
import updates from './updates';

const lock = Symbol('data.lock');
const unlock = Symbol('data.unlock');

const contacts = new Proxy({}, {
    set(target, prop, value) {
        if (prop === lock) {
            target[lock] = true;
            target[unlock] = value;
        } else if (prop === unlock && target[unlock] === value) {
            target[lock] = false;
            delete target[unlock];
        } else if (!target[lock]) {
            target[prop] = value;
        }

        return true;
    },
    get(target, prop) {
        if (target[lock]) return undefined;
        return target[prop];
    }
});

function reset() {
    for (let id in contacts) {
        delete contacts[id];
    }
}

function addedContact(id) {
    updates.emit('add', id);
}

function modifiedContact(id, field, value) {
    updates.emit('change', id, field, value);
}

function removedContact(id) {
    updates.emit('remove', id);
}

export default contacts;

export {
    addedContact,
    modifiedContact,
    removedContact,
    reset,
    lock,
    unlock,
};
