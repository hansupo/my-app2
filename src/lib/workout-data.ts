import { format } from "date-fns"

export const exportWorkoutData = () => {
  const data = localStorage.getItem('workoutData');
  if (!data) {
    alert('No workout data to export');
    return;
  }

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workout-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importWorkoutData = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsedData = JSON.parse(content);
      
      // Basic validation of the data structure
      if (typeof parsedData === 'object' && parsedData !== null) {
        localStorage.setItem('workoutData', JSON.stringify(parsedData));
        // Refresh the page to load new data
        window.location.reload();
      } else {
        alert('Invalid data format');
      }
    } catch (error) {
      alert('Error reading file');
      console.error(error);
    }
  };
  reader.readAsText(file);
}; 