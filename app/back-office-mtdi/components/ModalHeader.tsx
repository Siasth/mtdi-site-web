"use client";

// ANO-121 : icône de fermeture cohérente pour toutes les modales du
// back-office. type="button" est important : ces modales contiennent des
// <form>, et sans ça un clic sur la croix soumettrait le formulaire.
export function ModalCloseButton({ onClick, label = "Fermer" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </button>
  );
}

// En-tête de modale standard : titre à gauche, croix de fermeture à droite.
export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
      <ModalCloseButton onClick={onClose} />
    </div>
  );
}
