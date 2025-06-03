import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

const AuthPage = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null); // Stan do wyświetlania błędów
  const [isLoading, setIsLoading] = useState<boolean>(false); // Stan ładowania
  const navigate = useNavigate(); // Inicjalizacja hooka useNavigate

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Zresetuj błąd przed nową próbą
    setIsLoading(true);

    if (!apiUrl) {
      console.error("VITE_BACKEND_API_URL is not defined! Cannot log in.");
      setError("API URL is not configured. Cannot log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        // Endpoint logowania
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // Wysyłamy username i password
      });

      if (!response.ok) {
        // Jeśli status to 401 Unauthorized lub inny błąd klienta
        if (response.status === 401) {
          const errorData = await response.text(); // Backend może zwrócić tekst "Wrong username or password."
          setError(errorData || "Invalid username or password.");
        } else {
          const errorText = await response.text();
          throw new Error(
            `Login failed: ${response.status} ${response.statusText} - ${errorText}`
          );
        }
        setIsLoading(false);
        return;
      }

      // Logowanie powiodło się, serwer powinien zwrócić token
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("authToken", data.token); // Zapisz token w localStorage
        console.log("Login successful, token saved.");
        // Możesz tutaj ustawić stan globalny/kontekst informujący o zalogowaniu
        navigate("/contacts"); // Przekieruj na stronę kontaktów
      } else {
        setError("Login successful, but no token received.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log("--- Komponent AuthPage jest renderowany ---");
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username-input">Username:</label>
          <input
            type="text"
            id="username-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required // Dodajemy wymagalność
          />
        </div>
        <div>
          <label htmlFor="password-input">Password:</label>
          <input
            type="password"
            id="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required // Dodajemy wymagalność
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}{" "}
        {/* Wyświetlanie błędu */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
