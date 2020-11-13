export default class {
    constructor(updates, service) {
        this.state = {
            contacts: []
        };

        updates.on('add', (id) => {
            service.getById(id).then(
                (contact) => { 
                    this.state = addContact(this.state, contact);
                }
            )
        });

        updates.on('change', (id, field, value) => {
            this.state = updateContact(this.state, id, field, value);
        });

        updates.on('remove', (id) => {
            this.state = removeContact(this.state, id);
        });

        function addContact(state, contact) {
            return {
                ...state,
                contacts: [
                    ...state.contacts,
                    contact
                ]
            }
        }

        function updateContact(state, id, field, value) {
            return {
                ...state,
                contacts: state.contacts.map((contact) => {
                    if(contact.id === id) {
                        const newContact = {
                            ...contact
                        };
                        newContact[field] = value;
                        return newContact;
                    }
                    return contact;
                })
            }
        }

        function removeContact(state, id) {
            return {
                ...state,
                contacts: state.contacts.filter((contact) => {
                    if(contact.id === id) {
                        return false;
                    }
                    return true;
                })
            }
        }
    }

    search(query) {
        return this.state.contacts
            .filter(isMatch)
            .map(mapContact)

        function isMatch(contact) {
            if(stripDigits(query) && stripNonDigits(query)) {
                if(isNameMatch(contact.firstName, contact.lastName, contact.nickName, query)
                    && isPhoneNumberMatch(contact.primaryPhoneNumber, query)) {
                        return true;
                    }
                return false;
            }
            if(isNameMatch(contact.firstName, contact.lastName, contact.nickName, query)) {
                return true;
            }
            if(isPhoneNumberMatch(contact.primaryPhoneNumber, query)) {
                return true;
            }
            return false;
        }

        function mapContact(contact) {
            return {
                id: contact.id,
                role: contact.role,
                address: "",
                email: contact.emailAddress || "",
                name: nameFrom(contact.firstName, contact.lastName, contact.nickName),
                phones: phoneArrayFrom(contact.primaryPhoneNumber, contact.secondaryPhoneNumber)
            }
        }

        function phoneArrayFrom(primary, secondary) {
            let result = [];
            if (primary) {
                result.push(parsePhoneNumber(primary));
            }
            if (secondary) {
                result.push(parsePhoneNumber(secondary));
            }
            return result;
        }

        function parsePhoneNumber(phone) {
            const parsedNumber = stripNonDigits(phone);
            let index = 0;
            if(parsedNumber.length > 10) {
                index = parsedNumber.length - 10;
            }
            const areaCode = parsedNumber.slice(index, index + 3);
            const exchangeCode = parsedNumber.slice(index + 3, index + 6);
            const lineNumber = parsedNumber.slice(index + 6, index + 10);
            return `(${areaCode}) ${exchangeCode}-${lineNumber}`;
        }

        function nameFrom(firstName, lastName, nickName) {
            if(nickName && nickName.trim()) {
                return `${nickName} ${lastName}`;
            } else {
                return `${firstName} ${lastName}`;
            }
        }

        function isNameMatch(firstName, lastName, nickName, query) {
            if(!stripDigits(query)) {
                return false;
            }
            if(nameFrom(firstName, lastName).includes(stripDigits(query))) {
                return true;
            }
            if(nameFrom(firstName, lastName, nickName).includes(stripDigits(query))) {
                return true;
            }
            return false;
        }

        function isPhoneNumberMatch(phoneNumber, query) {
            if(!stripNonDigits(phoneNumber) || !stripNonDigits(query)) {
                return false;
            }
            if(stripNonDigits(phoneNumber).includes(stripNonDigits(query))) {
                return true;
            }
            return false;
        }

        function stripNonDigits(stringToStrip) {
            if(!stringToStrip) {
                return "";
            }
            return stringToStrip.replace(/\D/g, "");
        }

        function stripDigits(stringToStrip) {
            if(!stringToStrip) {
                return "";
            }
            return stringToStrip.replace(/[^A-Za-z\s]/g, "").trim();
        }
    }
}
