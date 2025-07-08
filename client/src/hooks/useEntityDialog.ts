import { useState } from 'react';

interface UseEntityDialogReturn {
  openDialog: boolean;
  dialogType: 'add' | 'edit';
  entityType: 'exercise' | 'category';
  editItem: any;
  form: any;
  triedSave: boolean;
  openAddDialog: (type: 'exercise' | 'category') => void;
  openEditDialog: (type: 'exercise' | 'category', item: any) => void;
  closeDialog: () => void;
  setForm: (form: any) => void;
  setTriedSave: (tried: boolean) => void;
  handleFormChange: (e: any) => void;
}

export const useEntityDialog = (): UseEntityDialogReturn => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [editItem, setEditItem] = useState<any>(null);
  const [entityType, setEntityType] = useState<'exercise' | 'category'>('exercise');
  const [form, setFormState] = useState<any>({});
  const [triedSave, setTriedSaveState] = useState(false);

  const openAddDialog = (type: 'exercise' | 'category') => {
    setEntityType(type);
    setDialogType('add');
    setFormState({});
    setEditItem(null);
    setOpenDialog(true);
  };

  const openEditDialog = (type: 'exercise' | 'category', item: any) => {
    setEntityType(type);
    setDialogType('edit');
    if (type === 'category') {
      setFormState({ ...item, category_id: item.id });
    } else {
      setFormState(item);
    }
    setEditItem(item);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setTriedSaveState(false);
  };

  const setForm = (form: any) => {
    setFormState(form);
  };

  const setTriedSave = (tried: boolean) => {
    setTriedSaveState(tried);
  };

  const handleFormChange = (e: any) => {
    setFormState({ ...form, [e.target.name]: e.target.value });
  };

  return {
    openDialog,
    dialogType,
    entityType,
    editItem,
    form,
    triedSave,
    openAddDialog,
    openEditDialog,
    closeDialog,
    setForm,
    setTriedSave,
    handleFormChange,
  };
}; 