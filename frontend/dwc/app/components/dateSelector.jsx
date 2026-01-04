import React, { useState, useEffect } from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

export default function DateSelector({ list, onListFilter }) {
  const [dates, setDates] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDates(groupDatesByDayMonthYear(list.map(item => item.date)));
    console.log(groupDatesByDayMonthYear(list.map(item => item.date)));
    setLoaded(true);
  }, [list]);

  function getUniqueValueForToday() {
    const date = new Date();
    const year = date.getFullYear();
    // getMonth() returns month starting from 0, so we add 1 to get the correct month number
    const month = ('0' + (date.getMonth() + 1)).slice(-2); 
    const day = ('0' + date.getDate()).slice(-2);
    return year + month + day;
  }

  function groupDatesByDayMonthYear(arr) {
  const result = [];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  arr.forEach(date => {
    if (date && date.length === 8 && date !== getUniqueValueForToday()) {
      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = parseInt(date.slice(6, 8), 10);

      // Year node
      let yearNode = result.find(item => item.id === year);
      if (!yearNode) {
        yearNode = { id: year, name: year, children: [] };
        result.push(yearNode);
      }

      // Month node
      let monthNode = yearNode.children.find(item => item.id === `${year}-${month}`);
      if (!monthNode) {
        monthNode = {
          id: `${year}-${month}`, // unique
          name: monthNames[parseInt(month, 10) - 1],
          children: []
        };
        yearNode.children.push(monthNode);
      }

      // Day node
      const dayId = `${year}-${month}-${String(day).padStart(2, '0')}`;
      if (!monthNode.children.find(item => item.id === dayId)) {
        monthNode.children.push({
          id: dayId,
          name: String(day).padStart(2, '0')
        });
      }
    }
  });

  return result;
}


  function filterByDate(dateValue) {

    let filteredList;

    if (dateValue.length == 2) {
      filteredList = list.filter(item => {
        // Ensure the item is a string and has at least 6 characters

        if (typeof item.date === 'string' && item.date.length >= 6) {
            // Extract the 5th and 6th characters (index 4 and 5)
            const substring = item.date.slice(4, 6);
            // Check if the substring matches the sequence
            return substring === dateValue;
        }
        return false;
      });

    } else if (dateValue.length == 4) {
      filteredList = list.filter(item => {
        // Ensure the item is a string and has at least 4 characters
        if (typeof item.date === 'string' && item.date.length >= 4) {
            // Extract the first four characters
            const substring = item.date.slice(0, 4);
            // Check if the substring matches the sequence
            return substring === dateValue;
        }
        return false;
      });
    } else {
      filteredList = list.filter(item => item.date === dateValue);
    }

    onListFilter(filteredList);
}
  
  const getItemLabel = (item) => item.name;

  return (
    <div style={{marginRight: 25, marginLeft: 25}}>
      {loaded && <RichTreeView items={dates} getItemLabel={getItemLabel} onItemClick={(event, itemId) => filterByDate(String(itemId))}/>}
    </div>
  );
}
