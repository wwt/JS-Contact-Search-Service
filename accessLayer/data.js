import updates from './updates';

const contacts = {};

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

export { addedContact, modifiedContact, removedContact, reset };
