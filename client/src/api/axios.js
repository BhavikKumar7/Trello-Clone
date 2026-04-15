import axios from "axios";

const API = axios.create({
  baseURL: "https://trello-clone-yunl.onrender.com/api" || "http://localhost:5000/api",
});

export default API;