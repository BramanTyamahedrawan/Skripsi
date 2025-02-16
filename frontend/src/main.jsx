import { createRoot } from "react-dom/client";
import App from "./App";
// import "antd/dist/reset.css"; // Antd v5
import "@/styles/index.less"; // Pastikan file ini benar-benar ada

createRoot(document.getElementById("root")).render(<App />);
