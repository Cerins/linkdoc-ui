import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
// import Footer from "./components/Footer";
import Debug from "./pages/Debug";
import Login from "./pages/Login";
import PrivatePath from "./components/PrivatePath";
import Collections from "./pages/Collections";
import Collection from "./pages/Collections/Collection";

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PrivatePath>
                            <Debug />
                        </PrivatePath>
                    }
                />
                <Route
                    path="/collections"
                    element={
                        <PrivatePath>
                            <Collections />
                        </PrivatePath>
                    }
                />
                <Route
                    path="/collections/:uuid"
                    element={
                        <PrivatePath>
                            <Collection />
                        </PrivatePath>
                    }
                />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
