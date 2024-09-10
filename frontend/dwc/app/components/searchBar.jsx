import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export default function SearchBar({list, onSearchFilter}) {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (input) {
        
    }
  }, [input]);

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%'}}>
        <FontAwesomeIcon
          icon={faSearch}
          style={{
            position: 'absolute',
            left: '10px',
            fontSize: '18px',
            color: '#888',
          }}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelected(false);
          }}
          placeholder="Search"
          className='input-search'
        />
      </div>
    </div>
    </div>
  );
}