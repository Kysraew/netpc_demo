import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom"; // Dodano useLocation i useNavigate
import type { ContactInfo } from "../../interfaces/ContactInfo"; // Upewnij się, że ścieżka jest poprawna

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

const ContactDetailsPage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation(); // Hook do śledzenia zmian ścieżki (dla odświeżenia stanu logowania)
  const navigate = useNavigate(); // Hook do nawigacji

  // Stan do śledzenia, czy użytkownik jest zalogowany
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("authToken")
  );

  // Efekt do aktualizacji stanu isLoggedIn
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(!!localStorage.getItem("authToken"));
    };
    checkAuthStatus(); // Sprawdź przy montowaniu
    window.addEventListener("storage", checkAuthStatus); // Nasłuchuj zmian w localStorage z innych kart
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, [location.pathname]); // Odśwież, gdy zmieni się ścieżka

  useEffect(() => {
    if (!contactId) {
      setError("Contact ID is missing.");
      setLoading(false);
      return;
    }

    if (!apiUrl) {
      console.error("VITE_BACKEND_API_URL is not defined!");
      setError("API URL is not configured.");
      setLoading(false);
      return;
    }

    const fetchContactDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Zakładamy, że ten endpoint jest publiczny lub obsługa 401/403 jest gdzie indziej
        // Jeśli ten endpoint wymaga autoryzacji, token powinien być dołączony tutaj.
        const response = await fetch(`${apiUrl}/contactinfo/${contactId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! Status: ${response.status} - ${errorText}`
          );
        }
        const data: ContactInfo = await response.json();
        setContact(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        console.error("Failed to fetch contact details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactDetails();
  }, [contactId]); // Zależność tylko od contactId

  const handleEditClick = () => {
    if (!isLoggedIn) {
      alert("Please log in to edit contacts.");
      navigate("/auth");
      return;
    }
    if (contact) {
      navigate(`/contact/update/${contact.id}`);
    }
  };

  if (loading) {
    return <p>Loading contact details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!contact) {
    return <p>Contact not found.</p>;
  }

  return (
    <div>
      <h2>Contact Details</h2>
      <p>
        <strong>ID:</strong> {contact.id}
      </p>
      <p>
        <strong>Name:</strong> {contact.name || "-"}
      </p>
      <p>
        <strong>Surname:</strong> {contact.sureName || "-"}
      </p>
      <p>
        <strong>Email:</strong> {contact.email}
      </p>
      <p>
        <strong>Phone Number:</strong> {contact.phoneNumber || "-"}
      </p>
      <p>
        <strong>Birth Date:</strong>{" "}
        {contact.birthDate
          ? new Date(contact.birthDate).toLocaleDateString() // Użyj toLocaleDateString dla lepszego formatowania daty
          : "-"}
      </p>
      <p>
        <strong>Category ID:</strong> {contact.categoryId}
      </p>
      {/* Sprawdź, czy obiekt 'category' istnieje i czy ma właściwość 'name' */}
      {contact.category && typeof contact.category.name === "string" && (
        <p>
          <strong>Category Name:</strong> {contact.category.name}
        </p>
      )}
      <br />
      <Link to="/contacts">Back to List</Link>

      {/* Warunkowe renderowanie linku/przycisku "Edit Contact" */}
      {isLoggedIn && (
        <>
          {" | "}
          {/* Można użyć Link lub buttona z navigate */}
          <button
            onClick={handleEditClick}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
              marginLeft: "5px",
            }}
          >
            Edit Contact
          </button>
          {/* Alternatywnie, jeśli chcesz użyć Link: */}
          {/* <Link to={`/contact/update/${contact.id}`}>Edit Contact</Link> */}
        </>
      )}
    </div>
  );
};

export default ContactDetailsPage;
