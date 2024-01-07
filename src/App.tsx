import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Footer from "./components/Footer";
// import Debug from "./pages/Debug";
import Login from "./pages/Login";
import PrivatePath from "./components/PrivatePath";
import Collections from "./pages/Collections";
import Collection from "./pages/Collections/Collection";
import NotFound from "./pages/404";
import Logout from "./pages/Logout";

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PrivatePath>
                            <Collections />
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
                    path="/collections/:uuid/:docName"
                    element={
                        <PrivatePath>
                            <Collection />
                        </PrivatePath>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
