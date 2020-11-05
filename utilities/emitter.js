// NOTE: Pretend as though you do not have permission to edit this file.
export default class {
    constructor() {
        this.listeners = {};
    }
    
    emit(event, ...values) {
        if (event in this.listeners) {
            this.listeners[event].forEach(f => f(...values));
        }
    }
    
    on(event, listener) {
        if (!(event in this.listeners)) {
            this.listeners[event] = [];
        }
        
        this.listeners[event].push(listener);
        
        return () => this.listeners[event].remove(listener);
    }
}
