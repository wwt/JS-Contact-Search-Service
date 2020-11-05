// NOTE: Pretend as though you do not have permission to edit this file.
import timeout from '../utilities/timeout';
import contacts from './data';

export default {
    async getById(id) {
        await timeout();
        return JSON.parse(JSON.stringify(contacts[id] || null));
    }
}
