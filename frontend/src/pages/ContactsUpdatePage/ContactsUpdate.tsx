import React, {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Category } from "../../interfaces/Category"; // UPEWNIJ SIĘ, ŻE ŚCIEŻKA JEST POPRAWNA
import type { ContactInfo } from "../../interfaces/ContactInfo"; // UPEWNIJ SIĘ, ŻE ŚCIEŻKA JEST POPRAWNA

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

// Typ dla danych formularza - Partial, bo dane są ładowane
// i nie chcemy obiektu 'category', tylko 'categoryId'
type ContactUpdateFormData = Omit<Partial<ContactInfo>, "category"> & {
  categoryId: number | 0;
};

const ContactsUpdatePage: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>(); // contactId z URL jest stringiem
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ContactUpdateFormData>({
    // Inicjalizacja pustymi wartościami lub placeholderami
    name: "",
    sureName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    categoryId: 0,
    // 'id' zostanie dodane po pobraniu danych
  });
  const [categoriesForSelect, setCategoriesForSelect] = useState<Category[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contactId) {
      setError("Contact ID is missing from URL.");
      setIsLoading(false);
      return;
    }

    if (!apiUrl) {
      console.error("VITE_BACKEND_API_URL is not defined!");
      setError("API URL is not configured.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [contactRes, allCategoriesRes] = await Promise.all([
          fetch(`${apiUrl}/contactinfo/${contactId}`), // GET do pobrania danych kontaktu
          fetch(`${apiUrl}/category`), // GET do pobrania kategorii
        ]);

        if (!contactRes.ok) {
          throw new Error(
            `Failed to fetch contact: ${
              contactRes.status
            } ${await contactRes.text()}`
          );
        }
        if (!allCategoriesRes.ok) {
          throw new Error(
            `Failed to fetch categories: ${
              allCategoriesRes.status
            } ${await allCategoriesRes.text()}`
          );
        }

        const contactData: ContactInfo = await contactRes.json();
        const allCategoriesData: Category[] = await allCategoriesRes.json();

        setFormData({
          id: contactData.id, // Kluczowe dla wysłania w PUT
          name: contactData.name || "",
          sureName: contactData.sureName || "",
          email: contactData.email,
          phoneNumber: contactData.phoneNumber || "",
          birthDate: contactData.birthDate
            ? new Date(contactData.birthDate).toISOString().split("T")[0]
            : "",
          categoryId: contactData.categoryId || 0,
        });
        setCategoriesForSelect(allCategoriesData);
      } catch (err: any) {
        console.error("Fetch data error:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [contactId]); // Uruchom ponownie, jeśli contactId się zmieni

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.email) {
      alert("Email is required.");
      return;
    }
    if (!formData.categoryId || formData.categoryId === 0) {
      alert("A valid Category is required.");
      return;
    }
    if (!formData.id) {
      // Sprawdzenie, czy ID kontaktu jest dostępne
      alert("Contact ID is missing. Cannot update.");
      setError("Contact ID is missing in form data. Cannot update.");
      return;
    }
    if (!apiUrl) {
      console.error("VITE_BACKEND_API_URL is not defined!");
      alert("API URL is not configured. Cannot update contact.");
      setError("API URL is not configured. Cannot update contact.");
      return;
    }

    // Przygotowujemy payload zgodnie z oczekiwaniami backendu (zawiera ID)
    const payloadToSend = {
      id: formData.id, // WAŻNE: ID jest częścią ciała żądania
      name: formData.name === "" ? null : formData.name,
      sureName: formData.sureName === "" ? null : formData.sureName,
      email: formData.email,
      phoneNumber: formData.phoneNumber === "" ? null : formData.phoneNumber,
      birthDate: formData.birthDate === "" ? null : formData.birthDate,
      categoryId: formData.categoryId,
      // UWAGA: Rozważ obsługę pola 'password', jeśli istnieje w Twoim modelu ContactInfo
      // Jeśli nie chcesz go aktualizować, a API go oczekuje, możesz potrzebować wysłać null
      // lub Twój backend powinien ignorować to pole przy aktualizacji (np. przez [JsonIgnore]
      // lub poprzez selektywną aktualizację pól w metodzie Update backendu).
      // password: null, // Przykład, jeśli API oczekuje tego pola
    };

    try {
      // URL dla PUT nie zawiera ID w ścieżce, ID jest w ciele
      const res = await fetch(`${apiUrl}/contactinfo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed: ${res.status} - ${errorText}`);
      }

      // Jeśli backend zwraca 204 No Content, .json() rzuci błędem.
      // Można dodać logikę, jeśli potrzebujesz danych zwrotnych.
      // if (res.status === 200) {
      //   const updatedData = await res.json();
      //   console.log('Contact updated:', updatedData);
      // }

      navigate(`/contact/details/${formData.id}`); // Lub do listy kontaktów: navigate("/contacts");
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Update error. Check console."); // Ustaw stan błędu
      alert(err.message || "Update error. Check console.");
    }
  };

  if (isLoading) {
    return <p>Loading contact data...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Dodatkowe sprawdzenie, czy dane się załadowały
  if (!formData.id && contactId) {
    return <p>Contact not found or still loading...</p>;
  }

  return (
    <div>
      <h2>Update Contact (ID: {formData.id || "N/A"})</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="sureName">Surname:</label>
          <input
            id="sureName"
            name="sureName"
            value={formData.sureName || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone:</label>
          <input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="birthDate">Birth Date:</label>
          <input
            id="birthDate"
            type="date"
            name="birthDate"
            value={formData.birthDate || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="categoryId">Category:</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId || 0}
            onChange={handleChange}
            required
          >
            <option value={0} disabled>
              {" "}
              -- Select Category --{" "}
            </option>
            {categoriesForSelect.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name || "Unnamed Category"}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Update Contact</button>
      </form>
    </div>
  );
};

export default ContactsUpdatePage;
