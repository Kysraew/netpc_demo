import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar";
import AuthPage from "../pages/AuthPage/AuthPage";
import ContactsPage from "../pages/ContactsPage/ContactsPage";
import ContactsDetailsPage from "../pages/ContactsDetailsPage/ContactsDetailsPage";
import ContactsUpdatePage from "../pages/ContactsUpdatePage/ContactsUpdate";
import ContactsCreatePage from "../pages/ContactsCreatePage/ContactsCreatePage";

function App() {
  return (
    <>
      <Router>
        <h1>Contact infos</h1>
        <NavBar />

        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route
            path="/contact/details/:contactId"
            element={<ContactsDetailsPage />}
          />
          <Route path="/contact/create" element={<ContactsCreatePage />} />
          <Route
            path="/contact/update/:contactId"
            element={<ContactsUpdatePage />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
