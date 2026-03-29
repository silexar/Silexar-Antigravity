/**
 * 🎚️ COMPONENTE ACCORDION - Shadcn/UI Compatible
 * 
 * @description Accordion expandible para organizar contenido
 * en secciones colapsables
 */

'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

interface AccordionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════
// ACCORDION ROOT
// ═══════════════════════════════════════════════════════════════

interface AccordionProps {
  type?: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  children: React.ReactNode;
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ type = 'single', value, defaultValue, onValueChange, className, children, collapsible: _collapsible = true }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(() => {
      if (value !== undefined) {
        return Array.isArray(value) ? value : value ? [value] : [];
      }
      if (defaultValue !== undefined) {
        return Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
      }
      return [];
    });

    const currentValue = value !== undefined 
      ? (Array.isArray(value) ? value : value ? [value] : [])
      : internalValue;

    const handleValueChange = React.useCallback((newValue: string[]) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      if (onValueChange) {
        onValueChange(type === 'single' ? (newValue[0] || '') : newValue);
      }
    }, [value, onValueChange, type]);

    return (
      <AccordionContext.Provider
        value={{
          value: currentValue,
          onValueChange: handleValueChange,
          type,
        }}
      >
        <div ref={ref} className={cn('w-full', className)}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = 'Accordion';

// ═══════════════════════════════════════════════════════════════
// ACCORDION ITEM
// ═══════════════════════════════════════════════════════════════

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionItem() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error('useAccordionItem must be used within an AccordionItem');
  }
  return context;
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children }, ref) => {
    const { value: accordionValue } = useAccordion();
    const isOpen = accordionValue.includes(value);

    return (
      <AccordionItemContext.Provider value={{ value, isOpen }}>
        <div
          ref={ref}
          className={cn('border-b', className)}
          data-state={isOpen ? 'open' : 'closed'}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = 'AccordionItem';

// ═══════════════════════════════════════════════════════════════
// ACCORDION TRIGGER
// ═══════════════════════════════════════════════════════════════

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { value: accordionValue, onValueChange, type } = useAccordion();
    const { value, isOpen } = useAccordionItem();

    const handleClick = () => {
      if (type === 'single') {
        onValueChange(isOpen ? [] : [value]);
      } else {
        if (isOpen) {
          onValueChange(accordionValue.filter((v) => v !== value));
        } else {
          onValueChange([...accordionValue, value]);
        }
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline',
          '[&[data-state=open]>svg]:rotate-180',
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
        onClick={handleClick}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

// ═══════════════════════════════════════════════════════════════
// ACCORDION CONTENT
// ═══════════════════════════════════════════════════════════════

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children }, ref) => {
    const { isOpen } = useAccordionItem();

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden text-sm transition-all',
          isOpen ? 'animate-accordion-down' : 'animate-accordion-up h-0'
        )}
        data-state={isOpen ? 'open' : 'closed'}
      >
        <div className={cn('pb-4 pt-0', className)}>
          {children}
        </div>
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
