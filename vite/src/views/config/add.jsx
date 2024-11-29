const handleFieldChange = useMemo(
    () =>
      debounce((groupIndex, pageIndex, fieldIndex, newValue) => {
        setData(prevData => {
          const updatedData = { ...prevData };
          const field = updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
          
          // Update the field's value
          field.val = { ...field.val, new: newValue };
  
          // Ensure the field is in selectedFields
          if (!selectedFields.includes(field.label)) {
            const newSelectedFields = [...selectedFields, field.label];
            setSelectedFields(newSelectedFields);
            localStorage.setItem('selectedFields', JSON.stringify(newSelectedFields));
          }
  
          // Save the value to localStorage only if the field is selected
          if (selectedFields.includes(field.label)) {
            localStorage.setItem(field.label, JSON.stringify({ ...field.val }));
          }
  
          return updatedData;
        });
      }, 500),
    [selectedFields]
  );
  
  const handleCheckboxChange = useCallback(
    (groupIndex, pageIndex, fieldIndex, isChecked) => {
      setData(prevData => {
        const updatedData = { ...prevData };
        const field = updatedData.payload.groups[groupIndex].pages[pageIndex].fields[fieldIndex];
  
        let updatedSelectedFields;
  
        if (isChecked) {
          updatedSelectedFields = [...selectedFields, field.label];
        } else {
          updatedSelectedFields = selectedFields.filter(label => label !== field.label)
          localStorage.removeItem(field.label);
        }
  
        setSelectedFields(updatedSelectedFields);
        localStorage.setItem('selectedFields', JSON.stringify(updatedSelectedFields));
        return updatedData;
      });
    },
    [selectedFields]
  );
  
  const handleSave = useCallback(() => {
    const selectedFieldValues = selectedFields.map(label => {
      const field = findFieldByLabel(label);
      return { label, value: field?.val };
    });
  
    // Save only selected fields to localStorage
    localStorage.setItem('savedValues', JSON.stringify(selectedFieldValues));
  }, [selectedFields]);
  