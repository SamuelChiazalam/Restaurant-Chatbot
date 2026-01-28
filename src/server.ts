import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`
                            
  🍽️  Restaurant Chatbot Server Started! 🤖            

  Server running on http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || "development"}
  `);
});
