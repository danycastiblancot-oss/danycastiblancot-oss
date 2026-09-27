import React from 'react';
import { NotesCrudManager } from './NotesCrudManager';

interface SavedContentProps {
  onNavigateToVerse?: (book: string, chapter: number, verse?: number) => void;
  onDeleteItem?: (key: string) => void;
  onOpenAccount?: () => void;
}

export const SavedContent: React.FC<SavedContentProps> = ({ 
  onNavigateToVerse,
  onOpenAccount
}) => {
  return (
    <NotesCrudManager 
      onNavigateToVerse={onNavigateToVerse} 
      onOpenAccount={onOpenAccount}
    />
  );
};
