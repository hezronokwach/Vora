'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MessageCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';

const voiceExamples = [
  "Show me comfortable dresses under $100",
  "I'm looking for something in red",
  "Add this to my cart",
  "Tell me more about this product",
  "I'm just browsing today",
  "This seems expensive",
  "I want to checkout",
  "What do you recommend for me?"
];

export const VoiceHints = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  // Rotate through hints every 4 seconds
  useState(() => {
    const interval = setInterval(() => {
      setCurrentHint(prev => (prev + 1) % voiceExamples.length);
    }, 4000);
    return () => clearInterval(interval);
  });

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-card rounded-2xl p-4 mb-4 max-w-xs"
          >
            <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
              <MessageCircle size={16} />
              Try saying:
            </h3>
            
            <div className="space-y-2">
              {voiceExamples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: index === currentHint ? 1 : 0.5,
                    scale: index === currentHint ? 1.02 : 1
                  }}
                  className={`text-xs p-2 rounded-lg transition-colors ${\n                    index === currentHint \n                      ? 'bg-calm/20 text-calm border border-calm/30' \n                      : 'bg-white/5 text-white/70'\n                  }`}
                >\n                  \"{example}\"\n                </motion.div>\n              ))}\n            </div>\n          </motion.div>\n        )}\n      </AnimatePresence>\n\n      <motion.button\n        whileHover={{ scale: 1.05 }}\n        whileTap={{ scale: 0.95 }}\n        onClick={() => setIsExpanded(!isExpanded)}\n        className=\"glass-card p-3 rounded-full flex items-center gap-2 text-calm hover:text-calm/80 transition-colors\"\n      >\n        <Sparkles size={20} />\n        {!isExpanded && (\n          <span className=\"text-sm font-medium\">Voice Tips</span>\n        )}\n      </motion.button>\n    </div>\n  );\n};