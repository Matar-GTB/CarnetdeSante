// src/components/Messaging/EmojiPicker.jsx
import React from 'react';
import { IoClose } from 'react-icons/io5';
import './EmojiPicker.css';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  // Emojis fréquemment utilisés dans un contexte médical
  const frequentEmojis = [
    '👍', '👎', '❤️', '😊', '😢', '😮', '😡', '🤔',
    '👏', '🎉', '💯', '✅', '❌', '⭐', '🔥', '💪'
  ];

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
  };

  return (
    <div className="emoji-picker">
      <div className="emoji-picker-header">
        <span className="emoji-picker-title">Réactions</span>
        <button className="emoji-picker-close" onClick={onClose}>
          <IoClose />
        </button>
      </div>
      
      <div className="emoji-grid">
        {frequentEmojis.map((emoji, index) => (
          <button
            key={index}
            className="emoji-button"
            onClick={() => handleEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
