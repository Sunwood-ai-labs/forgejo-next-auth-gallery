"use client";

import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    // モーダルのコンテンツ部分以外がクリックされた場合のみ閉じる
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div id="modal" className="modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="modalTitle">{title}</h3>
          <button className="modal-close" id="modalClose" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body" id="modalBody">
          {children}
        </div>
      </div>
    </div>
  );
}
