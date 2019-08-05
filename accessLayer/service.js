import timeout from '../utilities/timeout';
import contacts from './data';

export default {
    async getById(id) {
        await timeout();
        return contacts[id] || null;
    }
}
