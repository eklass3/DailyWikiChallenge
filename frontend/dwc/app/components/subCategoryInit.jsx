import { useState, useEffect } from 'react';

export default function SubCategoryInit({category}) {

   return(
    <div>
        <h3>{category.title}</h3>
        {category.subcategories.map((subCat, index) => {return(
            <div key={index} style={{marginBottom: 5}}>
                <input type="checkbox" id="checkbox" />
                <label style={{marginLeft: 5}} htmlFor="checkbox">{subCat.title}</label>
            </div>
        )
        })}
    </div>
   )
}