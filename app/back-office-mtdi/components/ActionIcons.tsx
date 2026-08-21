"use client";

// Petits boutons icônes réutilisables pour les actions de liste (modifier,
// supprimer, restaurer, activer/désactiver), avec info-bulle native (title).

type IconButtonProps = {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
};

const VARIANT_CLASSES: Record<string, string> = {
  default: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  danger: "text-gray-400 hover:text-red-600 hover:bg-red-50",
  success: "text-gray-400 hover:text-green-700 hover:bg-green-50",
};

function IconButton({ label, onClick, variant = "default", children }: IconButtonProps & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition-colors ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </button>
  );
}

export function EditIcon(props: Omit<IconButtonProps, "variant">) {
  return (
    <IconButton {...props}>
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IconButton>
  );
}

export function DeleteIcon(props: Omit<IconButtonProps, "variant">) {
  return (
    <IconButton {...props} variant="danger">
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IconButton>
  );
}

export function RestoreIcon(props: Omit<IconButtonProps, "variant">) {
  return (
    <IconButton {...props} variant="success">
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 10a8 8 0 1114.5 4.7M3 10V4m0 6h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IconButton>
  );
}

export function ToggleOnIcon(props: Omit<IconButtonProps, "variant">) {
  return (
    <IconButton {...props} variant="success">
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="8" width="18" height="8" rx="4" />
        <circle cx="16" cy="12" r="2.5" fill="currentColor" />
      </svg>
    </IconButton>
  );
}

export function ToggleOffIcon(props: Omit<IconButtonProps, "variant">) {
  return (
    <IconButton {...props}>
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="8" width="18" height="8" rx="4" />
        <circle cx="8" cy="12" r="2.5" fill="currentColor" />
      </svg>
    </IconButton>
  );
}
