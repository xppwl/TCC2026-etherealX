import React from 'react';

export default function Loader({ text = 'Carregando...' }) {
  return (
    <div className="loader">
      <span className="spin"></span> {text}
    </div>
  );
}
