import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Logo Component - Reusable brand logo with theme support
 * @param {Object} props
 * @param {string} props.size - Size: 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.showText - Show text below logo
 * @param {string} props.to - Link destination (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.clickable - Make logo clickable (default: true if 'to' is provided)
 */
const Logo = ({ 
  size = 'md', 
  showText = false, 
  to = null, 
  className = '',
  clickable = true 
}) => {
  const { isDark } = useTheme();

  // Size mappings
  const sizeMap = {
    sm: 'h-10 w-10',      // 40px
    md: 'h-14 w-14',      // 56px
    lg: 'h-20 w-20',      // 80px
    xl: 'h-28 w-28',      // 112px
  };

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  // Logo image paths - different logos for light and dark themes
  const logoPath = isDark ? '/logo-dark.webp' : '/logo-light.webp';
  // Fallback to single logo if themed versions don't exist
  const fallbackLogoPath = '/logo.webp';

  // Logo content
  const logoContent = (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className={`${sizeMap[size]} relative transition-all duration-300 ${
          clickable && to ? 'cursor-pointer hover:scale-105' : ''
        }`}
        style={{
          filter: isDark 
            ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))' 
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
        }}
      >
        <img
          src={logoPath}
          alt="Les Rois Du Bois Logo"
          className="h-full w-full object-contain"
          onError={(e) => {
            // Try fallback logo first
            if (e.target.src !== fallbackLogoPath && !e.target.dataset.fallbackTried) {
              e.target.dataset.fallbackTried = 'true';
              e.target.src = fallbackLogoPath;
              return;
            }
            // If fallback also fails, show SVG version
            e.target.style.display = 'none';
            const svg = e.target.nextSibling;
            if (svg) svg.style.display = 'block';
          }}
        />
        {/* SVG Fallback - Golden circle with B and crown */}
        <svg
          className="h-full w-full"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'none' }}
        >
          {/* Background circle */}
          <circle cx="100" cy="100" r="95" fill="#FFD700" />
          <circle cx="100" cy="100" r="95" fill="url(#goldGradient)" />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
              <stop offset="100%" stopColor="#E6C200" stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Crown outline */}
          <path
            d="M 70 80 Q 85 65, 100 75 Q 115 65, 130 80 L 125 85 L 75 85 Z"
            stroke="#B39800"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Letter B */}
          <text
            x="100"
            y="130"
            fontSize="60"
            fontFamily="serif"
            fontWeight="bold"
            fill="#B39800"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            B
          </text>
          
          {/* Circular text path - ROIS D */}
          <path
            id="bottomArc"
            d="M 50 130 Q 50 165, 100 165 Q 150 165, 150 130"
            fill="none"
          />
          <text fill="#B39800" fontSize="14" fontFamily="serif">
            <textPath href="#bottomArc" startOffset="25%">
              ROIS D
            </textPath>
          </text>
          
          {/* Circular text path - TIS */}
          <path
            id="topArc"
            d="M 150 70 Q 150 35, 100 35 Q 50 35, 50 70"
            fill="none"
          />
          <text fill="#B39800" fontSize="14" fontFamily="serif">
            <textPath href="#topArc" startOffset="25%">
              TIS
            </textPath>
          </text>
        </svg>
      </div>
      {showText && (
        <span className={`mt-2 font-semibold ${textSizeMap[size]} ${
          isDark ? 'text-gold-400' : 'text-gold-600'
        }`}>
          Les Rois Du Bois
        </span>
      )}
    </div>
  );

  // Wrap in Link if 'to' is provided and clickable
  if (to && clickable) {
    return (
      <Link to={to} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;

