import { Link } from 'react-router-dom';

function QuickActions({ actions = [] }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 justify-items-center">
      {actions.map((action) => (
        <Link
          key={action.name}
          to={action.path}
          className="icon-3d-container flex flex-col items-center justify-center p-2 cursor-pointer w-fit group"
        >
          <div 
            className={`icon-3d-circle w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-1 transition-all duration-300 group-hover:scale-110 relative`}
            style={{
              boxShadow: `
                0 4px 6px -1px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                0 0 0 1px rgba(0, 0, 0, 0.1),
                0 0 8px rgba(255, 255, 255, 0.3),
                0 0 12px rgba(255, 255, 255, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2)
              `,
              filter: 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `
                0 8px 16px -2px rgba(0, 0, 0, 0.4),
                0 4px 8px -2px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(0, 0, 0, 0.15),
                0 0 12px rgba(255, 255, 255, 0.4),
                0 0 18px rgba(255, 255, 255, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.25),
                inset 0 -2px 4px rgba(0, 0, 0, 0.3)
              `;
              e.currentTarget.style.filter = 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `
                0 4px 6px -1px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                0 0 0 1px rgba(0, 0, 0, 0.1),
                0 0 8px rgba(255, 255, 255, 0.3),
                0 0 12px rgba(255, 255, 255, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.2),
                inset 0 -2px 4px rgba(0, 0, 0, 0.2)
              `;
              e.currentTarget.style.filter = 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))';
            }}
          >
            <svg
              className="icon-3d-svg w-6 h-6 text-white transition-all duration-300 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))'
              }}
            >
              {action.icon}
            </svg>
          </div>
          <span className="text-xs font-medium text-emerald-400 dark:text-emerald-300 text-center transition-all duration-300 group-hover:text-emerald-300 dark:group-hover:text-emerald-200">
            {action.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default QuickActions;

