import { useCallback } from 'react';

const usePrint = () => {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
};

export default usePrint;
