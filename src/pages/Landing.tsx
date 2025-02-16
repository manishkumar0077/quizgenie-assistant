
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Book, Laptop } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const fullText = "Your AI Study Companion";

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-200 overflow-hidden">
      <nav className="p-4 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Studify
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="font-bold text-purple-700 hover:text-purple-900"
          >
            Login
          </Button>
        </motion.div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-6xl font-bold text-purple-900 mb-4 filter drop-shadow-lg">
              Welcome to
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Studify
              </span>
            </h1>
            
            <div className="h-8 font-mono text-2xl text-purple-800">
              {text}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                |
              </motion.span>
            </div>

            <p className="text-lg text-purple-800 mb-8">
              Transform your study materials into interactive learning experiences with AI-powered analysis and chat assistance.
            </p>

            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <Sparkles className="mr-2" /> Get Started
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white/20 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/30 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: <Brain className="w-8 h-8 text-purple-600" />,
                    title: "AI Analysis",
                    desc: "Smart document processing"
                  },
                  {
                    icon: <Book className="w-8 h-8 text-pink-600" />,
                    title: "Study Tools",
                    desc: "Interactive learning aids"
                  },
                  {
                    icon: <Laptop className="w-8 h-8 text-blue-600" />,
                    title: "Chat Support",
                    desc: "24/7 AI assistance"
                  },
                  {
                    icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
                    title: "Smart Notes",
                    desc: "Automated summaries"
                  }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-white/40 backdrop-blur-sm p-4 rounded-xl"
                  >
                    {feature.icon}
                    <h3 className="font-bold mt-2 text-purple-900">{feature.title}</h3>
                    <p className="text-sm text-purple-800">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-20 right-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
