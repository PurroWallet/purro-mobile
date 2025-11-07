import { EventEmitter } from 'events';
import { secureWalletStorage } from '../storage/secureStorage';

export interface Contact {
  address: string;
  name: string;
  isAlias?: boolean;
  brandName?: string;
}

/**
 * Contact Book Service - Manages wallet contacts and aliases
 * Following Rabby's architecture but optimized for mobile
 */
export class ContactBookService extends EventEmitter {
  private contacts: Contact[] = [];

  constructor() {
    super();
    this.loadContacts();
  }

  // Load contacts from storage
  private loadContacts(): void {
    const storedContacts = secureWalletStorage.getItem<Contact[]>('contacts');
    if (storedContacts) {
      this.contacts = storedContacts;
    }
  }

  // Save contacts to storage
  private saveContacts(): void {
    secureWalletStorage.setItem('contacts', this.contacts);
  }

  // Get all contacts
  getAllContacts(): Contact[] {
    return [...this.contacts];
  }

  // Get contact by address
  getContactByAddress(address: string): Contact | null {
    return (
      this.contacts.find((contact) => contact.address.toLowerCase() === address.toLowerCase()) ||
      null
    );
  }

  // Add contact
  addContact(contact: Contact): void {
    // Check if contact already exists
    const existingIndex = this.contacts.findIndex(
      (c) => c.address.toLowerCase() === contact.address.toLowerCase(),
    );

    if (existingIndex >= 0) {
      // Update existing contact
      this.contacts[existingIndex] = { ...contact };
    } else {
      // Add new contact
      this.contacts.push({ ...contact });
    }

    this.saveContacts();
    this.emit('contactAdded', contact);
  }

  // Update contact
  updateContact(address: string, updates: Partial<Contact>): boolean {
    const index = this.contacts.findIndex(
      (contact) => contact.address.toLowerCase() === address.toLowerCase(),
    );

    if (index >= 0) {
      this.contacts[index] = { ...this.contacts[index], ...updates };
      this.saveContacts();
      this.emit('contactUpdated', this.contacts[index]);
      return true;
    }

    return false;
  }

  // Remove contact
  removeContact(address: string): boolean {
    const index = this.contacts.findIndex(
      (contact) => contact.address.toLowerCase() === address.toLowerCase(),
    );

    if (index >= 0) {
      const removedContact = this.contacts[index];
      this.contacts.splice(index, 1);
      this.saveContacts();
      this.emit('contactRemoved', removedContact);
      return true;
    }

    return false;
  }

  // Remove contact by address (alias for consistency)
  removeContactByAddress(address: string): boolean {
    return this.removeContact(address);
  }

  // Get cache alias (temporary alias stored in memory)
  getCacheAlias(address: string): string | null {
    const cacheKey = `alias_cache_${address.toLowerCase()}`;
    return secureWalletStorage.getItem<string>(cacheKey);
  }

  // Set cache alias (temporary alias stored in memory)
  setCacheAlias(address: string, alias: string): void {
    const cacheKey = `alias_cache_${address.toLowerCase()}`;
    secureWalletStorage.setItem(cacheKey, alias);
  }

  // Remove cache alias
  removeCacheAlias(address: string): void {
    const cacheKey = `alias_cache_${address.toLowerCase()}`;
    secureWalletStorage.removeItem(cacheKey);
  }

  // Clear all contacts
  clearAll(): void {
    this.contacts = [];
    this.saveContacts();
    this.emit('cleared');
  }

  // Import contacts from array
  importContacts(contacts: Contact[]): void {
    for (const contact of contacts) {
      this.addContact(contact);
    }
  }

  // Export contacts to array
  exportContacts(): Contact[] {
    return this.getAllContacts();
  }
}

export const contactBookService = new ContactBookService();
