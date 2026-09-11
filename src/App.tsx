import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import FestivalDetails from "./pages/FestivalDetails"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/festivals/:id"
                    element={<FestivalDetails />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App