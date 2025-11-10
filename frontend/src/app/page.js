'use client';

import ContactForm from '@/components/dashboard/ContactForm';
import ContactList from '@/components/dashboard/ContactList';
import ContactStats from '@/components/dashboard/ContactStats';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import SearchBar from '@/components/dashboard/SearchBar';
import Pagination from '@/components/dashboard/Pagination';
import Sorting from '@/components/dashboard/Sorting';
import { useState, useEffect } from 'react';

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  // API base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/contacts?page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}&order=${sortOrder}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new contact
  const createContact = async (contactData) => {
    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create contact');
      }

      const data = await response.json();
      setContacts([data.data, ...contacts]);
      setShowForm(false);
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error creating contact:', err);
      return { success: false, message: err.message };
    }
  };

  // Update contact
  const updateContact = async (id, contactData) => {
    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contact');
      }

      const data = await response.json();
      setContacts(contacts.map(contact => 
        contact._id === id ? data.data : contact
      ));
      setEditingContact(null);
      setShowForm(false); // Close the modal after successful update
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error updating contact:', err);
      return { success: false, message: err.message };
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(contacts.filter(contact => contact._id !== id));
      return { success: true, message: 'Contact deleted successfully' };
    } catch (err) {
      console.error('Error deleting contact:', err);
      return { success: false, message: err.message };
    }
  };

  // Load contacts on component mount and when page/sort changes
  useEffect(() => {
    fetchContacts();
  }, [currentPage, sortBy, sortOrder]);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  // Handle form submission
  const handleFormSubmit = async (contactData) => {
    if (editingContact) {
      return await updateContact(editingContact._id, contactData);
    } else {
      return await createContact(contactData);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle sort change
  const handleSortChange = (newSortBy, newOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Handle edit contact
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contact Book
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your contacts with style and ease
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && !error && (
          <ContactStats 
            totalContacts={totalCount}
            recentContacts={contacts.filter(c => 
              new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length}
          />
        )}

        {/* Search, Sort and Add Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="flex gap-2">
            <Sorting 
              sortBy={sortBy}
              order={sortOrder}
              onSortChange={handleSortChange}
            />
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Contact
              </span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && <LoadingSpinner />}

        {/* Contact Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
              <ContactForm
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
                initialData={editingContact}
              />
            </div>
          </div>
        )}

        {/* Contact List */}
        {!loading && !error && (
          <>
            <ContactList
              contacts={filteredContacts}
              onDelete={deleteContact}
              onEdit={handleEditContact}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Empty State */}
        {!loading && !error && filteredContacts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No contacts found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No contacts match "${searchTerm}"` : 'Get started by adding your first contact'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
