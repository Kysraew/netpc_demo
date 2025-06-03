import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Dodaj useLocation
import type { ContactInfo } from "../../interfaces/ContactInfo";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

const ContactsPage = () => {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Do odświeżania stanu zalogowania

  // Stan do śledzenia, czy użytkownik jest zalogowany
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("authToken")
  );

  // Efekt do aktualizacji stanu isLoggedIn (np. po zalogowaniu/wylogowaniu na innej stronie)
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(!!localStorage.getItem("authToken"));
    };
    checkAuthStatus(); // Sprawdź przy montowaniu
    // Nasłuchuj zmian w localStorage z innych kart (opcjonalne, ale dobre)
    window.addEventListener("storage", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, [location.pathname]); // Odśwież, gdy zmieni się ścieżka

  useEffect(() => {
    const fetchContactsAsync = async () => {
      setIsLoading(true);
      setError(null);
      if (!apiUrl) {
        console.error("VITE_BACKEND_API_URL is not defined!");
        setError("API URL is not configured.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/contactinfo`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error while fetching contacts: ${response.status} ${response.statusText} - ${errorText}`
          );
        }
        const data: ContactInfo[] = await response.json();
        setContacts(data);
      } catch (err: any) {
        console.error("Error fetching contacts:", err);
        setError(err.message || "Failed to fetch contacts.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactsAsync();
  }, []);

  const handleEdit = (id: number) => {
    if (!isLoggedIn) {
      alert("Please log in to edit contacts.");
      navigate("/auth");
      return;
    }
    navigate(`/contact/update/${id}`);
  };

  const handleDetails = (id: number) => {
    navigate(`/contact/details/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!isLoggedIn) {
      alert("Please log in to delete contacts.");
      navigate("/auth");
      return;
    }
    if (!apiUrl) {
      console.error(
        "VITE_BACKEND_API_URL is not defined! Cannot delete contact."
      );
      alert("API URL is not configured.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken"); // Pobierz token do autoryzacji
      const response = await fetch(`${apiUrl}/contactinfo/${id}`, {
        method: "DELETE",
        headers: {
          // Dołącz token, jeśli API tego wymaga
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'application/json', // Niepotrzebne dla DELETE bez ciała
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Specjalna obsługa dla błędów autoryzacji
        if (response.status === 401 || response.status === 403) {
          alert(
            "You are not authorized to perform this action. Please log in again."
          );
          localStorage.removeItem("authToken"); // Usuń stary/nieważny token
          setIsLoggedIn(false); // Zaktualizuj stan
          navigate("/auth");
        } else {
          throw new Error(
            `HTTP error while deleting contact: ${response.status} ${response.statusText} - ${errorText}`
          );
        }
        return; // Zakończ, jeśli był błąd
      }
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== id)
      );
      alert("Contact deleted successfully.");
    } catch (err: any) {
      console.error(`Error deleting contact with ID ${id}:`, err);
      alert(
        err.message ||
          "An error occurred while deleting the contact. Check console."
      );
    }
  };

  const handleAddContact = () => {
    if (!isLoggedIn) {
      alert("Please log in to add new contacts.");
      navigate("/auth");
      return;
    }
    navigate("/contact/create");
  };

  if (isLoading) {
    return <p>Loading contacts...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Contact List</h2>
      {/* Przycisk dodawania - można go też dezaktywować lub zmienić tekst */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleAddContact}
          disabled={!isLoggedIn}
          title={!isLoggedIn ? "Log in to add contact" : ""}
        >
          Add New Contact
        </button>
        {!isLoggedIn && (
          <small style={{ marginLeft: "10px" }}>
            (Login required to add contacts)
          </small>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th> {/* Kolumna Actions zawsze widoczna */}
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.name || "-"}</td>
              <td>{contact.sureName || "-"}</td>
              <td>{contact.email}</td>
              <td>
                <button
                  onClick={() => handleDetails(contact.id)}
                  style={{ marginRight: "5px" }}
                >
                  Details
                </button>
                {/* Przyciski Edit i Delete są dezaktywowane dla niezalogowanych */}
                <button
                  onClick={() => handleEdit(contact.id)}
                  style={{ marginRight: "5px" }}
                  disabled={!isLoggedIn}
                  title={!isLoggedIn ? "Log in to edit" : ""}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  disabled={!isLoggedIn}
                  title={!isLoggedIn ? "Log in to delete" : ""}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {contacts.length === 0 && !isLoading && <p>No contacts to display.</p>}
    </div>
  );
};

export default ContactsPage;
