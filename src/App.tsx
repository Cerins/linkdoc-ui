import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Footer from "./components/Footer";
import Debug from "./pages/Debug";
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
                {/* TODO actually this can continue to be private path, but i need to find a way to start a session without auth and with auth */ }
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
