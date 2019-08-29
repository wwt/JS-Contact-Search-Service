import timeout from '../utilities/timeout';
import contacts from './data';

export default {
    async getById(id) {
        await timeout();
        return JSON.parse(JSON.stringify(contacts[id] || null));
    }
}
