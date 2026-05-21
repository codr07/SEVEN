import React from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

const SignatureShareButton = ({ onClick, shareUrl, onShareSuccess, className = "" }) => {
  const handleShare = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (onClick) {
      onClick(e);
      return;
    }

    if (!shareUrl) return;

    // Use Web Share API if available (great for mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '5EVEN',
          url: shareUrl
        });
        if (onShareSuccess) onShareSuccess();
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn("Web Share API failed, falling back to copy:", err);
        } else {
          return; // User cancelled
        }
      }
    }

    // Clipboard API / Fallback copy
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      } catch (err) {
        console.warn("Clipboard API failed, trying fallback:", err);
      }
    }

    if (!copied) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
    }

    if (copied && onShareSuccess) {
      onShareSuccess();
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`p-3 bg-white/5 backdrop-blur-md rounded-[12px] border border-white/5 transition-all text-primary hover:bg-white/10 group/share relative ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.2, rotate: -15 }}
        whileTap={{ scale: 0.9 }}
        className="relative z-10"
      >
        <Share2 size={16} className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
      </motion.div>
    </button>
  );
};

export default SignatureShareButton;
