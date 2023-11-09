import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
// import Footer from "./components/Footer";
import Debug from "./pages/Debug";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
        <div className="flex flex-col h-screen">
            <Header />
            <div className="grow">
                <Routes>
                    <Route path="/" element={<Debug />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
            { /* <Footer /> */ }
        </div>
    </Router>
  );
}

export default App;
