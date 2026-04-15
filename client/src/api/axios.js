import axios from "axios";

const API = axios.create({
  baseURL: "https://trello-clone-yunl.onrender.com/api",
});

export default API;