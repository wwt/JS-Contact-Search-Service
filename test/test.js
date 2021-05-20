import { expect } from 'chai';
import { flush as flushPromises } from '../utilities/timeout';
import Contact from '../accessLayer/model';
import accessLayer from '../accessLayer';
import contacts, { addedContact, lock, modifiedContact, removedContact, reset, unlock } from '../accessLayer/data';
import ContactService from '../contactService';
import uuid from '../utilities/uuid';

const testLock = Symbol('test.lock');
contacts[lock] = testLock;

function createContact(props) {
    const id = uuid();
    contacts[unlock] = testLock;
    const c = contacts[id] = new Contact(id, props);
    contacts[lock] = testLock;
    addedContact(id);
    return c;
}

function changeContact(contact, props) {
    Object.assign(contact, props);

    for (let prop in props) {
        modifiedContact(contact.id, prop, props[prop]);
    }

    return contact;
}

function removeContact(contact) {
    contacts[unlock] = testLock;
    delete contacts[contact.id];
    contacts[lock] = testLock;

    removedContact(contact.id);

    return contact;
}

async function flush() {
    contacts[unlock] = testLock;
    await flushPromises();
    contacts[lock] = testLock;
}

// You may add your own tests or comment tests out as you work, but please submit with all tests running
describe('Contact Service', () => {
    let service;

    beforeEach(() => {
        service = new ContactService(accessLayer.updates, accessLayer.service);
    });
    
    afterEach(reset);

	describe('search', () => {
        describe('add event', () => {
            it('should return only contacts that match the search query', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000'});
                //This contact should not be returned by the search
                createContact({ firstName: 'John', lastName: 'Doe', primaryPhoneNumber: '303-123-4567'});
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(1);
                expect(results[0].id).to.equal(contact.id);
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

            it('should map the returned contacts to the expected data format', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000', primaryEmail: 'first.last@mail.com' });
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(1);
                expect(results[0]).to.deep.equal({
                    name: 'First Last',
                    phones: ['(314) 555-0000'],
                    email: 'first.last@mail.com',
                    address: '',
                    id: contact.id
                });
            });
            
            it('should return multiple matching contacts', async () => {
                const contact1 = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                const contact2 = createContact({ firstName: 'First', lastName: 'Other', primaryPhoneNumber: '314-555-0001' });
                //This contact should not be returned by the search
                createContact({ firstName: 'John', lastName: 'Doe', primaryPhoneNumber: '303-123-4567'});
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(2);
                expect(results.map(res => res.id)).includes(contact1.id);
                expect(results.map(res => res.id)).includes(contact2.id);
            });
            
            it('should map phone numbers with different incoming formats', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0001', secondaryPhoneNumber: '+13145551234' });
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(1);
                expect(results[0]).to.deep.equal({
                    name: 'First Last',
                    phones: ['(314) 555-0001', '(314) 555-1234'],
                    email: '',
                    address: '',
                    id: contact.id
                });
            });

            it('should map the contact name to nickName lastName if applicable', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', nickName: 'Joe', primaryPhoneNumber: '314-555-0000', primaryEmail: 'joe.last@mail.com' });
                
                await flush();
                const results = service.search('First');
                
                expect(results.length).to.equal(1);
                expect(results[0]).to.deep.equal({
                    name: 'Joe Last',
                    phones: ['(314) 555-0000'],
                    email: 'joe.last@mail.com',
                    address: '',
                    id: contact.id
                });
            });
        });

        describe('change event', () => {
            it('should return the updated change to a name', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                
                await flush();
                changeContact(contact, { firstName: 'Changed' });

                expect(service.search('First').length).to.equal(0);

                const results = service.search('Changed');
                expect(results.length).to.equal(1);
                expect(results[0].id).to.equal(contact.id);
            });
        });

        describe('remove event', () => {
            it('should not return removed contacts', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                
                await flush();
                removeContact(contact);

                expect(service.search('First').length).to.equal(0);
            });
        });

        describe('searchable fields', () => {
            it('should be searchable by phone number', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', primaryPhoneNumber: '314-555-0000' });
                
                await flush();

                expect(service.search('314555').length).to.equal(1); // ignores special characters inserted on contact creation
                expect(service.search('(314) 555').length).to.equal(1); // ignores special characters when searching
                expect(service.search('555').length).to.equal(1); // doesn't need to be start of phone number
                expect(service.search('314655').length).to.equal(0);
            });

            it('should be searchable by any name variation', async () => {
                const contact = createContact({ firstName: 'First', lastName: 'Last', nickName: 'Joey', primaryPhoneNumber: '314-555-0000' });
                
                await flush();

                expect(service.search('First').length).to.equal(1); // first name
                expect(service.search('irs').length).to.equal(1); // partial first name
                expect(service.search('Last').length).to.equal(1); // last name
                expect(service.search('as').length).to.equal(1); // partial last name
                expect(service.search('Joe').length).to.equal(1); // nick name
                expect(service.search('oe').length).to.equal(1); // partial nick name
                expect(service.search('First Last').length).to.equal(1); // first + last
                expect(service.search('Joey Last').length).to.equal(1); // nick + last
                expect(service.search('Firsty').length).to.equal(0);
            });
        });
    });
});
