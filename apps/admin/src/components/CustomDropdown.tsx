import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
  icon?: string;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
  triggerStyle?: React.CSSProperties;
  menuStyle?: React.CSSProperties;
  align?: 'left' | 'right';
  maxWidth?: string | number;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  size = 'md',
  className = '',
  style,
  triggerStyle,
  menuStyle,
  align = 'left',
  maxWidth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      className={`califnco-custom-dropdown ${isSmall ? 'size-sm' : 'size-md'} ${isOpen ? 'is-open' : ''} ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: maxWidth ? '100%' : 'auto',
        maxWidth: maxWidth || undefined,
        ...style,
      }}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="califnco-dropdown-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isSmall ? '0.35rem' : '0.65rem',
          width: '100%',
          padding: isSmall ? '0.275rem 0.6rem' : '0.5rem 0.85rem',
          fontSize: isSmall ? '0.775rem' : '0.85rem',
          fontWeight: isSmall ? 700 : 600,
          backgroundColor: 'var(--bg-surface, #ffffff)',
          color: 'var(--text-main, #0f172a)',
          border: `1px solid ${isOpen ? 'var(--primary, #208aef)' : 'var(--border-color, #e2e8f0)'}`,
          borderRadius: isSmall ? '6px' : '8px',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(32, 138, 239, 0.15)'
            : '0 1px 2px rgba(15, 23, 42, 0.04)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.15s ease',
          outline: 'none',
          userSelect: 'none',
          ...triggerStyle,
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, overflow: 'hidden' }}>
          {selectedOption?.icon && <span style={{ flexShrink: 0 }}>{selectedOption.icon}</span>}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'left',
            }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              style={{
                fontSize: '0.675rem',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'var(--primary-light, #e6f4fe)',
                color: 'var(--primary, #208aef)',
                fontWeight: 800,
                flexShrink: 0,
              }}>
              {selectedOption.badge}
            </span>
          )}
        </div>

        <svg
          width={isSmall ? '12' : '14'}
          height={isSmall ? '12' : '14'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.6,
            flexShrink: 0,
            marginLeft: '0.25rem',
          }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className="califnco-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align]: 0,
            minWidth: '100%',
            maxWidth: '380px',
            maxHeight: '280px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: isSmall ? '8px' : '10px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
            zIndex: 1050,
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeInSlide 0.15s ease-out',
            ...menuStyle,
          }}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`califnco-dropdown-item ${isSelected ? 'selected' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  width: '100%',
                  padding: isSmall ? '0.35rem 0.55rem' : '0.5rem 0.75rem',
                  fontSize: isSmall ? '0.775rem' : '0.825rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'var(--primary-light, #e6f4fe)' : 'transparent',
                  color: isSelected ? 'var(--primary-dark, #005bb5)' : 'var(--text-main, #0f172a)',
                  border: 'none',
                  borderRadius: isSmall ? '5px' : '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-subtle, #f1f5f9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  {option.icon && <span style={{ flexShrink: 0 }}>{option.icon}</span>}
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                    {option.label}
                  </span>
                  {option.badge && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary-light, #e6f4fe)',
                        color: 'var(--primary, #208aef)',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                      {option.badge}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <span
                    style={{
                      color: 'var(--primary, #208aef)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      marginLeft: '0.5rem',
                    }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
