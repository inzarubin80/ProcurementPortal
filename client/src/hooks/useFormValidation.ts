import { useState } from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const useFormValidation = () => {
  const [triedSave, setTriedSave] = useState(false);

  const validateExerciseForm = (form: any): ValidationResult => {
    const errors: string[] = [];
    const required = ['title', 'description', 'programming_language', 'category_id', 'code_to_remember'];
    
    required.forEach(field => {
      if (!form[field] || String(form[field]).trim() === '') {
        errors.push(`Поле "${getFieldLabel(field)}" обязательно для заполнения`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateCategoryForm = (form: any): ValidationResult => {
    const errors: string[] = [];
    const required = ['name', 'description', 'programming_language'];
    
    required.forEach(field => {
      if (!form[field] || String(form[field]).trim() === '') {
        errors.push(`Поле "${getFieldLabel(field)}" обязательно для заполнения`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      title: 'Название',
      description: 'Описание',
      programming_language: 'Язык программирования',
      category_id: 'Категория',
      code_to_remember: 'Код для запоминания',
      name: 'Название'
    };
    return labels[field] || field;
  };

  return {
    triedSave,
    setTriedSave,
    validateExerciseForm,
    validateCategoryForm
  };
}; 