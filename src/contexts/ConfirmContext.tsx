import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'danger' | 'info' | 'warning';
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  modalState: {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'info' | 'warning';
    confirmText: string;
    cancelText: string;
    resolve: (value: boolean) => void;
  } | null;
  closeModal: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ConfirmContextType['modalState']>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title,
        message: options.message,
        type: options.type || 'danger',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Discard',
        resolve: (value: boolean) => {
          resolve(value);
          setModalState(null);
        },
      });
    });
  };

  const closeModal = () => {
    if (modalState) {
      modalState.resolve(false);
      setModalState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, modalState, closeModal }}>
      {children}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
