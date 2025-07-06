import React from 'react';

export default function LoadingSpinner({ message = "読み込み中..." }) {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
