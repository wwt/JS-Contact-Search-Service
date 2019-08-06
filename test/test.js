import { expect } from 'chai';
import { flush } from '../utilities/timeout';
import Contact from '../accessLayer/model';
import contacts, { addedContact, changedContact, removedContact, reset } from '../accessLayer/data';
import ContactService from '../contactService';
import uuid from '../utilities/uuid';

function isClass(func) {
    return typeof func === 'function' && (/^class\s/.test(Function.prototype.toString.call(func))
        || /_classCallCheck/.test(Function.prototype.toString.call(func)) // needed for transpile check
    );
}

function createContact(props) {
    const id = uuid();
    contacts[id] = new Contact(id, props);
    addedContact(id);
    return contacts[id];
}

describe('Contact Service', () => {
    let service;

    beforeEach(() => {
        service = isClass(ContactService) ? new ContactService() : ContactService();
    });
    
    afterEach(reset);

	describe('search', () => {
        describe('add event', () => {
            it('should return newly added contact', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(1);
                expect(results[0].id).to.equal(contact.id);
            });
            
            it('should return multiple matching contacts', async () => {
                const contact1 = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                const contact2 = createContact({ firstName: 'First', lastName: 'Other', primaryPhoneNumber: '314-555-0001' });
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(2);
                expect(results.map(res => res.id)).includes(contact1.id);
                expect(results.map(res => res.id)).includes(contact2.id);
            });
            
            it('should not return a contact before retrieving all the details from the service', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                
                const before = service.search('First');
                await flush();
                const after = service.search('First');
                
                expect(before.length).to.equal(0);
                expect(after.length).to.equal(1);
                expect(after[0].id).to.equal(contact.id);
            });

            it('should return all the required fields', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(1);
                expect(results[0]).to.deep.equal({
                    // fields here
                });
            });
        });

        describe('change event', () => {
            it('should return the updated change to a name', async () => {

            });
        });

        describe('remove event', () => {
            it('should not return removed contacts', async () => {

            });
        });

        describe('searchable fields', () => {
            it('should be searchable by phone number', async () => {

            });
        });

        describe('special search syntax (bonus)', () => {
            // search by specific field (e.g. name:First role:Developer)
            // search in specific time (e.g. from:2019-01-01 to:2019-01-01)
            // search by regex (e.g. /^Dan\w*$/i)
            // limit returned fields (e.g. return:name,role)
        });
    });
});
