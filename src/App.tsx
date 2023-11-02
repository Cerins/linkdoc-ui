import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
// import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
        <div className="flex flex-col h-screen">
            <Header />
            <div className="grow">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
            { /* <Footer /> */ }
        </div>
    </Router>
  );
}

export default App;
