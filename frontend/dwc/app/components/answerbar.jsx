import { useState, useEffect } from 'react';
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
      <div style={{ display: "flex", flexDirection: "row" }}>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => {
            setInput(e.target.value)
            setSelected(false);
        }} 
        placeholder="Search..."
        className="input-focus"/>
        <button 
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #a2a9b1',
            borderRadius: '2px',
            padding: '10px 15px',
            fontSize: '14px',
            color: '#222',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onClick={()=>onAnswerSubmit(input)}
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