import React, {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../interfaces/Category"; // Upewnij się, że ścieżka jest poprawna

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

interface ContactCreateFormState {
  name: string;
  sureName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  categoryId: number | 0;
  newCategoryName: string;
}

const ContactsCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContactCreateFormState>({
    name: "",
    sureName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    categoryId: 0,
    newCategoryName: "",
  });
  const [categoriesForSelect, setCategoriesForSelect] = useState<Category[]>(
    []
  );
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [otherCategoryId, setOtherCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true); // Ustawienie ładowania na początku
      setErrorCategories(null); // Resetowanie błędu

      if (!apiUrl) {
        console.error(
          "VITE_BACKEND_API_URL is not defined! Cannot fetch categories."
        );
        setErrorCategories("API URL is not configured.");
        setLoadingCategories(false);
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/category`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Fetch categories error: ${res.status} - ${errorText}`
          );
        }
        const data: Category[] = await res.json();
        setCategoriesForSelect(data);

        const otherCategory = data.find(
          (cat) =>
            typeof cat.name === "string" && cat.name.toLowerCase() === "other"
        );

        if (otherCategory) {
          setOtherCategoryId(otherCategory.id);
        } else {
          console.warn(
            "Category 'Other' not found in fetched categories, or category objects are missing 'name' property. Custom category creation might not work as expected."
          );
        }
      } catch (err: any) {
        console.error("Fetch categories error:", err);
        setErrorCategories(err.message || "Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []); // Pusta tablica zależności, aby uruchomić tylko raz

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
    if (formData.categoryId === 0) {
      alert("A valid Category is required.");
      return;
    }
    if (
      formData.categoryId === otherCategoryId &&
      !formData.newCategoryName.trim()
    ) {
      alert(
        "Please enter a name for the new category when 'Other' is selected."
      );
      return;
    }
    if (!apiUrl) {
      console.error("VITE_BACKEND_API_URL is not defined!");
      alert("API URL is not configured.");
      return;
    }

    setIsSubmitting(true);
    let finalCategoryId: number = formData.categoryId;

    try {
      if (
        formData.categoryId === otherCategoryId &&
        formData.newCategoryName.trim()
      ) {
        const newCategoryPayload = {
          name: formData.newCategoryName.trim(),
          ParentCategoryId: otherCategoryId, // Ustawia "Other" jako rodzica nowej kategorii
        };
        const categoryRes = await fetch(`${apiUrl}/category`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCategoryPayload),
        });

        if (!categoryRes.ok) {
          const errorText = await categoryRes.text();
          throw new Error(
            `Failed to create custom category: ${categoryRes.status} - ${errorText}`
          );
        }
        const createdCategory: Category = await categoryRes.json();
        finalCategoryId = createdCategory.id;

        const updatedCategories = [...categoriesForSelect, createdCategory];
        setCategoriesForSelect(updatedCategories);
        setFormData((prev) => ({
          ...prev,
          categoryId: finalCategoryId,
          newCategoryName: "",
        }));
      }

      const contactPayload = {
        name: formData.name === "" ? null : formData.name,
        sureName: formData.sureName === "" ? null : formData.sureName,
        email: formData.email,
        phoneNumber: formData.phoneNumber === "" ? null : formData.phoneNumber,
        birthDate: formData.birthDate === "" ? null : formData.birthDate,
        categoryId: finalCategoryId,
      };

      const contactCreateRes = await fetch(`${apiUrl}/contactinfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactPayload),
      });

      if (!contactCreateRes.ok) {
        const errorText = await contactCreateRes.text();
        throw new Error(
          `Create contact failed: ${contactCreateRes.status} - ${errorText}`
        );
      }

      navigate("/contacts");
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(err.message || "An error occurred. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCategories) return <p>Loading categories...</p>;
  if (errorCategories)
    return <p>Error loading categories: {errorCategories}</p>;

  const showNewCategoryNameInput =
    formData.categoryId === otherCategoryId && otherCategoryId !== null;

  return (
    <div>
      <h2>Create New Contact</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="sureName">Surname:</label>
          <input
            id="sureName"
            name="sureName"
            value={formData.sureName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
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
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="birthDate">Birth Date:</label>
          <input
            id="birthDate"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="categoryId">Category:</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
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

        {showNewCategoryNameInput && (
          <div>
            <label htmlFor="newCategoryName">
              Custom Category Name (under "Other"):
            </label>
            <input
              id="newCategoryName"
              type="text"
              name="newCategoryName"
              value={formData.newCategoryName}
              onChange={handleChange}
              placeholder="Enter name for your category"
              required={showNewCategoryNameInput}
            />
          </div>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Contact"}
        </button>
      </form>
    </div>
  );
};

export default ContactsCreatePage;
