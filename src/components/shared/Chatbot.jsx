import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaHeart, FaLeaf } from "react-icons/fa";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your pangolin conservation assistant. How can I help you today? 🦎",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Predefined responses for common questions
  const botResponses = {
    hello: "Hello! Welcome to the Global Pangolin Protection Group. I'm here to help you learn about pangolins and conservation efforts. 🦎✨",
    hi: "Hi there! I'm excited to share information about pangolins with you. What would you like to know? 🌿",
    "what are pangolins":
      "Pangolins are unique mammals covered in scales made of keratin (the same material as human fingernails). They're often called 'scaly anteaters' and are the most trafficked mammals in the world. 🦎💚",
    "pangolin facts":
      "Here are some amazing pangolin facts:\n• They're the only mammals with scales 🐾\n• There are 8 species worldwide 🌍\n• They can roll into a ball for protection 🏀\n• They're excellent climbers and swimmers 🧗‍♂️🏊‍♂️\n• They eat ants and termites using their long sticky tongues 👅",
    conservation:
      "Pangolin conservation is crucial because:\n• They're critically endangered due to illegal trafficking 🚨\n• Their scales are used in traditional medicine 💊\n• Their meat is considered a delicacy in some cultures 🍽️\n• Habitat loss threatens their survival 🏠\n\nYou can help by supporting conservation organizations and spreading awareness! 💚",
    "how to help":
      "You can help pangolins by:\n• Supporting conservation organizations 🤝\n• Spreading awareness about their plight 📢\n• Avoiding products made from pangolin parts ❌\n• Reporting illegal wildlife trade 📞\n• Educating others about these amazing creatures 📚",
    species:
      "There are 8 pangolin species:\n\nAsian Pangolins:\n• Chinese Pangolin 🇨🇳\n• Sunda Pangolin 🇮🇩\n• Philippine Pangolin 🇵🇭\n• Indian Pangolin 🇮🇳\n\nAfrican Pangolins:\n• Giant Pangolin 🦁\n• Ground Pangolin 🌍\n• White-bellied Pangolin ⚪\n• Black-bellied Pangolin ⚫",
    habitat:
      "Pangolins live in various habitats:\n• Tropical and subtropical forests 🌴\n• Savannas and grasslands 🌾\n• Some species are arboreal (tree-dwelling) 🌳\n• Others are terrestrial (ground-dwelling) 🏔️\n• They're found in Africa and Asia 🌍",
    diet: "Pangolins are insectivores that primarily eat:\n• Ants and termites 🐜\n• Other small insects 🦗\n• They use their long sticky tongues to catch prey 👅\n• They can consume thousands of insects per day 🍽️",
    threats: "Pangolins face several threats:\n• Illegal wildlife trafficking 🚨\n• Habitat destruction 🏗️\n• Poaching for scales and meat 🎯\n• Climate change 🌡️\n• Human-wildlife conflict ⚔️",
    features:
      "This app includes:\n• Interactive maps showing pangolin habitats 🗺️\n• Photo gallery of pangolins 📸\n• Conservation activities and trends 📊\n• Reporting tools for sightings 📝\n• Educational resources 📚",
    map: "The map feature shows:\n• Pangolin habitat locations 🗺️\n• Conservation areas 🛡️\n• Recent sightings 👀\n• Protected zones 🚫\n• You can explore different regions and learn about local populations 🌍",
    gallery:
      "The gallery contains:\n• High-quality photos of different pangolin species 📸\n• Conservation activities 🏃‍♂️\n• Habitat images 🏞️\n• Educational content 📖\n• Beautiful wildlife photography 🎨",
    report: "You can report:\n• Pangolin sightings 👀\n• Illegal activities 🚨\n• Injured pangolins 🏥\n• Conservation concerns ⚠️\n• Your reports help protect these animals 🛡️",
    activities: "Conservation activities include:\n• Habitat restoration 🌱\n• Anti-poaching efforts 🚫\n• Community education 👥\n• Research projects 🔬\n• Wildlife rehabilitation 🏥",
    trends: "Current conservation trends:\n• Increasing awareness 📈\n• Stronger legal protections ⚖️\n• Technology for monitoring 📱\n• Community involvement 🤝\n• International cooperation 🌐",
    default:
      "I'm here to help you learn about pangolins and conservation! You can ask me about:\n• Pangolin facts and species 🦎\n• Conservation efforts 🌿\n• How to help 🤝\n• App features 📱\n• Threats to pangolins ⚠️\n\nWhat would you like to know?",
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for exact matches first
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Check for partial matches
    if (lowerMessage.includes("help") || lowerMessage.includes("assist")) {
      return botResponses["default"];
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! I'm always here to help with your pangolin conservation questions. 💚🦎";
    }

    if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
      return "Goodbye! Thank you for your interest in pangolin conservation. Keep learning and helping these amazing creatures! 🌿🦎✨";
    }

    return "That's an interesting question! While I'm focused on pangolin conservation, I'd be happy to help you with questions about pangolins, their habitats, conservation efforts, or how you can help protect these amazing animals. 🦎💚";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Animated Pangolin Component
  const AnimatedPangolin = ({ showParticles = false }) => (
    <div className="relative w-16 h-16">
      {/* Pangolin Body */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse"></div>

      {/* Scales */}
      <div className="absolute inset-1 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-80"></div>
      <div className="absolute inset-2 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-60"></div>

      {/* Eyes */}
      <div className="absolute top-3 left-3 w-2 h-2 bg-black rounded-full animate-blink"></div>
      <div
        className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full animate-blink"
        style={{ animationDelay: "0.5s" }}></div>

      {/* Nose */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>

      {/* Tail */}
      <div className="absolute -bottom-2 -right-2 w-8 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transform rotate-12 animate-wiggle"></div>

      {/* Floating particles */}
      {showParticles && (
        <>
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-float opacity-70"></div>
          <div
            className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-400 rounded-full animate-float opacity-60"
            style={{ animationDelay: "0.3s" }}></div>
          <div
            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float opacity-50"
            style={{ animationDelay: "0.6s" }}></div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full p-4 shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-green-500/50 group"
        aria-label="Toggle chatbot">
        <div className="relative">
          {isOpen ? (
            <FaTimes
              size={24}
              className="animate-spin-in"
            />
          ) : (
            <div className="relative">
              <FaComments
                size={24}
                className="animate-bounce"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
          )}
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-200 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            <div className="flex items-center space-x-3 relative z-10">
              <div className="animate-bounce">
                <AnimatedPangolin showParticles={showParticles} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pangolin Assistant</h3>
                <p className="text-xs opacity-80 flex items-center">
                  <FaHeart className="text-red-400 mr-1 animate-pulse" />
                  Conservation Helper
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors duration-300 hover:scale-110">
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
                    message.sender === "user" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-white text-gray-800 border border-green-100"
                  }`}>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2 flex items-center">
                    <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {message.sender === "bot" && <FaLeaf className="ml-2 text-green-500 animate-pulse" />}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white text-gray-800 border border-green-100 p-3 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-2">
                    <AnimatedPangolin showParticles={false} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-green-100 bg-white/80 backdrop-blur-sm rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about pangolins or conservation..."
                className="flex-1 px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-green-500/50">
                <FaPaperPlane
                  size={16}
                  className="animate-pulse"
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <FaLeaf className="mr-1 text-green-500" />
              Try asking: "What are pangolins?", "How can I help?", or "Tell me about conservation"
            </p>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-in {
          from {
            transform: rotate(0deg) scale(0.8);
            opacity: 0;
          }
          to {
            transform: rotate(360deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes blink {
          0%,
          50%,
          100% {
            opacity: 1;
          }
          25%,
          75% {
            opacity: 0.3;
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(12deg);
          }
          50% {
            transform: rotate(15deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-spin-in {
          animation: spin-in 0.5s ease-out;
        }

        .animate-blink {
          animation: blink 2s infinite;
        }

        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
