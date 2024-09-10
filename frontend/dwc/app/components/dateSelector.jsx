import React, { useState, useEffect } from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

export default function DateSelector({ list }) {
  const [dates, setDates] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDates(groupDatesByDayMonthYear(list.map(item => item.date)));
    console.log(groupDatesByDayMonthYear(list.map(item => item.date)));
    setLoaded(true);
  }, [list]);

  function groupDatesByDayMonthYear(arr) {
    const result = [];

    // Array to map month numbers to month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
  
    arr.forEach(date => {
      if (date && date.length === 8) { // Ensure date is in YYYYMMDD format
        const year = date.slice(0, 4);
        const month = date.slice(4, 6);
        const day = parseInt(date.slice(6, 8), 10); // Convert day to number
  
        // Find or create the year object
        let yearNode = result.find(item => item.id === parseInt(year, 10));
        if (!yearNode) {
          yearNode = {
            id: parseInt(year, 10),
            name: year,
            children: []
          };
          result.push(yearNode);
        }
  
        // Find or create the month object
        let monthNode = yearNode.children.find(item => item.id === month);
        if (!monthNode) {
        monthNode = {
            id: month,
            name: monthNames[month - 1], // Get the month name
            children: []
        };
        yearNode.children.push(monthNode);
        }
  
        // Add the day if it's not already present
        if (!monthNode.children.find(item => item.id === parseInt(year + month + String(day).padStart(2, '0'), 10))) {
          monthNode.children.push({
            id: parseInt(year + month + String(day).padStart(2, '0'), 10),
            name: String(day).padStart(2, '0')
          });
        }
      }
    });
  
    return result;
  }
  
  const getItemLabel = (item) => item.name;

  return (
    <div style={{marginRight: 25}}>
      {loaded && <RichTreeView items={dates} getItemLabel={getItemLabel}/>}
    </div>
  );
}
