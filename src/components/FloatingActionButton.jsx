function FloatingActionButton({ onClick, ariaLabel = 'Quick Action' }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 md:right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white text-xl z-40 transition-all hover:scale-110"
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 1rem)' }}
      aria-label={ariaLabel}
    >
    </button>
  );
}

export default FloatingActionButton;

