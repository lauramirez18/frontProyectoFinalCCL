export function useThousandsFormat() {
    const formatThousands = (value) => {
      if (typeof value !== 'number') value = parseInt(value);
      if (isNaN(value)) return '0';
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
  
    return {
      formatThousands
    };
  }