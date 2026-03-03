import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mountain, Lock } from "lucide-react";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/");
    } else {
      setError("Invalid credentials. Use user / password");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-forest mb-4">
            <Mountain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground font-display">
            Trekking Ally
          </h1>
          <p className="text-primary-foreground/70 mt-1 text-sm">Navigate the Open Wild</p>
        </div>

        <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 shadow-elevated">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold font-display">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="user"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full gradient-forest text-primary-foreground rounded-lg py-2.5 font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            MVP Test Account: <span className="font-mono">user</span> / <span className="font-mono">password</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
