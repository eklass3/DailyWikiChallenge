import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

export default function AnswerBar({onAnswerSubmit}) {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (input) {
      axios.get(`./api/search?search=${input}`)
        .then(res => { 
          setRecommendations(res.data.query.search);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [input]);

  return (
    <div style={{ width: "80%", margin: "0 auto" }}>
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
          placeholder="Search Wikipedia"
          className='input-focus'
        />
      </div>
      <button
        className='button'
        onClick={() => onAnswerSubmit(input)}
      >
        <b>Submit</b>
      </button>
    </div>
      {recommendations.length > 0 && input.length > 0 && !selected &&
        <div style={{ 
            borderRadius: "2px",
            fontFamily: "Arial",
            border: "1px solid #ccc",
            width: "100%",
            margin: 0
        }}>
          {recommendations.map((rec, index) => 
            <div className="search-hover-div" 
                key={index}
                onClick={()=> {
                    setInput(rec.title);
                    setSelected(true);
                }}>
              <p style={{fontSize: 12}}>{rec.title}</p>
            </div>
          )}
        </div>
      }
    </div>
  );
}