const baseProps = {
    firstName: '',
    lastName: '',
    nickName: '',
    role: 'Employee',
    primaryPhoneNumber: '',
    secondaryPhoneNumber: '',
    primaryEmail: '',
    secondaryEmail: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    zipCode: ''
};

export default class Contact {
    constructor(id, props) {
        Object.assign(this, baseProps, props);
        this.id = id;
    }
}