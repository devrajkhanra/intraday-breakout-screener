// UploadCSV.tsx
import Papa from 'papaparse';
import { useBreakoutStore } from '../store/useBreakoutStore';

const UploadCSV = () => {
  const setData = useBreakoutStore(state => state.setData);

  const handleCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        const parsed = result.data.map((row: any) => ({
          date: row['Date'],
          close: parseFloat(row['Close Price']),
          open: parseFloat(row['Open Price']),
          high: parseFloat(row['High Price']),
          low: parseFloat(row['Low Price']),
          volume: parseInt(row['Total Traded Quantity'].replace(/,/g, '')),
          deliveryQty: parseInt(row['Deliverable Qty'].replace(/,/g, '')),
        }));
        setData(parsed);
      }
    });
  };

  return (
    <input type="file" onChange={e => handleCSV(e.target.files[0])} />
  );
};

export default UploadCSV;
