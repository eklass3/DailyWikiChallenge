import { useState, useEffect } from 'react';
import SubCategoryInit from './subCategoryInit';

const categoryData = require('./categories.json');

export default function CategoryInit() {

    console.log(categoryData);
   return(
    <div>
        <h2>Select Categories</h2>
        <p>We will use these selections to design your initial quiz. Our machine learning model will design your ideal quiz as you play.</p>
        {categoryData.map((cat, index) => {return <SubCategoryInit key={index} category={cat}/>})}
    </div>
   )
}